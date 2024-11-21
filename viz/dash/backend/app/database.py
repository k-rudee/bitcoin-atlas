from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from databases import Database
import os
from dotenv import load_dotenv

load_dotenv()

# Use the absolute path to your SQLite database
DATABASE_URL = "sqlite:///./bitcoin_clusters.db"

# SQLAlchemy engine for sync operations
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

# Database instance for async operations
database = Database(DATABASE_URL)

# SessionLocal class for sync operations when needed
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for SQLAlchemy models
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()