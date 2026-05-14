from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from config.settings import settings

# NOTE:
# - pool_pre_ping avoids stale connections
# - pool_size/max_overflow are safe local defaults (tune for prod)
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    future=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
