# DataForge AI

A universal ETL data creation application with dual input modes:
1. **File Upload**: Upload CSV/Excel templates to extract schema automatically
2. **AI Generation**: Use natural language prompts to generate schemas with OpenAI

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
- Export in multiple formats: JSON, CSV, XML
- Generate from 10 to 100,000+ rows

## Technical Stack

### Frontend
- **Pure HTML/CSS/JavaScript** - No build tools required
- Vanilla JavaScript for interactivity
- Responsive modern design
- Drag-and-drop file uploads

### Backend
- **FastAPI** (Python) for high-performance async API
- **Jinja2** for HTML templating
- **OpenAI** Python library for AI-powered schema generation
- **Pandas** for CSV/Excel parsing and data manipulation
- **Faker** for intelligent data generation
- **openpyxl** for Excel file handling
- In-memory storage for templates

## Project Structure

```
main.py                       - FastAPI application entry point
templates/
  index.html                  - Main application template
static/
  css/
    styles.css                - Application styles
  js/
    app.js                    - Frontend JavaScript logic
server/
  schemas.py                  - Pydantic models and data types
  storage.py                  - In-memory template storage
  openai_service.py           - AI schema generation with OpenAI
  file_parser.py              - CSV/Excel parsing with pandas
  export_service.py           - Multi-format data export with pandas
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

### November 2025 - Complete Migration to Pure Python
- **Completely removed Node.js and React dependencies**
- **Converted frontend to pure HTML/CSS/JavaScript**
- Simplified architecture - no build tools required
- All data operations now use pandas DataFrames
- Maintained all existing features and API compatibility
- Jinja2 templating for server-side HTML rendering
- Improved performance with async FastAPI server
- Enhanced data generation using Faker library
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
