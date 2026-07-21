from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Artist(Base):
    __tablename__ = 'artists'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    nationality = Column(String)
    gender = Column(String)
    birth_year = Column(Integer, nullable=True)
    death_year = Column(Integer, nullable=True)

    artworks = relationship("Artwork", back_populates="artist")

class Artwork(Base):
    __tablename__ = 'artworks'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    date = Column(String)
    medium = Column(String)
    classification = Column(String)
    department = Column(String)
    artist_id = Column(Integer, ForeignKey('artists.id'))

    artist = relationship("Artist", back_populates="artworks")
