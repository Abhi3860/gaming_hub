from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from ..database import get_db
from ..models import Game, Library, User
from ..config import settings
from ..oauth2 import get_current_user 
import httpx
import random
from .. import schemas
from sqlalchemy.orm import selectinload

router = APIRouter(
    prefix="/library",
    tags=["Library"]
)

@router.post("/sync/steam/{steam_id}")
async def sync_steam_library(
    steam_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    steam_url = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/"
    
    params = {
        "key": settings.steam_api_key,
        "steamid": steam_id,
        "include_appinfo": 1,
        "include_played_free_games": 1,
        "format": "json"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(steam_url, params=params)
        
        if response.status_code != 200:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to fetch from Steam")
            
        data = response.json()
        
        if "response" not in data or "games" not in data["response"]:
            return {"message": "No games found or profile is private."}
            
        games = data["response"]["games"]
        
        for item in games:
            game = db.exec(select(Game).where(Game.external_id == item["appid"])).first()
            
            steam_image_url = f"https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/{item['appid']}/header.jpg"
            
            if not game:
                game = Game(
                    external_id=item["appid"],
                    title=item["name"],
                    cover_image_url=steam_image_url
                )
                db.add(game)
                db.commit()
                db.refresh(game)
            elif not game.cover_image_url:

                game.cover_image_url = steam_image_url
                db.add(game)
                db.commit()
                db.refresh(game)
            
            playtime_hours = round(item.get("playtime_forever", 0) / 60.0, 1)
            
            library_item = db.exec(
                select(Library).where(
                    Library.user_id == current_user.id,
                    Library.game_id == game.id
                )
            ).first()
            
            if not library_item:
                library_item = Library(
                    user_id=current_user.id,
                    game_id=game.id,
                    playtime_hours=playtime_hours
                )
                db.add(library_item)
            else:
                library_item.playtime_hours = playtime_hours
                db.add(library_item)
                
            db.commit()
            
        return {"message": f"Successfully synced {len(games)} games to your library."}

@router.get("/", response_model=list[schemas.LibraryResponse])
async def get_user_library(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    statement = (
        select(Library)
        .where(Library.user_id == current_user.id)
        .options(selectinload(Library.game))
    )
    
    library_entries = db.exec(statement).all()
    return library_entries

@router.post("/manual", status_code=status.HTTP_201_CREATED)
async def add_manual_game(
    game_data: schemas.ManualGameAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    game = db.exec(select(Game).where(Game.title.ilike(game_data.title))).first()
    
    if not game:
        custom_external_id = -random.randint(100000, 9999999)
        
        game = Game(
            external_id=custom_external_id,
            title=game_data.title,
            cover_image_url=game_data.cover_image_url
        )
        db.add(game)
        db.commit()
        db.refresh(game)
        
    library_item = db.exec(
        select(Library).where(
            Library.user_id == current_user.id,
            Library.game_id == game.id
        )
    ).first()
    
    if library_item:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, 
            detail="This game is already in your library."
        )
        
    new_library_item = Library(
        user_id=current_user.id,
        game_id=game.id,
        playtime_hours=game_data.playtime_hours,
        status=game_data.status
    )
    db.add(new_library_item)
    db.commit()
    
    return {"message": f"Successfully added '{game.title}' to your library."}

@router.patch("/{game_id}/playtime")
async def update_playtime(
    game_id: int,
    playtime_data: schemas.PlaytimeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    library_item = db.exec(
        select(Library).where(
            Library.user_id == current_user.id,
            Library.game_id == game_id
        )
    ).first()
    
    if not library_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Game not found in your library."
        )
        
    library_item.playtime_hours += playtime_data.added_hours

    library_item.playtime_hours = round(library_item.playtime_hours, 2)
    
    db.add(library_item)
    db.commit()
    db.refresh(library_item)
    
    return {"message": f"Added {playtime_data.added_hours} hours. Total playtime is now {library_item.playtime_hours} hours."}

@router.get("/simple", response_model=list[schemas.TrackerListResponse])
async def get_simple_library(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    statement = (
        select(Library)
        .where(Library.user_id == current_user.id)
        .options(selectinload(Library.game))
    )
    
    library_entries = db.exec(statement).all()
    

    simple_list = [
        {
            "game_id": item.game_id, 
            "title": item.game.title
        } 
        for item in library_entries if item.game
    ]
    
    return simple_list