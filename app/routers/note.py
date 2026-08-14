import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlmodel import Session, select
from ..database import get_db
from ..models import Note, Game, User
from ..oauth2 import get_current_user
from .. import schemas

router = APIRouter(
    prefix="/notes",
    tags=["Notes"]
)

UPLOAD_DIR = "uploads/notes"

@router.post("/game/{game_id}", response_model=schemas.NoteOut, status_code=status.HTTP_201_CREATED)
async def create_note(
    game_id: int,
    title: str = Form(...),
    content: str | None = Form(None),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    game = db.exec(select(Game).where(Game.id == game_id)).first()
    if not game:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Game not found")

    image_path = None

    if image:
        file_extension = image.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_location = os.path.join(UPLOAD_DIR, unique_filename)
        
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
            
        image_path = f"/{file_location.replace(os.sep, '/')}"

    new_note = Note(
        user_id=current_user.id,
        game_id=game_id,
        title=title,
        content=content,
        image_url=image_path
    )
    
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    
    return new_note

@router.get("/game/{game_id}", response_model=list[schemas.NoteOut])
async def get_game_notes(
    game_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    statement = select(Note).where(Note.user_id == current_user.id, Note.game_id == game_id)
    notes = db.exec(statement).all()
    
    return notes