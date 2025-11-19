from typing import Dict, List, Optional
import uuid
from server.schemas import SchemaTemplate, InsertSchemaTemplate

class MemStorage:
    def __init__(self):
        self.templates: Dict[str, SchemaTemplate] = {}
    
    async def get_template(self, template_id: str) -> Optional[SchemaTemplate]:
        return self.templates.get(template_id)
    
    async def get_all_templates(self) -> List[SchemaTemplate]:
        return list(self.templates.values())
    
    async def create_template(self, insert_template: InsertSchemaTemplate) -> SchemaTemplate:
        template_id = str(uuid.uuid4())
        template = SchemaTemplate(
            id=template_id,
            name=insert_template.name,
            description=insert_template.description,
            fields=insert_template.fields
        )
        self.templates[template_id] = template
        return template
    
    async def delete_template(self, template_id: str) -> bool:
        if template_id in self.templates:
            del self.templates[template_id]
            return True
        return False

storage = MemStorage()
