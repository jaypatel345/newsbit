from pydantic import BaseModel, Field


class EntityExtraction(BaseModel):

    people: list[str] = Field(default_factory=list)

    companies: list[str] = Field(default_factory=list)

    organizations: list[str] = Field(default_factory=list)

    countries: list[str] = Field(default_factory=list)

    topics: list[str] = Field(default_factory=list)


class EntitySearchResponse(BaseModel):
    id: int
    name: str
    type: str

    class Config:
        from_attributes = True