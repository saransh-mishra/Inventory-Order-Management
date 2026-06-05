from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .database import engine, Base
from .routers import products, customers, orders
from .config import settings
from . import models  # Ensure models are loaded so create_all works

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="Inventory & Order Management API",
    description="Production-Ready backend API for managing products, customers, orders and stock tracking.",
    version="1.0.0",
    lifespan=lifespan
)

origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)

@app.get("/health", tags=["health"])
def health_check():
    return {"status": "healthy", "service": "inventory-order-api"}
