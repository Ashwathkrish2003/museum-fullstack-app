from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.auth import get_current_user
from app import models, schemas

router = APIRouter(
    prefix="/artists",
    tags=["artists"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/", response_model=List[schemas.ArtistOut])
def list_artists(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    artists = db.query(models.Artist).offset(skip).limit(limit).all()
    return artists


@router.post("/", response_model=schemas.ArtistOut, status_code=status.HTTP_201_CREATED)
def create_artist(artist: schemas.ArtistCreate, db: Session = Depends(get_db)):
    db_artist = models.Artist(**artist.dict())
    db.add(db_artist)
    db.commit()
    db.refresh(db_artist)
    return db_artist


@router.post("/bulk", response_model=List[schemas.ArtistOut], status_code=status.HTTP_201_CREATED)
def bulk_create_artists(payload: schemas.ArtistBulkCreate, db: Session = Depends(get_db)):
    db_artists = [models.Artist(**a.dict()) for a in payload.artists]
    db.bulk_save_objects(db_artists)
    db.commit()
    # Re-query to return inserted records with IDs
    return db.query(models.Artist).order_by(models.Artist.id.desc()).limit(len(db_artists)).all()


@router.delete("/{artist_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_artist(artist_id: int, db: Session = Depends(get_db)):
    artist = db.query(models.Artist).filter(models.Artist.id == artist_id).first()
    if not artist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artist not found")
    db.delete(artist)
    db.commit()
    return None


@router.post("/bulk-delete", status_code=status.HTTP_204_NO_CONTENT)
def bulk_delete_artists(payload: schemas.BulkDeleteRequest, db: Session = Depends(get_db)):
    db.query(models.Artist).filter(models.Artist.id.in_(payload.ids)).delete(synchronize_session=False)
    db.commit()
    return None
