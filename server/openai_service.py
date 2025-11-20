import os
import json
import uuid
from openai import OpenAI
from server.schemas import FieldSchema, DataType
from typing import List, Any
from faker import Faker
import random
from datetime import datetime, timedelta

fake = Faker()

def get_openai_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable is required for AI-powered schema generation. Please add it to enable this feature.")
    return OpenAI(api_key=api_key)

async def generate_schema_from_prompt(prompt: str) -> List[FieldSchema]:
    try:
        client = get_openai_client()
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": """You are a data schema expert. Given a user's description of a dataset, generate an appropriate schema with field names and data types.

Available data types: string, number, date, boolean, email, phone, address, url, uuid, currency

Respond with JSON in this exact format:
{
  "fields": [
    { "name": "field_name", "type": "data_type", "order": 0 },
    ...
  ]
}

Be intelligent about field types based on context. For example:
- Names should be "string"
- Ages should be "number"
- Birth dates should be "date"
- Email addresses should be "email"
- Phone numbers should be "phone"
- Prices/amounts should be "currency"
- True/false values should be "boolean"
""",
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            response_format={"type": "json_object"},
        )
        
        result = json.loads(response.choices[0].message.content or "{}")
        
        if not result.get("fields") or not isinstance(result["fields"], list):
            raise ValueError("Invalid response from AI")
        
        fields = []
        for index, field in enumerate(result["fields"]):
            fields.append(FieldSchema(
                id=str(uuid.uuid4()),
                name=field["name"],
                type=field["type"],
                order=index
            ))
        
        return fields
    except Exception as e:
        print(f"OpenAI schema generation error: {e}")
        raise Exception(f"Failed to generate schema: {str(e)}")

async def generate_data_for_field(field_name: str, field_type: DataType) -> Any:
    name_lower = field_name.lower()
    
    if field_type == "string":
        return generate_random_string(field_name)
    
    elif field_type == "number":
        return random.randint(0, 1000)
    
    elif field_type == "date":
        random_date = datetime.now() - timedelta(days=random.randint(0, 1825))
        return random_date.strftime("%Y-%m-%d")
    
    elif field_type == "boolean":
        return random.choice([True, False])
    
    elif field_type == "email":
        return fake.email()
    
    elif field_type == "phone":
        return fake.phone_number()
    
    elif field_type == "address":
        return fake.address().replace("\n", ", ")
    
    elif field_type == "url":
        return fake.url()
    
    elif field_type == "uuid":
        return str(uuid.uuid4())
    
    elif field_type == "currency":
        return f"${random.uniform(0, 10000):.2f}"
    
    else:
        return generate_random_string(field_name)

def generate_random_string(field_name: str) -> str:
    name = field_name.lower()
    
    if "name" in name or "first" in name or "last" in name:
        if "first" in name:
            return fake.first_name()
        elif "last" in name:
            return fake.last_name()
        else:
            return fake.name()
    
    if "title" in name or "subject" in name:
        return fake.catch_phrase()
    
    if "description" in name or "comment" in name or "note" in name:
        return fake.sentence()
    
    if "status" in name:
        return random.choice(["Active", "Pending", "Completed", "In Progress", "Cancelled"])
    
    if "category" in name or "type" in name:
        return random.choice(["Type A", "Type B", "Category 1", "Category 2", "Standard"])
    
    if "company" in name or "organization" in name:
        return fake.company()
    
    if "city" in name:
        return fake.city()
    
    if "country" in name:
        return fake.country()
    
    return f"Sample {field_name} {random.randint(1, 1000)}"
