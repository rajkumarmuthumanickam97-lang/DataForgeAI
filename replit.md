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
- Express.js with TypeScript
- OpenAI GPT-5 for AI-powered schema generation
- Multer for file uploads
- XLSX for Excel parsing
- PapaParse for CSV parsing
- xml-js for XML export
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
  routes.ts                   - API endpoints
  storage.ts                  - In-memory template storage
  openai-service.ts           - AI schema generation
  file-parser.ts              - CSV/Excel parsing
  export-service.ts           - Multi-format export
shared/
  schema.ts                   - TypeScript types and schemas
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

- Initial implementation with dual input modes
- Added AI-powered schema generation using OpenAI GPT-5
- Implemented multi-format export (JSON, CSV, XML)
- Added template save/load functionality
- Enhanced file parsing with better error handling
- Removed emoji icons from schema builder per design guidelines

## User Preferences

- Professional ETL-focused design using Material Design 3 principles
- Clean, data-centric interface with Inter font
- Responsive layout optimized for desktop workflows
