# DataForge AI

A universal ETL data creation application with dual input modes:
1. **File Upload**: Upload CSV/Excel templates to extract schema automatically
2. **AI Generation**: Use natural language prompts to generate schemas with OpenAI GPT-5

## Features

### Input Methods
- **Upload Template**: Drag-and-drop CSV and Excel files (.csv, .xls, .xlsx)
- **AI Prompt**: Describe your dataset in natural language to generate schema

### Schema Management
- Dynamic field configuration with 10 data types:
  - Text, Number, Date, Boolean
  - Email, Phone, Address, URL, UUID, Currency
- Add, remove, and configure fields manually
- Save and load reusable schema templates

### Data Generation & Export
- Generate realistic sample data based on field types
- Intelligent data generation (names, emails, addresses, etc.)
- Preview up to 10 sample rows before exporting
- Export in multiple formats: JSON, CSV, XML, Parquet (JSON fallback)
- Generate from 10 to 100,000+ rows

## Technical Stack

### Frontend
- React with TypeScript
- Tailwind CSS + Shadcn UI components
- React Query for state management
- React Dropzone for file uploads
- Wouter for routing

### Backend
- **FastAPI** (Python) for high-performance async API
- **OpenAI** Python library for AI-powered schema generation
- **Pandas** for CSV and Excel parsing
- **Faker** for intelligent data generation
- **openpyxl** for Excel file handling
- **xml-js** conversion via dicttoxml
- In-memory storage for templates

## Project Structure

```
client/
  src/
    components/
      file-upload-tab.tsx     - File upload interface
      ai-prompt-tab.tsx       - AI prompt interface
      schema-builder.tsx      - Field configuration UI
      data-preview.tsx        - Data preview table
      export-controls.tsx     - Export format selector
      template-dialog.tsx     - Template save/load
    pages/
      home.tsx                - Main application page
server/
  main.py                     - FastAPI application entry point
  schemas.py                  - Pydantic models and data types
  storage.py                  - In-memory template storage
  openai_service.py           - AI schema generation with OpenAI
  file_parser.py              - CSV/Excel parsing with pandas
  export_service.py           - Multi-format data export
  index.ts                    - Node.js wrapper to launch Python server
```

## API Endpoints

- `POST /api/upload` - Upload CSV/Excel file and extract schema
- `POST /api/generate-schema` - Generate schema from AI prompt
- `POST /api/generate-preview` - Generate sample data preview
- `POST /api/export` - Generate and export full dataset
- `GET /api/templates` - Get all saved templates
- `POST /api/templates` - Save new template
- `DELETE /api/templates/:id` - Delete template

## Environment Variables

- `OPENAI_API_KEY` - Required for AI-powered schema generation
- `SESSION_SECRET` - Used for session management

## Data Types

The application intelligently generates data based on field types:

- **String**: Context-aware text (names, titles, descriptions)
- **Number**: Random integers
- **Date**: Random dates in ISO format
- **Boolean**: Random true/false values
- **Email**: Generated email addresses
- **Phone**: US phone numbers
- **Address**: Full addresses with street, city, state, zip
- **URL**: Sample URLs
- **UUID**: Unique identifiers
- **Currency**: Dollar amounts

## Recent Changes

### November 2025 - Backend Migration to Python
- **Migrated backend from TypeScript/Node.js to Python/FastAPI**
- Improved performance with async FastAPI server
- Enhanced data generation using Faker library for realistic data
- Better file parsing with pandas for CSV and Excel files
- Maintained all existing features and API compatibility
- OpenAI integration remains optional (gracefully handles missing API key)

### Initial Release
- Dual input modes: File upload and AI-powered generation
- AI-powered schema generation using OpenAI
- Multi-format export (JSON, CSV, XML)
- Template save/load functionality
- Enhanced file parsing with automatic type detection
- Professional ETL-focused design

## User Preferences

- Professional ETL-focused design using Material Design 3 principles
- Clean, data-centric interface with Inter font
- Responsive layout optimized for desktop workflows
