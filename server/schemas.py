from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from enum import Enum

DataType = Literal["string", "number", "date", "boolean", "email", "phone", "address", "url", "uuid", "currency"]
ExportFormat = Literal["json", "csv", "xml"]

class FieldSchema(BaseModel):
    id: str
    name: str = Field(min_length=1)
    type: DataType
    order: int

class InsertFieldSchema(BaseModel):
    name: str = Field(min_length=1)
    type: DataType
    order: int

class SchemaTemplate(BaseModel):
    id: str
    name: str = Field(min_length=1)
    description: Optional[str] = None
    fields: List[FieldSchema]

class InsertSchemaTemplate(BaseModel):
    name: str = Field(min_length=1)
    description: Optional[str] = None
    fields: List[FieldSchema]

class GenerateDataRequest(BaseModel):
    fields: List[FieldSchema]
    rowCount: int = Field(ge=1, le=100000)
    format: ExportFormat

class AIPromptRequest(BaseModel):
    prompt: str = Field(min_length=10)

class AISchemaResponse(BaseModel):
    fields: List[InsertFieldSchema]
