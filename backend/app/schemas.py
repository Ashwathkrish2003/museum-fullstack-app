from pydantic import BaseModel
from typing import List, Optional

class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ArtistBase(BaseModel):
    name: str
    nationality: Optional[str] = None
    gender: Optional[str] = None
    birth_year: Optional[int] = None
    death_year: Optional[int] = None

class ArtistCreate(ArtistBase):
    id: Optional[int] = None

class ArtistOut(ArtistBase):
    id: int
    
    class Config:
        orm_mode = True
        from_attributes = True

class ArtistBulkCreate(BaseModel):
    artists: List[ArtistCreate]

class ArtworkBase(BaseModel):
    title: str
    date: Optional[str] = None
    medium: Optional[str] = None
    classification: Optional[str] = None
    department: Optional[str] = None
    artist_id: Optional[int] = None

class ArtworkCreate(ArtworkBase):
    id: Optional[int] = None

class ArtworkOut(ArtworkBase):
    id: int
    
    class Config:
        orm_mode = True
        from_attributes = True

class ArtworkBulkCreate(BaseModel):
    artworks: List[ArtworkCreate]

class BulkDeleteRequest(BaseModel):
    ids: List[int]
