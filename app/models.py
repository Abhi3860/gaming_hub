from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import text # We still use text for server_default


class Note(SQLModel, table=True):
    __tablename__ = "notes"
    
    id: int = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", ondelete="CASCADE")
    game_id: int = Field(foreign_key="games.id", ondelete="CASCADE")
    
    title: str = Field(index=True)
    content: Optional[str] = Field(default=None) # For text notes
    image_url: Optional[str] = Field(default=None) # For screenshot links
    
    created_at: Optional[datetime] = Field(
        default=None, 
        sa_column_kwargs={"server_default": text("now()")}
    )
    user: Optional["User"] = Relationship(back_populates="notes")
    game: Optional["Game"] = Relationship(back_populates="notes")

class User(SQLModel, table=True):
    __tablename__="users"
    id: int = Field(default=None, primary_key=True)
    email: str = Field(nullable=False, unique=True)
    password:str = Field(nullable=False)
    created_at: Optional[datetime] = Field(
        default=None, 
        sa_column_kwargs={"server_default": text("now()")}
    )
    libraries: list["Library"] = Relationship(back_populates="user")
    notes: list["Note"] = Relationship(back_populates="user")

# class Vote(SQLModel, table=True):
#     __tablename__="votes"
#     user_id: int = Field(foreign_key="users.id", ondelete="CASCADE", primary_key=True)
#     post_id:int = Field(foreign_key="posts.id", ondelete="CASCADE", primary_key=True)

class Game(SQLModel, table=True):
    __tablename__ = "games"
    
    id: int = Field(default=None, primary_key=True)
    external_id: int = Field(index=True) 
    title: str = Field(index=True)
    cover_image_url: Optional[str] = Field(default=None)
    libraries: list["Library"] = Relationship(back_populates="game")
    notes: list["Note"] = Relationship(back_populates="game")

class Library(SQLModel, table=True):
    __tablename__ = "libraries"

    status: str = Field(default="Backlog")
    user_id: int = Field(foreign_key="users.id", primary_key=True, ondelete="CASCADE")
    game_id: int = Field(foreign_key="games.id", primary_key=True, ondelete="CASCADE")
    
    playtime_hours: float = Field(default=0.0)

    user: Optional[User] = Relationship(back_populates="libraries")
    game: Optional[Game] = Relationship(back_populates="libraries")
