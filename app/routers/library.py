from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from ..database import get_db
from ..models import Game, Library, User
from ..config import settings
from ..oauth2 import get_current_user  # Import current user dependency
import httpx
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
            if not game:
                game = Game(
                    external_id=item["appid"],
                    title=item["name"],
                )
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
    # Fetch all library entries belonging to the authenticated user
    statement = (
        select(Library)
        .where(Library.user_id == current_user.id)
        .options(selectinload(Library.game))
    )
    
    library_entries = db.exec(statement).all()
    return library_entries