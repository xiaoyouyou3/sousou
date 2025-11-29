import os
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# Configure the Gemini API key
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

app = FastAPI()

class MusicRequest(BaseModel):
    prompt: str

@app.post("/generate_music")
def generate_music(request: MusicRequest):
    try:
        # Generate music generation instructions using Gemini
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(
            f"Generate a detailed music description for a music generation AI. The user prompt is: {request.prompt}. "
            f"The description should include genre, mood, instruments, and tempo."
        )

        # In a real application, you would now use this response to call a music generation API.
        # For this example, we'll just return the generated description.
        music_description = response.text

        # Dummy response for now
        return {"music_description": music_description, "music_url": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"Hello": "World"}
