from pydantic import BaseModel, ConfigDict, EmailStr, Field
from datetime import datetime
from typing import Annotated, Optional
from pydantic import conint


# class PostBase(BaseModel):
#     title: str
#     content: str
#     published: bool = True

# class PostCreate(PostBase):
#     pass

class GameCreate(BaseModel):
    external_id: int
    title: str
    cover_image_url: Optional[str] = None

class LibraryAdd(BaseModel):
    game_id: int
    playtime_hours: float

class GameOut(BaseModel):
    id: int
    external_id: int
    title: str
    cover_image_url: Optional[str] = None

    class Config:
        from_attributes = True

class LibraryResponse(BaseModel):
    game_id: int
    status: str
    playtime_hours: float
    game: GameOut

    class Config:
        from_attributes = True

class UserOut(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# class Post(PostBase):
#     id : int
#     created_at: datetime
#     owner_id : int
#     owner: UserOut

#     model_config = ConfigDict(from_attributes=True)

# class PostOut(Post):
    
#     votes:int

#     model_config = ConfigDict(from_attributes=True)

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., max_length=72)



class UserLogin(BaseModel):
    email:EmailStr
    password:str

class Token(BaseModel):
    access_token: str
    token_type:str

class TokenData(BaseModel):
    id: Optional[str] = None

# class Vote(BaseModel):
#     post_id:int
#     dir: Annotated[int, Field(strict=True, le=1)]
class ManualGameAdd(BaseModel):
    title: str
    playtime_hours: float = 0.0
    status: str = "Backlog"
    cover_image_url: str | None = None

class PlaytimeUpdate(BaseModel):
    added_hours: float

class TrackerListResponse(BaseModel):
    game_id: int
    title: str