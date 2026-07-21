from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.auth import get_current_user
from app import models, schemas

router = APIRouter(
    prefix="/artworks",
    tags=["artworks"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/", response_model=List[schemas.ArtworkOut])
def list_artworks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    artworks = db.query(models.Artwork).offset(skip).limit(limit).all()
    return artworks


@router.post("/", response_model=schemas.ArtworkOut, status_code=status.HTTP_201_CREATED)
def create_artwork(artwork: schemas.ArtworkCreate, db: Session = Depends(get_db)):
    db_artwork = models.Artwork(**artwork.dict())
    db.add(db_artwork)
    db.commit()
    db.refresh(db_artwork)
    return db_artwork


@router.post("/bulk", response_model=List[schemas.ArtworkOut], status_code=status.HTTP_201_CREATED)
def bulk_create_artworks(payload: schemas.ArtworkBulkCreate, db: Session = Depends(get_db)):
    db_artworks = [models.Artwork(**a.dict()) for a in payload.artworks]
    db.bulk_save_objects(db_artworks)
    db.commit()
    # Re-query to return inserted records with IDs
    return db.query(models.Artwork).order_by(models.Artwork.id.desc()).limit(len(db_artworks)).all()


@router.delete("/{artwork_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_artwork(artwork_id: int, db: Session = Depends(get_db)):
    artwork = db.query(models.Artwork).filter(models.Artwork.id == artwork_id).first()
    if not artwork:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artwork not found")
    db.delete(artwork)
    db.commit()
    return None


@router.post("/bulk-delete", status_code=status.HTTP_204_NO_CONTENT)
def bulk_delete_artworks(payload: schemas.BulkDeleteRequest, db: Session = Depends(get_db)):
    db.query(models.Artwork).filter(models.Artwork.id.in_(payload.ids)).delete(synchronize_session=False)
    db.commit()
    return None
