from fastapi import FastAPI, Response,status,HTTPException, Depends, APIRouter
from .. import database, models, schemas, oauth2
from sqlmodel import Session, select

router = APIRouter(prefix='/vote', tags=['Vote'])

@router.post("/", status_code=status.HTTP_201_CREATED)
def vote(vote: schemas.Vote, db: Session = Depends(database.get_db), current_user: int = Depends(oauth2.get_current_user) ):
    posto = db.exec(select(models.Post).where(models.Post.id== vote.post_id)).first()
    if not posto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"post with id {vote.post_id} does not exist")
    
    
    vote_query = db.exec(select(models.Vote).where(models.Vote.post_id == vote.post_id, models.Vote.user_id==current_user.id))
    found_vote = vote_query.first()
    if(vote.dir == 1):
        if(found_vote):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"user {current_user.id} has already voted on post {vote.post_id}")
        new_vote = models.Vote(post_id=vote.post_id, user_id=current_user.id)
        db.add(new_vote)
        db.commit()
        return{"message":"Successfully added vote"}
    
    elif(vote.dir ==0):
        if not found_vote:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Vote does not exist")
        db.delete(found_vote)
        db.commit()
        return{"message":"successfully deleted vote"}