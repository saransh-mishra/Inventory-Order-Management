from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    DATABASE_URL: str = Field(
        default="postgresql://postgres:postgres@db:5432/inventory",
        validation_alias="DATABASE_URL"
    )
    CORS_ORIGINS: str = Field(
        default="*",
        validation_alias="CORS_ORIGINS"
    )

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
