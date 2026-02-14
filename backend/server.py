from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional
from pathlib import Path
from datetime import datetime, timezone, timedelta
import os
import uuid
import logging
import bcrypt
import jwt
import math

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET')
JWT_ALG = "HS256"

app = FastAPI(title="Kids Money API")
api = APIRouter(prefix="/api")
security = HTTPBearer()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== CONSTANTS ====================

LEVELS = [
    {"level": 1, "name": "Money Beginner", "xp_required": 0, "icon": "sprout"},
    {"level": 2, "name": "Smart Saver", "xp_required": 100, "icon": "piggy-bank"},
    {"level": 3, "name": "Goal Tracker", "xp_required": 250, "icon": "target"},
    {"level": 4, "name": "Consistency Champ", "xp_required": 500, "icon": "trophy"},
    {"level": 5, "name": "Budget Hero", "xp_required": 1000, "icon": "shield"},
    {"level": 6, "name": "Mini Investor", "xp_required": 1750, "icon": "trending-up"},
    {"level": 7, "name": "EMI Master", "xp_required": 2750, "icon": "award"},
    {"level": 8, "name": "Discipline Pro", "xp_required": 4000, "icon": "star"},
    {"level": 9, "name": "Finance Ninja", "xp_required": 5500, "icon": "zap"},
    {"level": 10, "name": "Money Legend", "xp_required": 7500, "icon": "crown"},
]

AVATARS = [
    {"id": "lion", "name": "Lion", "color": "#FB923C", "icon": "cat"},
    {"id": "bear", "name": "Bear", "color": "#A78BFA", "icon": "paw-print"},
    {"id": "fox", "name": "Fox", "color": "#F472B6", "icon": "heart"},
    {"id": "rabbit", "name": "Rabbit", "color": "#34D399", "icon": "leaf"},
    {"id": "panda", "name": "Panda", "color": "#4F7DF3", "icon": "star"},
    {"id": "unicorn", "name": "Unicorn", "color": "#FCD34D", "icon": "sparkles"},
    {"id": "owl", "name": "Owl", "color": "#818CF8", "icon": "moon"},
    {"id": "dolphin", "name": "Dolphin", "color": "#22D3EE", "icon": "waves"},
]

STORIES = [
    {
        "id": "story-1",
        "title": "What is Money?",
        "description": "Learn about the fascinating history of money",
        "content": "Long ago, people didn't use money. They traded things they had for things they needed. A farmer might trade wheat for a fisherman's fish. This was called bartering. But bartering was tricky! What if the fisherman didn't want wheat? That's why people invented money - special coins and bills that everyone agreed were valuable. Today, money helps us buy things we need and save for things we want.",
        "questions": [
            {"question": "What was the old way of getting things before money?", "options": ["Bartering", "Stealing", "Wishing", "Waiting"], "correct": 0},
            {"question": "Why was bartering tricky?", "options": ["It was illegal", "People might not want what you had", "It was too fast", "Everyone had same things"], "correct": 1},
            {"question": "What does money help us do?", "options": ["Only buy food", "Buy things and save", "Only play games", "Nothing useful"], "correct": 1}
        ],
        "reward_xp": 25,
        "category": "basics"
    },
    {
        "id": "story-2",
        "title": "The Magic of Saving",
        "description": "Discover why saving money is like planting seeds",
        "content": "Imagine you have a magical garden. Every coin you save is like planting a seed. Over time, these seeds grow into beautiful trees that bear fruit. Saving money works the same way! When you put money aside regularly, it grows. Banks even give you extra money called interest for keeping your savings with them. The more you save, the more your money garden grows!",
        "questions": [
            {"question": "What is saving money compared to?", "options": ["Swimming", "Planting seeds", "Running", "Flying"], "correct": 1},
            {"question": "What is the extra money banks give you called?", "options": ["Gift", "Interest", "Allowance", "Prize"], "correct": 1},
            {"question": "What happens when you save regularly?", "options": ["Money disappears", "Nothing happens", "Money grows", "Money shrinks"], "correct": 2}
        ],
        "reward_xp": 25,
        "category": "saving"
    },
    {
        "id": "story-3",
        "title": "Needs vs Wants",
        "description": "Learn to tell apart what you need from what you want",
        "content": "Every day, we see things we would like to have. But are they all important? Needs are things we must have to live - like food, water, clothes, and a home. Wants are things that are nice to have but we can live without - like toys, games, and candy. Smart money managers know the difference! They always take care of needs first, then save for wants.",
        "questions": [
            {"question": "Which of these is a need?", "options": ["Video game", "Food", "Toy car", "Candy"], "correct": 1},
            {"question": "What should smart money managers do first?", "options": ["Buy wants", "Take care of needs", "Spend everything", "Borrow money"], "correct": 1},
            {"question": "Which is a want?", "options": ["Water", "Clothes", "A new toy", "Medicine"], "correct": 2}
        ],
        "reward_xp": 25,
        "category": "spending"
    },
    {
        "id": "story-4",
        "title": "The Power of Interest",
        "description": "How your money can make more money",
        "content": "Here is a cool trick: money can make more money! It is called interest. When you save money in a bank, the bank uses it to help others and pays you a little extra as a thank you. If you save 100 coins and the bank gives 10 percent interest, after one year you will have 110 coins! And next year, you earn interest on 110 coins. This is called compound interest - it is like a snowball that gets bigger and bigger!",
        "questions": [
            {"question": "What is the extra money the bank gives called?", "options": ["Tax", "Interest", "Fine", "Fee"], "correct": 1},
            {"question": "If you save 100 coins at 10% interest, how much after a year?", "options": ["100", "105", "110", "120"], "correct": 2},
            {"question": "What is compound interest compared to?", "options": ["Shrinking balloon", "Growing snowball", "Flat road", "Standing rock"], "correct": 1}
        ],
        "reward_xp": 25,
        "category": "interest"
    },
    {
        "id": "story-5",
        "title": "Borrowing Wisely",
        "description": "Understanding loans and responsible borrowing",
        "content": "Sometimes we need money we do not have yet. That is when we can borrow - take a loan. But borrowing comes with a responsibility! When you borrow money, you must pay it back with a little extra called interest. It is like borrowing your friend's toy - you should return it in good condition, maybe even with a small thank-you gift. Always borrow only what you truly need and make sure you can pay it back on time!",
        "questions": [
            {"question": "What must you do when you borrow money?", "options": ["Keep it forever", "Pay it back with interest", "Forget about it", "Give it away"], "correct": 1},
            {"question": "When should you borrow money?", "options": ["Whenever you want", "Only when you truly need it", "Never", "Every day"], "correct": 1},
            {"question": "What is important about paying back a loan?", "options": ["Pay it back late", "Pay on time", "Do not pay at all", "Pay half"], "correct": 1}
        ],
        "reward_xp": 25,
        "category": "loans"
    }
]

# ==================== PYDANTIC MODELS ====================

class SignupRequest(BaseModel):
    full_name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class KidCreate(BaseModel):
    name: str
    age: int
    avatar: str = "panda"
    grade: Optional[str] = None
    starting_balance: float = 0

class KidUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    avatar: Optional[str] = None
    grade: Optional[str] = None

class TaskCreate(BaseModel):
    kid_id: str
    title: str
    description: Optional[str] = ""
    reward_amount: float
    penalty_amount: float = 0
    frequency: str = "one-time"
    approval_required: bool = True

class GoalCreate(BaseModel):
    kid_id: str
    title: str
    target_amount: float
    deadline: Optional[str] = None

class GoalContribute(BaseModel):
    amount: float

class SIPCreate(BaseModel):
    kid_id: str
    amount: float
    interest_rate: float = 8.0
    frequency: str = "monthly"

class LoanRequest(BaseModel):
    kid_id: str
    amount: float
    purpose: str
    duration_months: int = 6
    interest_rate: float = 5.0

class LearningComplete(BaseModel):
    kid_id: str
    story_id: str
    score: int

# ==================== AUTH UTILS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALG])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== HELPERS ====================

def get_level_for_xp(xp: int) -> dict:
    current = LEVELS[0]
    for lvl in LEVELS:
        if xp >= lvl["xp_required"]:
            current = lvl
    return current

def get_next_level(current_level: int) -> dict:
    for lvl in LEVELS:
        if lvl["level"] == current_level + 1:
            return lvl
    return None

async def add_transaction(kid_id, txn_type, amount, description, category="general", reference_id=None):
    txn = {
        "id": str(uuid.uuid4()),
        "kid_id": kid_id,
        "type": txn_type,
        "amount": amount,
        "description": description,
        "category": category,
        "reference_id": reference_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.transactions.insert_one(txn)

async def update_wallet_balance(kid_id, amount, operation="credit"):
    wallet = await db.wallets.find_one({"kid_id": kid_id}, {"_id": 0})
    if not wallet:
        return None
    if operation == "credit":
        await db.wallets.update_one({"kid_id": kid_id}, {"$inc": {"balance": amount, "total_earned": amount}})
    elif operation == "debit":
        if wallet["balance"] < amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")
        await db.wallets.update_one({"kid_id": kid_id}, {"$inc": {"balance": -amount, "total_spent": amount}})
    elif operation == "save":
        if wallet["balance"] < amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")
        await db.wallets.update_one({"kid_id": kid_id}, {"$inc": {"balance": -amount, "total_saved": amount}})

async def add_xp(kid_id, xp_amount):
    kid = await db.kids.find_one({"id": kid_id}, {"_id": 0})
    if kid:
        new_xp = kid.get("xp", 0) + xp_amount
        lvl = get_level_for_xp(new_xp)
        await db.kids.update_one({"id": kid_id}, {"$set": {"xp": new_xp, "level": lvl["level"]}})

async def update_credit_score(kid_id, change):
    kid = await db.kids.find_one({"id": kid_id}, {"_id": 0})
    if kid:
        new_score = max(0, min(1000, kid.get("credit_score", 500) + change))
        await db.kids.update_one({"id": kid_id}, {"$set": {"credit_score": new_score}})

# ==================== AUTH ROUTES ====================

@api.post("/auth/signup")
async def signup(req: SignupRequest):
    existing = await db.users.find_one({"email": req.email.lower()}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": req.email.lower(),
        "full_name": req.full_name,
        "password_hash": hash_password(req.password),
        "role": "parent",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user)
    token = create_token(user_id)
    return {"token": token, "user": {"id": user_id, "email": user["email"], "full_name": user["full_name"], "role": "parent"}}

@api.post("/auth/login")
async def login(req: LoginRequest):
    user = await db.users.find_one({"email": req.email.lower()}, {"_id": 0})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(user["id"])
    return {"token": token, "user": {"id": user["id"], "email": user["email"], "full_name": user["full_name"], "role": user["role"]}}

@api.get("/auth/me")
async def get_me(user=Depends(get_current_user)):
    return {"id": user["id"], "email": user["email"], "full_name": user["full_name"], "role": user["role"]}

# ==================== KIDS ROUTES ====================

@api.post("/kids")
async def add_kid(req: KidCreate, user=Depends(get_current_user)):
    kid_id = str(uuid.uuid4())
    kid = {
        "id": kid_id,
        "parent_id": user["id"],
        "name": req.name,
        "age": req.age,
        "avatar": req.avatar,
        "grade": req.grade,
        "level": 1,
        "xp": 0,
        "credit_score": 500,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.kids.insert_one(kid)
    wallet = {
        "id": str(uuid.uuid4()),
        "kid_id": kid_id,
        "balance": req.starting_balance,
        "total_earned": req.starting_balance,
        "total_spent": 0,
        "total_saved": 0
    }
    await db.wallets.insert_one(wallet)
    if req.starting_balance > 0:
        await add_transaction(kid_id, "credit", req.starting_balance, "Starting balance", "initial")
    kid_data = await db.kids.find_one({"id": kid_id}, {"_id": 0})
    return kid_data

@api.get("/kids")
async def list_kids(user=Depends(get_current_user)):
    kids = await db.kids.find({"parent_id": user["id"]}, {"_id": 0}).to_list(100)
    return kids

@api.get("/kids/{kid_id}")
async def get_kid(kid_id: str, user=Depends(get_current_user)):
    kid = await db.kids.find_one({"id": kid_id, "parent_id": user["id"]}, {"_id": 0})
    if not kid:
        raise HTTPException(status_code=404, detail="Kid not found")
    return kid

@api.put("/kids/{kid_id}")
async def update_kid(kid_id: str, req: KidUpdate, user=Depends(get_current_user)):
    kid = await db.kids.find_one({"id": kid_id, "parent_id": user["id"]}, {"_id": 0})
    if not kid:
        raise HTTPException(status_code=404, detail="Kid not found")
    updates = {k: v for k, v in req.model_dump().items() if v is not None}
    if updates:
        await db.kids.update_one({"id": kid_id}, {"$set": updates})
    return await db.kids.find_one({"id": kid_id}, {"_id": 0})

@api.delete("/kids/{kid_id}")
async def delete_kid(kid_id: str, user=Depends(get_current_user)):
    kid = await db.kids.find_one({"id": kid_id, "parent_id": user["id"]}, {"_id": 0})
    if not kid:
        raise HTTPException(status_code=404, detail="Kid not found")
    await db.kids.delete_one({"id": kid_id})
    await db.wallets.delete_one({"kid_id": kid_id})
    await db.transactions.delete_many({"kid_id": kid_id})
    await db.tasks.delete_many({"kid_id": kid_id})
    await db.goals.delete_many({"kid_id": kid_id})
    await db.sips.delete_many({"kid_id": kid_id})
    await db.loans.delete_many({"kid_id": kid_id})
    await db.learning_progress.delete_many({"kid_id": kid_id})
    return {"message": "Kid and all related data deleted"}

# ==================== TASKS ROUTES ====================

@api.post("/tasks")
async def create_task(req: TaskCreate, user=Depends(get_current_user)):
    kid = await db.kids.find_one({"id": req.kid_id, "parent_id": user["id"]}, {"_id": 0})
    if not kid:
        raise HTTPException(status_code=404, detail="Kid not found")
    task = {
        "id": str(uuid.uuid4()),
        "parent_id": user["id"],
        "kid_id": req.kid_id,
        "title": req.title,
        "description": req.description,
        "reward_amount": req.reward_amount,
        "penalty_amount": req.penalty_amount,
        "frequency": req.frequency,
        "approval_required": req.approval_required,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.tasks.insert_one(task)
    return await db.tasks.find_one({"id": task["id"]}, {"_id": 0})

@api.get("/tasks/{kid_id}")
async def list_tasks(kid_id: str, status: Optional[str] = None, user=Depends(get_current_user)):
    query = {"kid_id": kid_id, "parent_id": user["id"]}
    if status:
        query["status"] = status
    tasks = await db.tasks.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)
    return tasks

@api.put("/tasks/{task_id}/complete")
async def complete_task(task_id: str, user=Depends(get_current_user)):
    task = await db.tasks.find_one({"id": task_id, "parent_id": user["id"]}, {"_id": 0})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task["status"] != "pending":
        raise HTTPException(status_code=400, detail="Task is not pending")
    if task["approval_required"]:
        await db.tasks.update_one({"id": task_id}, {"$set": {"status": "completed"}})
    else:
        await db.tasks.update_one({"id": task_id}, {"$set": {"status": "approved"}})
        await update_wallet_balance(task["kid_id"], task["reward_amount"], "credit")
        await add_transaction(task["kid_id"], "credit", task["reward_amount"], f"Task reward: {task['title']}", "task", task_id)
        await add_xp(task["kid_id"], 10)
        await update_credit_score(task["kid_id"], 10)
    return await db.tasks.find_one({"id": task_id}, {"_id": 0})

@api.put("/tasks/{task_id}/approve")
async def approve_task(task_id: str, user=Depends(get_current_user)):
    task = await db.tasks.find_one({"id": task_id, "parent_id": user["id"]}, {"_id": 0})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task["status"] != "completed":
        raise HTTPException(status_code=400, detail="Task must be completed first")
    await db.tasks.update_one({"id": task_id}, {"$set": {"status": "approved"}})
    await update_wallet_balance(task["kid_id"], task["reward_amount"], "credit")
    await add_transaction(task["kid_id"], "credit", task["reward_amount"], f"Task approved: {task['title']}", "task", task_id)
    await add_xp(task["kid_id"], 10)
    await update_credit_score(task["kid_id"], 10)
    return await db.tasks.find_one({"id": task_id}, {"_id": 0})

@api.put("/tasks/{task_id}/reject")
async def reject_task(task_id: str, user=Depends(get_current_user)):
    task = await db.tasks.find_one({"id": task_id, "parent_id": user["id"]}, {"_id": 0})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task["status"] != "completed":
        raise HTTPException(status_code=400, detail="Task must be completed first")
    await db.tasks.update_one({"id": task_id}, {"$set": {"status": "rejected"}})
    if task["penalty_amount"] > 0:
        wallet = await db.wallets.find_one({"kid_id": task["kid_id"]}, {"_id": 0})
        if wallet and wallet["balance"] >= task["penalty_amount"]:
            await update_wallet_balance(task["kid_id"], task["penalty_amount"], "debit")
            await add_transaction(task["kid_id"], "debit", task["penalty_amount"], f"Task penalty: {task['title']}", "penalty", task_id)
    await update_credit_score(task["kid_id"], -10)
    return await db.tasks.find_one({"id": task_id}, {"_id": 0})

# ==================== WALLET ROUTES ====================

@api.get("/wallet/{kid_id}")
async def get_wallet(kid_id: str, user=Depends(get_current_user)):
    kid = await db.kids.find_one({"id": kid_id, "parent_id": user["id"]}, {"_id": 0})
    if not kid:
        raise HTTPException(status_code=404, detail="Kid not found")
    wallet = await db.wallets.find_one({"kid_id": kid_id}, {"_id": 0})
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    return wallet

@api.get("/wallet/{kid_id}/transactions")
async def get_transactions(kid_id: str, limit: int = Query(50, le=200), user=Depends(get_current_user)):
    kid = await db.kids.find_one({"id": kid_id, "parent_id": user["id"]}, {"_id": 0})
    if not kid:
        raise HTTPException(status_code=404, detail="Kid not found")
    txns = await db.transactions.find({"kid_id": kid_id}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return txns

# ==================== GOALS ROUTES ====================

@api.post("/goals")
async def create_goal(req: GoalCreate, user=Depends(get_current_user)):
    kid = await db.kids.find_one({"id": req.kid_id, "parent_id": user["id"]}, {"_id": 0})
    if not kid:
        raise HTTPException(status_code=404, detail="Kid not found")
    goal = {
        "id": str(uuid.uuid4()),
        "kid_id": req.kid_id,
        "parent_id": user["id"],
        "title": req.title,
        "target_amount": req.target_amount,
        "saved_amount": 0,
        "deadline": req.deadline,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.goals.insert_one(goal)
    return await db.goals.find_one({"id": goal["id"]}, {"_id": 0})

@api.get("/goals/{kid_id}")
async def list_goals(kid_id: str, user=Depends(get_current_user)):
    goals = await db.goals.find({"kid_id": kid_id, "parent_id": user["id"]}, {"_id": 0}).to_list(100)
    return goals

@api.put("/goals/{goal_id}/contribute")
async def contribute_to_goal(goal_id: str, req: GoalContribute, user=Depends(get_current_user)):
    goal = await db.goals.find_one({"id": goal_id, "parent_id": user["id"]}, {"_id": 0})
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if goal["status"] != "active":
        raise HTTPException(status_code=400, detail="Goal is not active")
    await update_wallet_balance(goal["kid_id"], req.amount, "save")
    new_saved = goal["saved_amount"] + req.amount
    status = "completed" if new_saved >= goal["target_amount"] else "active"
    await db.goals.update_one({"id": goal_id}, {"$set": {"saved_amount": new_saved, "status": status}})
    await add_transaction(goal["kid_id"], "debit", req.amount, f"Goal savings: {goal['title']}", "goal", goal_id)
    await add_xp(goal["kid_id"], 20)
    await update_credit_score(goal["kid_id"], 5)
    return await db.goals.find_one({"id": goal_id}, {"_id": 0})

@api.delete("/goals/{goal_id}")
async def delete_goal(goal_id: str, user=Depends(get_current_user)):
    goal = await db.goals.find_one({"id": goal_id, "parent_id": user["id"]}, {"_id": 0})
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if goal["saved_amount"] > 0:
        await db.wallets.update_one({"kid_id": goal["kid_id"]}, {"$inc": {"balance": goal["saved_amount"], "total_saved": -goal["saved_amount"]}})
        await add_transaction(goal["kid_id"], "credit", goal["saved_amount"], f"Goal refund: {goal['title']}", "goal_refund", goal_id)
    await db.goals.delete_one({"id": goal_id})
    return {"message": "Goal deleted and savings returned"}

# ==================== SIP ROUTES ====================

@api.post("/sip")
async def create_sip(req: SIPCreate, user=Depends(get_current_user)):
    kid = await db.kids.find_one({"id": req.kid_id, "parent_id": user["id"]}, {"_id": 0})
    if not kid:
        raise HTTPException(status_code=404, detail="Kid not found")
    sip = {
        "id": str(uuid.uuid4()),
        "kid_id": req.kid_id,
        "parent_id": user["id"],
        "amount": req.amount,
        "interest_rate": req.interest_rate,
        "frequency": req.frequency,
        "total_invested": 0,
        "current_value": 0,
        "payments_made": 0,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.sips.insert_one(sip)
    return await db.sips.find_one({"id": sip["id"]}, {"_id": 0})

@api.get("/sip/{kid_id}")
async def list_sips(kid_id: str, user=Depends(get_current_user)):
    sips = await db.sips.find({"kid_id": kid_id, "parent_id": user["id"]}, {"_id": 0}).to_list(100)
    return sips

@api.post("/sip/{sip_id}/pay")
async def pay_sip(sip_id: str, user=Depends(get_current_user)):
    sip = await db.sips.find_one({"id": sip_id, "parent_id": user["id"]}, {"_id": 0})
    if not sip:
        raise HTTPException(status_code=404, detail="SIP not found")
    if sip["status"] != "active":
        raise HTTPException(status_code=400, detail="SIP is not active")
    await update_wallet_balance(sip["kid_id"], sip["amount"], "save")
    new_invested = sip["total_invested"] + sip["amount"]
    payments = sip["payments_made"] + 1
    monthly_rate = sip["interest_rate"] / 100 / 12
    if monthly_rate > 0:
        new_value = sip["amount"] * ((math.pow(1 + monthly_rate, payments) - 1) / monthly_rate) * (1 + monthly_rate)
    else:
        new_value = new_invested
    await db.sips.update_one({"id": sip_id}, {"$set": {"total_invested": new_invested, "current_value": round(new_value, 2), "payments_made": payments}})
    await add_transaction(sip["kid_id"], "debit", sip["amount"], f"SIP payment #{payments}", "sip", sip_id)
    await add_xp(sip["kid_id"], 15)
    await update_credit_score(sip["kid_id"], 5)
    return await db.sips.find_one({"id": sip_id}, {"_id": 0})

@api.put("/sip/{sip_id}/pause")
async def pause_sip(sip_id: str, user=Depends(get_current_user)):
    sip = await db.sips.find_one({"id": sip_id, "parent_id": user["id"]}, {"_id": 0})
    if not sip:
        raise HTTPException(status_code=404, detail="SIP not found")
    new_status = "paused" if sip["status"] == "active" else "active"
    await db.sips.update_one({"id": sip_id}, {"$set": {"status": new_status}})
    return await db.sips.find_one({"id": sip_id}, {"_id": 0})

# ==================== LOANS ROUTES ====================

@api.post("/loans/request")
async def request_loan(req: LoanRequest, user=Depends(get_current_user)):
    kid = await db.kids.find_one({"id": req.kid_id, "parent_id": user["id"]}, {"_id": 0})
    if not kid:
        raise HTTPException(status_code=404, detail="Kid not found")
    if kid.get("credit_score", 500) < 300:
        raise HTTPException(status_code=400, detail="Credit score too low for a loan")
    monthly_rate = req.interest_rate / 100 / 12
    if monthly_rate > 0:
        emi = req.amount * monthly_rate * math.pow(1 + monthly_rate, req.duration_months) / (math.pow(1 + monthly_rate, req.duration_months) - 1)
    else:
        emi = req.amount / req.duration_months
    loan = {
        "id": str(uuid.uuid4()),
        "kid_id": req.kid_id,
        "parent_id": user["id"],
        "principal": req.amount,
        "interest_rate": req.interest_rate,
        "duration_months": req.duration_months,
        "emi_amount": round(emi, 2),
        "remaining_balance": req.amount,
        "payments_made": 0,
        "purpose": req.purpose,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.loans.insert_one(loan)
    return await db.loans.find_one({"id": loan["id"]}, {"_id": 0})

@api.get("/loans/{kid_id}")
async def list_loans(kid_id: str, user=Depends(get_current_user)):
    loans = await db.loans.find({"kid_id": kid_id, "parent_id": user["id"]}, {"_id": 0}).to_list(100)
    return loans

@api.post("/loans/{loan_id}/approve")
async def approve_loan(loan_id: str, user=Depends(get_current_user)):
    loan = await db.loans.find_one({"id": loan_id, "parent_id": user["id"]}, {"_id": 0})
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    if loan["status"] != "pending":
        raise HTTPException(status_code=400, detail="Loan is not pending approval")
    await db.loans.update_one({"id": loan_id}, {"$set": {"status": "active"}})
    await update_wallet_balance(loan["kid_id"], loan["principal"], "credit")
    await add_transaction(loan["kid_id"], "credit", loan["principal"], f"Loan approved: {loan['purpose']}", "loan", loan_id)
    return await db.loans.find_one({"id": loan_id}, {"_id": 0})

@api.post("/loans/{loan_id}/pay")
async def pay_loan_emi(loan_id: str, user=Depends(get_current_user)):
    loan = await db.loans.find_one({"id": loan_id, "parent_id": user["id"]}, {"_id": 0})
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    if loan["status"] != "active":
        raise HTTPException(status_code=400, detail="Loan is not active")
    pay_amount = min(loan["emi_amount"], loan["remaining_balance"])
    await update_wallet_balance(loan["kid_id"], pay_amount, "debit")
    new_remaining = round(loan["remaining_balance"] - pay_amount, 2)
    payments = loan["payments_made"] + 1
    status = "completed" if new_remaining <= 0 else "active"
    await db.loans.update_one({"id": loan_id}, {"$set": {"remaining_balance": max(0, new_remaining), "payments_made": payments, "status": status}})
    await add_transaction(loan["kid_id"], "debit", pay_amount, f"EMI payment #{payments}", "emi", loan_id)
    await add_xp(loan["kid_id"], 15)
    await update_credit_score(loan["kid_id"], 15)
    return await db.loans.find_one({"id": loan_id}, {"_id": 0})

# ==================== LEARNING ROUTES ====================

@api.get("/learning/stories")
async def get_stories(user=Depends(get_current_user)):
    return STORIES

@api.get("/learning/stories/{story_id}")
async def get_story(story_id: str, user=Depends(get_current_user)):
    for s in STORIES:
        if s["id"] == story_id:
            return s
    raise HTTPException(status_code=404, detail="Story not found")

@api.post("/learning/complete")
async def complete_lesson(req: LearningComplete, user=Depends(get_current_user)):
    existing = await db.learning_progress.find_one({"kid_id": req.kid_id, "story_id": req.story_id}, {"_id": 0})
    if existing:
        if req.score > existing.get("score", 0):
            await db.learning_progress.update_one({"kid_id": req.kid_id, "story_id": req.story_id}, {"$set": {"score": req.score}})
        return {"message": "Progress updated", "already_completed": True}
    progress = {
        "id": str(uuid.uuid4()),
        "kid_id": req.kid_id,
        "story_id": req.story_id,
        "score": req.score,
        "completed_at": datetime.now(timezone.utc).isoformat()
    }
    await db.learning_progress.insert_one(progress)
    story = next((s for s in STORIES if s["id"] == req.story_id), None)
    if story:
        await add_xp(req.kid_id, story["reward_xp"])
    return {"message": "Lesson completed!", "xp_earned": story["reward_xp"] if story else 0}

@api.get("/learning/progress/{kid_id}")
async def get_learning_progress(kid_id: str, user=Depends(get_current_user)):
    progress = await db.learning_progress.find({"kid_id": kid_id}, {"_id": 0}).to_list(100)
    return progress

# ==================== DASHBOARD ROUTES ====================

@api.get("/dashboard/kid/{kid_id}")
async def kid_dashboard(kid_id: str, user=Depends(get_current_user)):
    kid = await db.kids.find_one({"id": kid_id, "parent_id": user["id"]}, {"_id": 0})
    if not kid:
        raise HTTPException(status_code=404, detail="Kid not found")
    wallet = await db.wallets.find_one({"kid_id": kid_id}, {"_id": 0})
    active_tasks = await db.tasks.find({"kid_id": kid_id, "status": {"$in": ["pending", "completed"]}}, {"_id": 0}).to_list(50)
    recent_txns = await db.transactions.find({"kid_id": kid_id}, {"_id": 0}).sort("created_at", -1).to_list(10)
    active_goals = await db.goals.find({"kid_id": kid_id, "status": "active"}, {"_id": 0}).to_list(50)
    active_sips = await db.sips.find({"kid_id": kid_id, "status": "active"}, {"_id": 0}).to_list(50)
    active_loans = await db.loans.find({"kid_id": kid_id, "status": {"$in": ["pending", "active"]}}, {"_id": 0}).to_list(50)
    learning = await db.learning_progress.find({"kid_id": kid_id}, {"_id": 0}).to_list(100)
    level_info = get_level_for_xp(kid.get("xp", 0))
    next_level = get_next_level(level_info["level"])
    return {
        "kid": kid,
        "wallet": wallet,
        "level_info": level_info,
        "next_level": next_level,
        "active_tasks": active_tasks,
        "recent_transactions": recent_txns,
        "active_goals": active_goals,
        "active_sips": active_sips,
        "active_loans": active_loans,
        "learning_progress": learning,
        "stats": {
            "total_tasks_completed": await db.tasks.count_documents({"kid_id": kid_id, "status": "approved"}),
            "total_stories_read": len(learning),
            "active_goals_count": len(active_goals),
            "active_sips_count": len(active_sips),
        }
    }

# ==================== CONFIG ROUTES ====================

@api.get("/config/levels")
async def get_levels():
    return LEVELS

@api.get("/config/avatars")
async def get_avatars():
    return AVATARS

# ==================== APP CONFIG ====================

app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.kids.create_index("id", unique=True)
    await db.kids.create_index("parent_id")
    await db.wallets.create_index("kid_id", unique=True)
    await db.transactions.create_index("kid_id")
    await db.tasks.create_index([("kid_id", 1), ("status", 1)])
    await db.goals.create_index("kid_id")
    await db.sips.create_index("kid_id")
    await db.loans.create_index("kid_id")
    await db.learning_progress.create_index([("kid_id", 1), ("story_id", 1)], unique=True)
    logger.info("Kids Money API started successfully")

@app.on_event("shutdown")
async def shutdown():
    client.close()
