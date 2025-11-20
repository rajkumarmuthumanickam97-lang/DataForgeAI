import os
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.responses import Response, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from typing import List
import pandas as pd

from server.schemas import (
    FieldSchema,
    PreviewFieldSchema,
    InsertSchemaTemplate, 
    SchemaTemplate, 
    GenerateDataRequest, 
    AIPromptRequest
)
from server.storage import storage
from server.openai_service import generate_schema_from_prompt, generate_data_for_field
from server.file_parser import parse_uploaded_file
from server.export_service import export_data_pandas

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting DataForge AI server (Pure Python Edition)...")
    print("Server running on http://0.0.0.0:5000")
    yield
    print("Shutting down DataForge AI server...")

app = FastAPI(title="DataForge AI", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        if not file:
            raise HTTPException(status_code=400, detail="No file uploaded")
        
        contents = await file.read()
        fields = await parse_uploaded_file(contents, file.filename or "")
        
        return {"fields": [f.model_dump() for f in fields]}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"File upload error: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

@app.post("/api/generate-schema")
async def generate_schema(request: AIPromptRequest):
    try:
        fields = await generate_schema_from_prompt(request.prompt)
        return {"fields": [f.model_dump() for f in fields]}
    except Exception as e:
        print(f"Schema generation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/generate-preview")
async def generate_preview(request: Request):
    try:
        body = await request.json()
        fields = [PreviewFieldSchema(**f) for f in body.get("fields", [])]
        row_count = body.get("rowCount", 10)
        
        if not fields or len(fields) == 0:
            raise HTTPException(status_code=400, detail="No fields provided")
        
        count = min(row_count, 10)
        
        df = pd.DataFrame()
        for field in fields:
            column_data = []
            for i in range(count):
                column_data.append(await generate_data_for_field(field.name, field.type))
            df[field.name] = column_data
        
        data = df.to_dict(orient='records')
        
        return {"data": data}
    except Exception as e:
        print(f"Data generation error: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to generate data: {str(e)}")

@app.post("/api/export")
async def export_dataset(request: GenerateDataRequest):
    try:
        df = pd.DataFrame()
        for field in request.fields:
            column_data = []
            for i in range(request.rowCount):
                column_data.append(await generate_data_for_field(field.name, field.type))
            df[field.name] = column_data
        
        content, content_type, extension = export_data_pandas(df, request.format)
        
        filename = f"data-export-{pd.Timestamp.now().strftime('%Y%m%d_%H%M%S')}.{extension}"
        
        return Response(
            content=content,
            media_type=content_type,
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )
    except Exception as e:
        print(f"Export error: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to export data: {str(e)}")

@app.get("/api/templates")
async def get_templates() -> List[SchemaTemplate]:
    try:
        return await storage.get_all_templates()
    except Exception as e:
        print(f"Get templates error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch templates")

@app.post("/api/templates")
async def create_template(template: InsertSchemaTemplate) -> SchemaTemplate:
    try:
        return await storage.create_template(template)
    except Exception as e:
        print(f"Create template error: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to create template: {str(e)}")

@app.delete("/api/templates/{template_id}")
async def delete_template(template_id: str):
    try:
        deleted = await storage.delete_template(template_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Template not found")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Delete template error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete template")

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "DataForge AI (Pure Python)"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )
