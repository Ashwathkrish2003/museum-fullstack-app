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

    top_named_dept = named_dept[:4] if unknown_dept_count > 0 else named_dept[:5]
    department_rows: list[dict] = [
        {"department": d, "count": c} for d, c in top_named_dept
    ]
    if unknown_dept_count > 0:
        department_rows.append({"department": "Unknown", "count": unknown_dept_count})

    # ── Top Classifications ──────────────────────────────────────────────
    raw_classifications = (
        db.query(models.Artwork.classification, func.count(models.Artwork.id).label("count"))
        .group_by(models.Artwork.classification)
        .order_by(func.count(models.Artwork.id).desc())
        .all()
    )

    unknown_class_count = 0
    named_class: list[tuple[str, int]] = []
    for cls, cnt in raw_classifications:
        if not cls or not cls.strip():
            unknown_class_count += cnt
        else:
            named_class.append((cls.strip(), cnt))

    top_named_class = named_class[:4] if unknown_class_count > 0 else named_class[:5]
    classification_rows: list[dict] = [
        {"classification": cl, "count": c} for cl, c in top_named_class
    ]
    if unknown_class_count > 0:
        classification_rows.append({"classification": "Unknown", "count": unknown_class_count})

    # ── Gender Breakdown ─────────────────────────────────────────────────
    gender_label = case(
        (models.Artist.gender.is_(None), literal("Unknown")),
        (models.Artist.gender == "", literal("Unknown")),
        else_=models.Artist.gender,
    )
    raw_genders = (
        db.query(gender_label.label("gender"), func.count(models.Artist.id).label("count"))
        .group_by(gender_label)
        .all()
    )

    gender_counts = {g: c for g, c in raw_genders}
    gender_order = ["Male", "Female", "Others", "Not Disclose", "Unknown"]

    gender_rows: list[dict] = []
    for g in gender_order:
        if g in gender_counts and gender_counts[g] > 0:
            gender_rows.append({"gender": g, "count": gender_counts[g]})

    return {
        "total_artists": total_artists,
        "total_artworks": total_artworks,
        "top_nationalities": nationality_rows,
        "top_departments": department_rows,
        "gender_breakdown": gender_rows,
        "top_classifications": classification_rows,
    }
