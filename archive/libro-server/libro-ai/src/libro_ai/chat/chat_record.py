from calendar import c
from typing import List, Dict, Optional
from pydantic import BaseModel
from langchain.schema.messages import BaseMessage
from .chat_message import ChatMessage


class ChatRecord(BaseModel):
    start_message: Optional[ChatMessage] = None

    def get_messages(self) -> List[BaseMessage]:
        messages = []
        current = self.start_message
        while current:
            messages.append(current.message)
            current = current.next
        return messages

    def append_messages(
        self,
        cell_id: str,
        message: List[BaseMessage],
        reset: bool = False,
    ):
        first = message[0]
        for m in message:
            self.append_message(cell_id, m, reset=(reset and first == m))

    def append_message(
        self,
        cell_id: str,
        message: BaseMessage,
        reset: bool = False,
    ):
        chat_message = ChatMessage(message=message, cell_id=cell_id)
        if not self.start_message:
            self.start_message = chat_message
            return
        if reset:
            current = self.start_message
            if current.cell_id == cell_id:
                self.start_message = chat_message
                return
            while current and isinstance(current, ChatMessage):
                if not current.next:
                    current.next = chat_message
                    break
                if current.next.cell_id == cell_id:
                    current.next = chat_message
                    break
                current = current.next
        else:
            current = self.start_message
            while current and isinstance(current, ChatMessage):
                if not current.next:
                    current.next = chat_message
                    break
                if (
                    current.cell_id == cell_id
                    and isinstance(current.next, ChatMessage)
                    and current.next.cell_id != cell_id
                ):
                    current.next = chat_message
                    break
                current = current.next


class ChatRecordProvider(BaseModel):
    record_dict: Dict[str, ChatRecord] = {}

    def get_record(self, record_id: str) -> ChatRecord:
        if record_id not in self.record_dict:
            self.record_dict[record_id] = ChatRecord()
        return self.record_dict[record_id]

    def get_records(self) -> List[str]:
        return list(self.record_dict.keys())
