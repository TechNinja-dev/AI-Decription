from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pydantic import BaseModel
import base64
import datetime
from bson.objectid import ObjectId
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
from typing import Optional # Import Optional
import google.generativeai as genai
import requests
import json

load_dotenv()
# --- Configuration ---
MONGO_URI = os.getenv("Mongo_uri")
API_KEY=os.getenv("API_KEY")
img_key=os.getenv("img_key")
DATABASE_NAME = "photodb"

# --- Security ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- Database Connection ---
client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
users_collection = db["users"]
images_collection = db["images"]

# --- FastAPI App ---
app = FastAPI()

# origins = [
#     "http://localhost:5173",
#     "https://ai-decription.vercel.app/", 
#     "https://www.ai-decription.vercel.app",
# ]
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Models ---
class User(BaseModel):
    email: str
    password: str

# Model for the delete request body now uses user_id
class DeleteImageRequest(BaseModel):
    user_id: str

# --- Helper Functions ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# --- Endpoints ---
@app.post("/register")
async def register(user: User):
    if users_collection.find_one({"u_mail": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    user_document = {"u_mail": user.email, "hashed_password": hashed_password}
    result = users_collection.insert_one(user_document)
    # Return the new user's ID to the frontend
    return {"email": user.email, "user_id": str(result.inserted_id), "message": "User registered successfully"}

@app.post("/login")
async def login(user: User):
    db_user = users_collection.find_one({"u_mail": user.email})
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    # Return the user's ID on login
    return {"email": user.email, "user_id": str(db_user["_id"]), "message": "Login successful"}

@app.post("/load")
async def describe_image(file: UploadFile = File(...)):
    if not API_KEY:
        raise HTTPException(status_code=500, detail="API_KEY is not configured on the server.")

    contents = await file.read()
    encoded_string = base64.b64encode(contents).decode("utf-8")

    # Call the Vision API to get a description
    API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key={API_KEY}"
    
    payload = {
        "contents": [{
            "parts": [
                {"text": "Describe this image in detail."},
                {"inline_data": {"mime_type": file.content_type, "data": encoded_string}}
            ]
        }]
    }

    description = "Description could not be generated."
    try:
        response = requests.post(API_URL, json=payload)
        response.raise_for_status()
        result = response.json()
        
        if result.get("candidates") and result["candidates"][0].get("content", {}).get("parts"):
            description = result["candidates"][0]["content"]["parts"][0]["text"]
        
    except requests.exceptions.RequestException as e:
        print(f"Error calling Vision API: {e}")
    except Exception as e:
        print(f"Unexpected error processing Vision API response: {e}")

    # Per your request, this endpoint no longer saves to the database.
    # It only returns the generated description.
    return { "description": description }

@app.get("/images")
async def get_images(user_id: str):
    # Fetch images using user_id
    images_cursor = images_collection.find({"user_id": user_id}).sort("uploaded_at", -1)
    images = []
    for image in images_cursor:
        image['_id'] = str(image['_id'])
        images.append(image)
    return images

@app.delete("/images/{image_id}")
async def delete_image(image_id: str, request: DeleteImageRequest):
    try:
        obj_id = ObjectId(image_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image ID format")

    image_to_delete = images_collection.find_one({"_id": obj_id})

    if not image_to_delete:
        raise HTTPException(status_code=404, detail="Image not found")

    # SECURITY CHECK: Verify ownership using user_id
    if image_to_delete.get("user_id") != request.user_id:
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to delete this image")

    images_collection.delete_one({"_id": obj_id})

    return {"message": "Image deleted successfully"}

@app.get("/generate")
async def generate_image(prompt: str, user_id: Optional[str] = None):
    if not API_KEY:
        raise HTTPException(status_code=500, detail="API_KEY is not configured on the server.")

    # --- UPDATED TO USE GEMINI 2.5 FLASH IMAGE PREVIEW ---
    API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key={API_KEY}"
    
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseModalities": ["IMAGE"]
        }
    }

    try:
        response = requests.post(API_URL, json=payload)
        response.raise_for_status()
        
        result = response.json()
        
        # --- UPDATED RESPONSE PARSING LOGIC ---
        image_part = next((part for part in result.get("candidates", [{}])[0].get("content", {}).get("parts", []) if "inlineData" in part), None)

        if image_part:
            image_data = image_part["inlineData"]["data"]
            saved_to_gallery = False

            if user_id:
                image_document = {
                    "user_id": user_id,
                    "filename": f"Generated: {prompt[:50]}...",
                    "content_type": "image/png",
                    "image_data": image_data,
                    "uploaded_at": datetime.datetime.utcnow()
                }
                images_collection.insert_one(image_document)
                saved_to_gallery = True
            
            return {"image_data": image_data, "saved_to_gallery": saved_to_gallery}
        else:
            raise HTTPException(status_code=500, detail="Failed to parse image data from API response.")

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Failed to connect to image generation service: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")
