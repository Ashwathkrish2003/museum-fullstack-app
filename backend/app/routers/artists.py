from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import re

from app.database import get_db
from app.auth import get_current_user
from app import models, schemas

router = APIRouter(
    prefix="/artists",
    tags=["artists"],
    dependencies=[Depends(get_current_user)],
)

# Valid gender options (canonical stored forms)
_GENDER_OPTIONS = {"male": "Male", "female": "Female", "others": "Others", "not disclose": "Not Disclose"}


def _clean(value: str | None, title_case: bool = True) -> str | None:
    """Trim, collapse spaces, and optionally title-case a string field."""
    if value is None:
        return None
    value = re.sub(r'\s+', ' ', value.strip())
    if not value:
        return None
    return value.title() if title_case else value


def normalize_artist(data: dict) -> dict:
    """Return a copy of data with all text fields normalised."""
    return {
        **data,
        # Name: preserve original casing — only trim + collapse spaces
        "name":        _clean(data.get("name"), title_case=False) or data.get("name", ""),
        # Categorical fields: Title Case
        "nationality": _clean(data.get("nationality")),
        "gender":      _clean(data.get("gender")),
    }


@router.get("/", response_model=List[schemas.ArtistOut])
def list_artists(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    artists = db.query(models.Artist).offset(skip).limit(limit).all()
    return artists


@router.post("/", response_model=schemas.ArtistOut, status_code=status.HTTP_201_CREATED)
def create_artist(artist: schemas.ArtistCreate, db: Session = Depends(get_db)):
    db_artist = models.Artist(**normalize_artist(artist.dict()))
    db.add(db_artist)
    db.commit()
    db.refresh(db_artist)
    return db_artist


@router.post("/bulk", response_model=List[schemas.ArtistOut], status_code=status.HTTP_201_CREATED)
def bulk_create_artists(payload: schemas.ArtistBulkCreate, db: Session = Depends(get_db)):
    db_artists = [models.Artist(**normalize_artist(a.dict())) for a in payload.artists]
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

