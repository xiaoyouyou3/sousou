from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any
import random

app = FastAPI()

# --- User Management ---

class User(BaseModel):
    email: str
    password: str

users_db: List[User] = []

@app.post("/signup", response_model=User)
def sign_up(user: User):
    """Handles user sign-up."""
    # In a real app, you'd check if the user already exists
    users_db.append(user)
    return user

@app.post("/signin")
def sign_in(user: User):
    """Handles user sign-in."""
    for registered_user in users_db:
        if registered_user.email == user.email and registered_user.password == user.password:
            return {"message": "Sign-in successful"}
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect email or password",
    )

@app.get("/users", response_model=List[User])
def get_users():
    """Returns all registered users (for debugging)."""
    return users_db

# --- Song Management ---

class SongCreate(BaseModel):
    emotion: str
    genre: str
    duration: str
    prompt: str

class Song(SongCreate):
    id: int
    title: str
    data: Dict[str, Any] # Represents the generated JSON score
    likes: int = 0
    # This is a placeholder to simulate a toggle for a single-user view.
    # In a real app, this state would be managed per-user.
    is_liked: bool = False

songs_db: List[Song] = []
song_id_counter = 0

def find_song_by_id(song_id: int) -> Song | None:
    for song in songs_db:
        if song.id == song_id:
            return song
    return None

@app.post("/create-song", response_model=Song)
def create_song(song_request: SongCreate):
    """
    Generates a song based on user parameters.
    This is a mock implementation.
    """
    global song_id_counter
    
    genre = song_request.genre
    # Logic for "おまかせ" (auto) genre
    if genre == "おまかせ":
        emotion_genre_map = {
            "喜び": "邦ロック",
            "怒り": "メタル",
            "悲しみ": "バラード",
            "驚き": "エレクトロ",
            "愛情": "ポップ",
            "恐れ": "アンビエント",
            "嫌悪": "インダストリアル",
        }
        genre = emotion_genre_map.get(song_request.emotion, "ポップ")

    # Mock song generation
    song_id_counter += 1
    new_song = Song(
        id=song_id_counter,
        title=f"{song_request.emotion}な{genre}の曲",
        emotion=song_request.emotion,
        genre=genre,
        duration=song_request.duration,
        prompt=song_request.prompt,
        data={
            "notes": ["C4", "E4", "G4", "A4"],
            "duration": "8n",
            "BPM": random.randint(80, 160)
        },
        likes=0,
        is_liked=False
    )
    
    songs_db.append(new_song)
    return new_song

@app.get("/songs", response_model=List[Song])
def get_songs():
    """Returns all created songs."""
    return songs_db

@app.post("/songs/{song_id}/like", response_model=Song)
def toggle_like_song(song_id: int):
    """Toggles the 'like' status of a song."""
    
    song_to_update = find_song_by_id(song_id)
            
    if song_to_update is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Song with id {song_id} not found"
        )
        
    # Toggle the like status
    if song_to_update.is_liked:
        song_to_update.is_liked = False
        song_to_update.likes -= 1
    else:
        song_to_update.is_liked = True
        song_to_update.likes += 1
        
    # Ensure likes count is not negative
    song_to_update.likes = max(0, song_to_update.likes)
        
    return song_to_update

@app.get("/")
def read_root():
    return {"message": "Music Generation SNS API is running"}
