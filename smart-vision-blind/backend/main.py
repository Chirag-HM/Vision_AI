"""
main.py
Smart Vision FastAPI application entry point — v3.0 with MongoDB/Beanie.
"""

import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from core.database import lifespan
from auth.router import router as auth_router
from auth.dependencies import get_ws_user
from auth.models import User

load_dotenv()

# ─── App Init (uses Beanie lifespan for DB connect/disconnect) ────────────────
app = FastAPI(
    title="Smart Vision Backend API",
    description="AI Assistive IoT platform for blind people — MongoDB edition",
    version="3.0.0",
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth_router)

# ─── WebSocket Connection Manager ─────────────────────────────────────────────
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        print(f"[WS] User {user_id} connected. Active: {len(self.active_connections)}")

    def disconnect(self, user_id: str):
        self.active_connections.pop(user_id, None)
        print(f"[WS] User {user_id} disconnected.")

    async def broadcast(self, message: str):
        for ws in self.active_connections.values():
            await ws.send_text(message)

    async def send_to(self, user_id: str, message: str):
        ws = self.active_connections.get(user_id)
        if ws:
            await ws.send_text(message)

manager = ConnectionManager()

# ─── Health ───────────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"message": "Smart Vision API v3.0 — MongoDB + Beanie"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/debug-env")
async def debug_env():
    import os
    from auth.jwt_utils import SECRET_KEY as JWT_SECRET
    return {
        "os_jwt_secret_key": os.getenv("JWT_SECRET_KEY"),
        "os_secret_key": os.getenv("SECRET_KEY"),
        "jwt_utils_secret_key": JWT_SECRET,
    }


# ─── Authenticated WebSocket ──────────────────────────────────────────────────
@app.websocket("/ws/iot")
async def websocket_iot_endpoint(
    websocket: WebSocket,
    current_user: User = Depends(get_ws_user),
):
    """
    Authenticated real-time WebSocket.
    Connect with: ws://localhost:8000/ws/iot?token=<access_token>
    """
    user_id = str(current_user.id)
    await manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            print(f"[WS] {current_user.role} {user_id}: {data}")
            await manager.broadcast(f"[{current_user.role}:{user_id}] {data}")
    except WebSocketDisconnect:
        manager.disconnect(user_id)
