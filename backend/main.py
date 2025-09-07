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
load_dotenv()
# --- Configuration ---
MONGO_URI = os.getenv("Mongo_uri")
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

origins = [
    "http://localhost:5173",
]

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
async def create_upload_file(file: UploadFile = File(...), user_id: str = Form(...)):
    contents = await file.read()
    encoded_string = base64.b64encode(contents)
    
    # Store user_id instead of user_mail
    image_document = {
        "user_id": user_id,
        "filename": file.filename,
        "content_type": file.content_type,
        "image_data": encoded_string.decode("utf-8"),
        "uploaded_at": datetime.datetime.utcnow()
    }
    
    result = images_collection.insert_one(image_document)
    return {"document_id": str(result.inserted_id)}

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

