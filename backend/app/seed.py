import csv
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
from app.models import Base, User, Artist, Artwork

load_dotenv()

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
        return int(float(value))
    except (ValueError, TypeError):
        return None

def seed_data():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if db.query(User).count() == 0:
        admin = User(username="admin", hashed_password=get_password_hash("admin123"))
        db.add(admin)
        db.commit()
        print("Seeded 1 admin user.")
    else:
        print("Admin user already exists, skipping.")

    if db.query(Artist).count() == 0:
        artists_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'artists.csv')
        artists_count = 0
        print("Seeding artists...")
        with open(artists_file, newline='', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if artists_count >= 500:
                    break
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
        db.commit()
        print(f"Seeded {artists_count} artists.")
        if "postgresql" in DATABASE_URL:
            db.execute(text("SELECT setval('artists_id_seq', (SELECT COALESCE(MAX(id), 1) FROM artists))"))
            db.commit()
    else:
        print("Artists already seeded, skipping.")

    if db.query(Artwork).count() == 0:
        artworks_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'artworks.csv')
        artworks_count = 0
        existing_artist_ids = {row[0] for row in db.query(Artist.id).all()}
        print("Seeding artworks...")
        with open(artworks_file, newline='', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if artworks_count >= 500:
                    break
                artist_id_value = clean_int(row.get('Artist ID'))
                if artist_id_value not in existing_artist_ids:
                    artist_id_value = None
                artwork = Artwork(
                    id=clean_int(row.get('Artwork ID')),
                    title=row.get('Title'),
                    date=row.get('Date'),
                    medium=row.get('Medium'),
                    classification=row.get('Classification'),
                    department=row.get('Department'),
                    artist_id=artist_id_value
                )
                db.add(artwork)
                artworks_count += 1
        db.commit()
        print(f"Seeded {artworks_count} artworks.")
        if "postgresql" in DATABASE_URL:
            db.execute(text("SELECT setval('artworks_id_seq', (SELECT COALESCE(MAX(id), 1) FROM artworks))"))
            db.commit()
    else:
        print("Artworks already seeded, skipping.")

    db.close()

if __name__ == "__main__":
    seed_data()
