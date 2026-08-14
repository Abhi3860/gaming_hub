from fastapi import FastAPI
from .database import engine, get_db
from sqlmodel import SQLModel
from sqlmodel import select
from .routers import user, auth, library, note
from .config import settings
from fastapi.middleware.cors import CORSMiddleware
import os
from fastapi.staticfiles import StaticFiles

#SQLModel.metadata.create_all(engine)
app = FastAPI()
os.makedirs("uploads/notes", exist_ok=True)
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(user.router)
app.include_router(auth.router)
app.include_router(library.router)
app.include_router(note.router)


@app.get("/")
def get_user(): #normal python function
    return {"message": "bind mount"} #this gets sent back to the user, also this a dictionary
#the dictionary is converted to json









