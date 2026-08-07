from .. import models, schemas, utils, oauth2
from fastapi import FastAPI, Response,status,HTTPException, Depends, APIRouter
from sqlmodel import Session
from sqlmodel import SQLModel
from sqlmodel import select, func
from ..database import engine, get_db
from typing import List, Optional


router = APIRouter(prefix="/posts"
                   , tags=['Posts'])


@router.get("/", response_model=List[schemas.PostOut])
def get_posts(db: Session = Depends(get_db), limit:int=10, skip:int = 0, search: Optional[str] = ""):
    #cursor.execute("""SELECT * FROM posts""")
    #posts = cursor.fetchall()

    posts = db.exec(select(models.Post).where(models.Post.title.contains(search)).limit(limit).offset(skip)).all()
    results = db.exec(select(models.Post, func.count(models.Vote.post_id).label("votes"))
                .join(models.Vote, models.Vote.post_id == models.Post.id, isouter=True)
                .where(models.Post.title.contains(search))
                .group_by(models.Post.id)
                .limit(limit)
                .offset(skip)).all()
    formatted_results = [{**post.model_dump(), "votes": votes, "owner":post.owner} for post, votes in results]

    return formatted_results




@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.Post)
def create_posts(post: schemas.PostCreate, db: Session = Depends(get_db), current_user:int = Depends(oauth2.get_current_user)):
    #cursor.execute("""INSERT INTO posts (name, content, published) VALUES (%s,%s,%s) RETURNING *""", (post.title, post.content, post.published))
    #new_post = cursor.fetchone()
    #conn.commit()
    new_post=models.Post(owner_id=current_user.id, **post.model_dump())
    db.add(new_post)
    db.commit()
    db.refresh(new_post)


    return new_post

@router.get("/{id}", response_model=schemas.PostOut) #{id} is called a path parameter
def get_post(id: int, response: Response,db: Session = Depends(get_db), current_user:int = Depends(oauth2.get_current_user)):
    #cursor.execute("""SELECT * FROM posts WHERE id = %s""",(str(id),))
    #post = cursor.fetchone()
    result = db.exec(select(models.Post, func.count(models.Vote.post_id).label("votes"))
                .join(models.Vote, models.Vote.post_id == models.Post.id, isouter=True)
                .where(models.Post.id == id)
                .group_by(models.Post.id)).first()
    #print(current_user.email)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"post with id {id} was not found")
        #response.status_code = status.HTTP_404_NOT_FOUND
        #return {"message":f"Post with id {id} was not found"}
    post, votes = result
    formatted_result = {
        **post.model_dump(), # or .dict() depending on Pydantic version
        "votes": votes,
        "owner": post.owner
    }
    return formatted_result

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(id: int, db: Session = Depends(get_db), current_user:int = Depends(oauth2.get_current_user)):
    
    #cursor.execute("""DELETE FROM posts WHERE id = %s RETURNING *""",(str(id),))
    #deleted_post = cursor.fetchone()
    #conn.commit()
    deleted_post = db.exec(select(models.Post).where(models.Post.id == id))
    result = deleted_post.first()


    if result == None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"post with id: {id} does not exist")
    
    if result.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="not authorized to perform requested action")
    db.delete(result)
    db.commit()


    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.put("/{id}", response_model=schemas.Post)
def create_post(id:int, post: schemas.PostCreate, db: Session = Depends(get_db), current_user:int = Depends(oauth2.get_current_user)):
    #cursor.execute("""UPDATE posts SET name = %s, content=%s, published=%s WHERE id = %s RETURNING *""", (post.title, post.content, post.published, str(id)))
    #updated_post = cursor.fetchone()
    #conn.commit()
    updated_post = db.exec(select(models.Post).where(models.Post.id == id)).first()
    u_post_data= post.model_dump(exclude_unset=True)

    if updated_post == None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"post with id: {id} does not exist")
    
    if updated_post.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="not authorized to perform requested action")

    for key,value in u_post_data.items():
        setattr(updated_post, key, value)
    
    db.add(updated_post)
    db.commit()
    db.refresh(updated_post)



    return updated_post