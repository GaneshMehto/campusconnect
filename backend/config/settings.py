from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ENV: str = "development"
    API_V1_PREFIX: str = "/api/v1"

    DATABASE_URL: str

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    JWT_RESET_TOKEN_EXPIRE_HOURS: int = 24
    JWT_VERIFICATION_TOKEN_EXPIRE_HOURS: int = 48

    CORS_ORIGINS: str = "http://localhost:5173,https://campusconnect-h1bwzyxxx-ganeshmehtos-projects.vercel.app"

    # Email configuration
    RESEND_API_KEY: str = ""
    FRONTEND_URL: str = "http://localhost:5173"
    APP_NAME: str = "CampusConnect"

    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_MB: int = 5

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
