from typing import Dict, Optional
from langchain_core.messages import BaseMessage

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    cell_id: str
    message: BaseMessage
    next: Optional[Dict] = Field(default=None)
