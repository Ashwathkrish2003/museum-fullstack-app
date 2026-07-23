from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case, literal

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

    # ── Top Nationalities ────────────────────────────────────────────────
    # Fetch every nationality group (including NULLs) with no DB-side limit
    # so we can do the full "Unknown / Others" bucketing in Python.
    raw_nationalities = (
        db.query(models.Artist.nationality, func.count(models.Artist.id).label("count"))
        .group_by(models.Artist.nationality)
        .order_by(func.count(models.Artist.id).desc())
        .all()
    )

    unknown_nat_count = 0
    named_nat: list[tuple[str, int]] = []
    for nat, cnt in raw_nationalities:
        if not nat or not nat.strip():
            unknown_nat_count += cnt
        else:
            named_nat.append((nat.strip(), cnt))

    # top 4 named, everything else → "Others"
    top4_nat = named_nat[:4]
    others_nat_count = sum(c for _, c in named_nat[4:])

    nationality_rows: list[dict] = [
        {"nationality": n, "count": c} for n, c in top4_nat
    ]
    if others_nat_count > 0:
        nationality_rows.append({"nationality": "Others", "count": others_nat_count})
    if unknown_nat_count > 0:
        nationality_rows.append({"nationality": "Unknown", "count": unknown_nat_count})

    # ── Top Departments ──────────────────────────────────────────────────
    # Fetch every department group (including NULLs) so Unknown competes
    # naturally; never surface blank strings.
    raw_departments = (
        db.query(models.Artwork.department, func.count(models.Artwork.id).label("count"))
        .group_by(models.Artwork.department)
        .order_by(func.count(models.Artwork.id).desc())
        .all()
    )

    unknown_dept_count = 0
    named_dept: list[tuple[str, int]] = []
    for dept, cnt in raw_departments:
        if not dept or not dept.strip():
            unknown_dept_count += cnt
        else:
            named_dept.append((dept.strip(), cnt))

    # build the top-5 list; Unknown slot competes by count
    dept_candidates = [(n, c) for n, c in named_dept]
    if unknown_dept_count > 0:
        dept_candidates.append(("Unknown", unknown_dept_count))
    dept_candidates.sort(key=lambda x: x[1], reverse=True)
    top5_dept = dept_candidates[:5]

    department_rows: list[dict] = [
        {"department": d, "count": c} for d, c in top5_dept
    ]

    gender_label = case(
        (models.Artist.gender.is_(None), literal("Unknown")),
        (models.Artist.gender == "", literal("Unknown")),
        else_=models.Artist.gender,
    )
    gender_breakdown = (
        db.query(gender_label.label("gender"), func.count(models.Artist.id).label("count"))
        .group_by(gender_label)
        .order_by(func.count(models.Artist.id).desc())
        .all()
    )

    classification_label = case(
        (models.Artwork.classification.is_(None), literal("Unknown")),
        (models.Artwork.classification == "", literal("Unknown")),
        else_=models.Artwork.classification,
    )
    top_classifications = (
        db.query(classification_label.label("classification"), func.count(models.Artwork.id).label("count"))
        .group_by(classification_label)
        .order_by(func.count(models.Artwork.id).desc())
        .limit(5)
        .all()
    )

    return {
        "total_artists": total_artists,
        "total_artworks": total_artworks,
        "top_nationalities": nationality_rows,
        "top_departments": department_rows,
        "gender_breakdown": [
            {"gender": g, "count": c} for g, c in gender_breakdown
        ],
        "top_classifications": [
            {"classification": cl, "count": c} for cl, c in top_classifications
        ],
    }
