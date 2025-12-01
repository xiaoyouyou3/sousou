# Firebase Cloud Functions for Python
import firebase_admin
from firebase_functions import https_fn, options

# Generative AI
import os
import google.generativeai as genai

# Initialize Firebase Admin SDK
# This is required to interact with Firebase services.
firebase_admin.initialize_app()

# Set the region to 'asia-northeast1' (Tokyo)
options.set_global_options(region=options.SupportedRegion.ASIA_NORTHEAST1)

# Configure the Gemini API key from environment variables
# Make sure to set GEMINI_API_KEY in your environment.
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

@https_fn.on_call()
def generateMusic(req: https_fn.CallableRequest) -> https_fn.Response:
    """A callable function that generates music based on a theme using Gemini.

    Args:
        req: The request object from the client.
             req.data['theme'] should contain the user's prompt.

    Returns:
        A response object containing the generated music URL.
    """
    theme = req.data.get('theme')
    if not theme:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
            message='The function must be called with "theme" argument.'
        )

    try:
        # Use the Gemini model to generate a music description
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(
            f"Generate a detailed music description for a music generation AI. The user prompt is: {theme}. "
            f"The description should include genre, mood, instruments, and tempo."
        )

        # In a real application, you would use this description to call a music generation API.
        # For this example, we just log the description and return a dummy URL.
        music_description = response.text
        print(f"Generated Music Description: {music_description}")

        # Placeholder URL for the generated music
        # This is the same sample URL used in the JS example for consistency
        music_url = "https://firebasestorage.googleapis.com/v0/b/studio-1331607468-b7dd5.appspot.com/o/sample_song.mp3?alt=media&token=a0e7225b-3b39-4467-8b2b-017838634a05"

        return {"musicUrl": music_url}

    except Exception as e:
        print(f"An error occurred: {e}")
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INTERNAL,
            message="An error occurred while generating music."
        )
