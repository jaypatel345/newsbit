
from pydantic import BaseModel


class ArticleResponse(BaseModel):
    id: int
    title:str
    description:str
    content:str
    source_name:str


