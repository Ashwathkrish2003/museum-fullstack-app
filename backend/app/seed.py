import csv
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

from app.models import Base, User, Artist, Artwork

# For testing locally, we provide a default SQLite fallback if PostgreSQL is not available,
# or we can rely on a database URL env variable.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./museum.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def clean_int(value):
    if not value:
        return None
    try:
        return int(float(value)) # handles cases like '1930.0' or '1930'
    except (ValueError, TypeError):
        return None

def seed_data():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if data already exists
    if db.query(User).count() > 0 or db.query(Artist).count() > 0:
        print("Data already exists. Skipping seed.")
        db.close()
        return

    # Seed Admin User
    admin = User(
        username="admin",
        hashed_password=get_password_hash("admin123")
    )
    db.add(admin)
    db.commit()

    # Seed Artists
    artists_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'artists.csv')
    artists_count = 0
    print("Seeding artists...")
    with open(artists_file, newline='', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            artist = Artist(
                id=clean_int(row.get('Artist ID')),
                name=row.get('Name'),
                nationality=row.get('Nationality'),
                gender=row.get('Gender'),
                birth_year=clean_int(row.get('Birth Year')),
                death_year=clean_int(row.get('Death Year'))
            )
            db.add(artist)
            artists_count += 1
            if artists_count % 1000 == 0:
                db.commit()
    db.commit()

    # Seed Artworks
    artworks_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'artworks.csv')
    artworks_count = 0
    print("Seeding artworks...")
    with open(artworks_file, newline='', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if artworks_count >= 500:
                break
            artwork = Artwork(
                id=clean_int(row.get('Artwork ID')),
                title=row.get('Title'),
                date=row.get('Date'),
                medium=row.get('Medium'),
                classification=row.get('Classification'),
                department=row.get('Department'),
                artist_id=clean_int(row.get('Artist ID'))
            )
            db.add(artwork)
            artworks_count += 1
            if artworks_count % 100 == 0:
                db.commit()
    db.commit()

    print(f"Seeded 1 admin user.")
    print(f"Seeded {artists_count} artists.")
    print(f"Seeded {artworks_count} artworks.")
    db.close()

if __name__ == "__main__":
    seed_data()
