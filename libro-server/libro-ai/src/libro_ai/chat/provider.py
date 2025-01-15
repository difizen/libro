import json
from typing import List, Dict
from pydantic import BaseModel
from .object import ChatObject, ChatObjectProvider
from .executor import ChatExecutor


class ChatObjectManager(BaseModel):
    providers: List[ChatObject] = []
    executors: Dict[str, ChatExecutor] = {}
    

    def register_provider(self, provider:ChatObjectProvider):
        if provider.name in self.providers:
            print(f"Provider {provider.name} already exists")
            return
        if isinstance(provider, ChatObjectProvider) == False:
            raise TypeError('provider must be ChatObjectProvider')
        if provider.name in map(lambda x: x.name, self.providers):
            print(f"Provider {provider.name} already exists")
            return
        self.providers.append(provider)
    
    def get_object_dict(self) -> Dict[str, ChatObject]:
        chat_objects: Dict[str, ChatObject] = {}
        for provider in self.providers:
            for item in provider.list():
                key = item.key
                exists = chat_objects.get(key)
                if exists:
                    if exists.order > item.order:
                        continue
                chat_objects[key] = item
        return chat_objects

    def get_object_list(self) -> List[ChatObject]:
        """List chat items."""
        list = sorted(self.get_object_dict().values(), key=lambda x: x.order)
        return list
    
    def dump_list_json(self) -> str:
        """List chat items."""
        list = self.get_object_list()
        return json.dumps([item.model_dump() for item in list])
    


 