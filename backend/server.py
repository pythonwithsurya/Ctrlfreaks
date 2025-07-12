from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import jwt
import bcrypt
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = "your-secret-key-change-in-production"
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Enums
class SwapStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    location: Optional[str] = None
    profile_photo: Optional[str] = None
    skills_offered: List[str] = []
    skills_wanted: List[str] = []
    availability: Optional[str] = None
    is_profile_public: bool = True
    role: UserRole = UserRole.USER
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    location: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserProfile(BaseModel):
    name: str
    location: Optional[str] = None
    profile_photo: Optional[str] = None
    skills_offered: List[str] = []
    skills_wanted: List[str] = []
    availability: Optional[str] = None
    is_profile_public: bool = True

class SwapRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    requester_id: str
    requested_user_id: str
    requester_skill: str
    requested_skill: str
    message: Optional[str] = None
    status: SwapStatus = SwapStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class SwapRequestCreate(BaseModel):
    requested_user_id: str
    requester_skill: str
    requested_skill: str
    message: Optional[str] = None

class SwapStatusUpdate(BaseModel):
    status: SwapStatus

# Utility functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return User(**user)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Authentication endpoints
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    user_dict = user_data.dict()
    del user_dict["password"]
    
    user = User(**user_dict)
    
    # Store user with hashed password
    user_with_password = user.dict()
    user_with_password["password"] = hashed_password
    
    await db.users.insert_one(user_with_password)
    
    # Create access token
    access_token = create_access_token(data={"sub": user.id})
    
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@api_router.post("/auth/login")
async def login(user_data: UserLogin):
    # Find user
    user_doc = await db.users.find_one({"email": user_data.email})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(user_data.password, user_doc["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create access token
    access_token = create_access_token(data={"sub": user_doc["id"]})
    
    # Return user without password
    user_dict = {k: v for k, v in user_doc.items() if k != "password"}
    user = User(**user_dict)
    
    return {"access_token": access_token, "token_type": "bearer", "user": user}

# User profile endpoints
@api_router.get("/users/me", response_model=User)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.put("/users/me", response_model=User)
async def update_profile(profile_data: UserProfile, current_user: User = Depends(get_current_user)):
    # Update user profile
    update_data = profile_data.dict()
    update_data["updated_at"] = datetime.utcnow()
    
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": update_data}
    )
    
    # Return updated user
    updated_user = await db.users.find_one({"id": current_user.id})
    user_dict = {k: v for k, v in updated_user.items() if k != "password"}
    return User(**user_dict)

# Search and discovery endpoints
@api_router.get("/users/search")
async def search_users(skill: Optional[str] = None, location: Optional[str] = None, current_user: User = Depends(get_current_user)):
    query = {"is_profile_public": True, "id": {"$ne": current_user.id}}
    
    if skill:
        query["skills_offered"] = {"$regex": skill, "$options": "i"}
    
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    
    users = await db.users.find(query, {"password": 0}).to_list(100)
    return [User(**user) for user in users]

@api_router.get("/users/{user_id}", response_model=User)
async def get_user_profile(user_id: str, current_user: User = Depends(get_current_user)):
    user = await db.users.find_one({"id": user_id, "is_profile_public": True}, {"password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found or profile is private")
    
    return User(**user)

# Swap request endpoints
@api_router.post("/swaps", response_model=SwapRequest)
async def create_swap_request(swap_data: SwapRequestCreate, current_user: User = Depends(get_current_user)):
    # Check if target user exists and has the requested skill
    target_user = await db.users.find_one({"id": swap_data.requested_user_id})
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found")
    
    if swap_data.requested_skill not in target_user.get("skills_offered", []):
        raise HTTPException(status_code=400, detail="Target user doesn't offer this skill")
    
    if swap_data.requester_skill not in current_user.skills_offered:
        raise HTTPException(status_code=400, detail="You don't offer this skill")
    
    # Check if similar request already exists
    existing_request = await db.swap_requests.find_one({
        "requester_id": current_user.id,
        "requested_user_id": swap_data.requested_user_id,
        "status": {"$in": ["pending", "accepted"]}
    })
    
    if existing_request:
        raise HTTPException(status_code=400, detail="You already have a pending or accepted request with this user")
    
    # Create swap request
    swap_request = SwapRequest(
        requester_id=current_user.id,
        **swap_data.dict()
    )
    
    await db.swap_requests.insert_one(swap_request.dict())
    
    return swap_request

@api_router.get("/swaps/sent", response_model=List[SwapRequest])
async def get_sent_requests(current_user: User = Depends(get_current_user)):
    requests = await db.swap_requests.find({"requester_id": current_user.id}).to_list(100)
    return [SwapRequest(**req) for req in requests]

@api_router.get("/swaps/received", response_model=List[SwapRequest])
async def get_received_requests(current_user: User = Depends(get_current_user)):
    requests = await db.swap_requests.find({"requested_user_id": current_user.id}).to_list(100)
    return [SwapRequest(**req) for req in requests]

@api_router.put("/swaps/{swap_id}", response_model=SwapRequest)
async def update_swap_status(swap_id: str, status_update: SwapStatusUpdate, current_user: User = Depends(get_current_user)):
    swap_request = await db.swap_requests.find_one({"id": swap_id})
    if not swap_request:
        raise HTTPException(status_code=404, detail="Swap request not found")
    
    # Check permissions
    if swap_request["requested_user_id"] != current_user.id and swap_request["requester_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this request")
    
    # Update status
    update_data = {
        "status": status_update.status,
        "updated_at": datetime.utcnow()
    }
    
    await db.swap_requests.update_one(
        {"id": swap_id},
        {"$set": update_data}
    )
    
    updated_request = await db.swap_requests.find_one({"id": swap_id})
    return SwapRequest(**updated_request)

@api_router.delete("/swaps/{swap_id}")
async def delete_swap_request(swap_id: str, current_user: User = Depends(get_current_user)):
    swap_request = await db.swap_requests.find_one({"id": swap_id})
    if not swap_request:
        raise HTTPException(status_code=404, detail="Swap request not found")
    
    # Only requester can delete their own requests
    if swap_request["requester_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this request")
    
    await db.swap_requests.delete_one({"id": swap_id})
    return {"message": "Swap request deleted successfully"}

# Dashboard endpoint
@api_router.get("/dashboard")
async def get_dashboard(current_user: User = Depends(get_current_user)):
    # Get statistics
    sent_requests = await db.swap_requests.count_documents({"requester_id": current_user.id})
    received_requests = await db.swap_requests.count_documents({"requested_user_id": current_user.id})
    pending_sent = await db.swap_requests.count_documents({"requester_id": current_user.id, "status": "pending"})
    pending_received = await db.swap_requests.count_documents({"requested_user_id": current_user.id, "status": "pending"})
    active_swaps = await db.swap_requests.count_documents({
        "$or": [{"requester_id": current_user.id}, {"requested_user_id": current_user.id}],
        "status": "accepted"
    })
    
    return {
        "user": current_user,
        "stats": {
            "sent_requests": sent_requests,
            "received_requests": received_requests,
            "pending_sent": pending_sent,
            "pending_received": pending_received,
            "active_swaps": active_swaps
        }
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()