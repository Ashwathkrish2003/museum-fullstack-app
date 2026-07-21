from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.auth import get_current_user
from app import models

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total_artists = db.query(func.count(models.Artist.id)).scalar()
    total_artworks = db.query(func.count(models.Artwork.id)).scalar()

    top_nationalities = (
        db.query(models.Artist.nationality, func.count(models.Artist.id).label("count"))
        .filter(models.Artist.nationality.isnot(None))
        .group_by(models.Artist.nationality)
        .order_by(func.count(models.Artist.id).desc())
        .limit(5)
        .all()
    )

    top_departments = (
        db.query(models.Artwork.department, func.count(models.Artwork.id).label("count"))
        .filter(models.Artwork.department.isnot(None))
        .group_by(models.Artwork.department)
        .order_by(func.count(models.Artwork.id).desc())
        .limit(5)
        .all()
    )

    return {
        "total_artists": total_artists,
        "total_artworks": total_artworks,
        "top_nationalities": [
            {"nationality": n, "count": c} for n, c in top_nationalities
        ],
        "top_departments": [
            {"department": d, "count": c} for d, c in top_departments
        ],
    }
