import os
import sys
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.responses import Response, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from typing import List, Dict, Any
import time

from schemas import (
    FieldSchema,
    PreviewFieldSchema,
    InsertSchemaTemplate, 
    SchemaTemplate, 
    GenerateDataRequest, 
    AIPromptRequest
)
from storage import storage
from openai_service import generate_schema_from_prompt, generate_data_for_field
from file_parser import parse_uploaded_file
from export_service import export_data

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting DataForge AI server...")
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

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = int((time.time() - start_time) * 1000)
    
    if request.url.path.startswith("/api"):
        log_line = f"{request.method} {request.url.path} {response.status_code} in {duration}ms"
        if len(log_line) > 80:
            log_line = log_line[:79] + "…"
        print(log_line)
    
    return response

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        if not file:
            raise HTTPException(status_code=400, detail="No file uploaded")
        
        contents = await file.read()
        fields = await parse_uploaded_file(contents, file.filename or "")
        
        return {"fields": fields}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"File upload error: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

@app.post("/api/generate-schema")
async def generate_schema(request: AIPromptRequest):
    try:
        fields = await generate_schema_from_prompt(request.prompt)
        return {"fields": fields}
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
        data = []
        
        for i in range(count):
            row = {}
            for field in fields:
                row[field.name] = await generate_data_for_field(field.name, field.type)
            data.append(row)
        
        return {"data": data}
    except Exception as e:
        print(f"Data generation error: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to generate data: {str(e)}")

@app.post("/api/export")
async def export_dataset(request: GenerateDataRequest):
    try:
        data = []
        for i in range(request.rowCount):
            row = {}
            for field in request.fields:
                row[field.name] = await generate_data_for_field(field.name, field.type)
            data.append(row)
        
        content, content_type, extension = export_data(data, request.format)
        
        filename = f"data-export-{int(time.time() * 1000)}.{extension}"
        
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
    return {"status": "healthy", "service": "DataForge AI"}

client_dist = Path(__file__).parent.parent / "dist" / "public"

if client_dist.exists() and (client_dist / "index.html").exists():
    app.mount("/assets", StaticFiles(directory=str(client_dist / "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        
        if not full_path or full_path == "index.html":
            return FileResponse(client_dist / "index.html")
        
        file_path = client_dist / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        
        return FileResponse(client_dist / "index.html")

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        log_level="info"
    )
