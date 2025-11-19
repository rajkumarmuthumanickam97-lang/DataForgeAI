import pandas as pd
import uuid
from io import BytesIO
from typing import List
from schemas import FieldSchema, DataType

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

async def parse_uploaded_file(file_content: bytes, filename: str) -> List[FieldSchema]:
    if not file_content or len(file_content) == 0:
        raise ValueError("File is empty or corrupted")
    
    if len(file_content) > MAX_FILE_SIZE:
        raise ValueError(f"File size exceeds maximum limit of {MAX_FILE_SIZE / 1024 / 1024}MB")
    
    extension = filename.split(".")[-1].lower() if "." in filename else None
    
    if not extension:
        raise ValueError("File has no extension")
    
    if extension == "csv":
        return parse_csv(file_content)
    elif extension in ["xlsx", "xls"]:
        return parse_excel(file_content)
    
    raise ValueError("Unsupported file format. Please upload CSV or Excel files.")

def parse_csv(file_content: bytes) -> List[FieldSchema]:
    try:
        df = pd.read_csv(BytesIO(file_content))
        
        if df.empty:
            raise ValueError("CSV file has no data rows")
        
        if len(df.columns) == 0:
            raise ValueError("CSV file has no valid columns")
        
        fields = []
        for index, column in enumerate(df.columns):
            column_name = str(column).strip() or f"column_{index + 1}"
            column_data: pd.Series = df[column]  # type: ignore
            data_type = infer_data_type(column_name, column_data)
            
            fields.append(FieldSchema(
                id=str(uuid.uuid4()),
                name=column_name,
                type=data_type,
                order=index
            ))
        
        return fields
    except pd.errors.EmptyDataError:
        raise ValueError("CSV file is empty")
    except Exception as e:
        if str(e).startswith("CSV"):
            raise
        raise ValueError(f"Failed to process CSV file: {str(e)}")

def parse_excel(file_content: bytes) -> List[FieldSchema]:
    try:
        df = pd.read_excel(BytesIO(file_content))
        
        if df.empty:
            raise ValueError("Excel file has no data rows")
        
        if len(df.columns) == 0:
            raise ValueError("Excel file has no valid columns")
        
        fields = []
        for index, column in enumerate(df.columns):
            column_name = str(column).strip() or f"column_{index + 1}"
            column_data: pd.Series = df[column]  # type: ignore
            data_type = infer_data_type(column_name, column_data)
            
            fields.append(FieldSchema(
                id=str(uuid.uuid4()),
                name=column_name,
                type=data_type,
                order=index
            ))
        
        return fields
    except Exception as e:
        if str(e).startswith("Excel"):
            raise
        raise ValueError(f"Failed to process Excel file: {str(e)}. Please ensure it's a valid .xlsx or .xls file.")

def infer_data_type(field_name: str, sample_data: pd.Series) -> DataType:
    name_lower = field_name.lower()
    
    if "email" in name_lower or "e-mail" in name_lower:
        return "email"
    
    if "phone" in name_lower or "mobile" in name_lower or "tel" in name_lower:
        return "phone"
    
    if "address" in name_lower or "location" in name_lower or "street" in name_lower:
        return "address"
    
    if "url" in name_lower or "website" in name_lower or "link" in name_lower:
        return "url"
    
    if "date" in name_lower or "time" in name_lower or "dob" in name_lower or "birth" in name_lower:
        return "date"
    
    if "price" in name_lower or "amount" in name_lower or "cost" in name_lower or "salary" in name_lower:
        return "currency"
    
    if "id" in name_lower and ("uuid" in name_lower or "guid" in name_lower):
        return "uuid"
    
    if name_lower in ["active", "enabled", "verified"] or name_lower.startswith("is_"):
        return "boolean"
    
    non_null_values = sample_data.dropna().head(5)
    
    if len(non_null_values) > 0:
        if pd.api.types.is_bool_dtype(sample_data):
            return "boolean"
        
        if pd.api.types.is_numeric_dtype(sample_data):
            return "number"
        
        if all(str(v).lower() in ["true", "false", "0", "1"] for v in non_null_values):
            return "boolean"
    
    return "string"
