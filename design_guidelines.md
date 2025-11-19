# DataForge AI - Design Guidelines

## Design Approach
**System-Based Approach: Material Design 3**
Rationale: ETL tools require clarity, efficiency, and familiar patterns for professional users working with complex data workflows. Material Design's elevation system, clear component hierarchy, and robust data table patterns are ideal for this information-dense application.

## Typography
- **Primary Font**: Inter (via Google Fonts CDN)
- **Hierarchy**:
  - Page Headers: text-3xl font-bold (36px)
  - Section Headers: text-xl font-semibold (20px)
  - Card Titles: text-lg font-medium (18px)
  - Body Text: text-base (16px)
  - Labels/Captions: text-sm (14px)
  - Table Data: text-sm font-mono for data values

## Layout System
**Spacing Primitives**: Tailwind units of 2, 4, 6, and 8
- Component padding: p-4 to p-6
- Section gaps: gap-6 to gap-8
- Card spacing: p-6
- Form field gaps: gap-4
- Button padding: px-6 py-3

**Container Strategy**:
- Main app container: max-w-7xl mx-auto px-6
- Two-column layouts for input/preview: grid grid-cols-1 lg:grid-cols-2 gap-8
- Full-width data tables within sections

## Core Components

### Navigation & Layout
**Top Header Bar**:
- Application logo/title on left
- Action buttons (Save Template, Export) on right
- Fixed height h-16 with shadow-sm elevation

**Tab Navigation**:
- Material-style tabs for dual input modes: "Upload Template" | "AI Prompt Generation"
- Active tab indicator with bottom border
- Icons: Document icon for upload, Sparkles icon for AI

### File Upload Zone
**Drag-and-Drop Area**:
- Large dropzone (min-h-64) with dashed border
- Centered icon (CloudArrow or Upload - use Heroicons)
- "Drag CSV/Excel files or click to browse" text
- Active state with border transition on drag-over
- File list display with filename, size, remove button after upload

### Schema Builder
**Field Configuration Cards**:
- Each field as a card with rounded-lg and border
- Three-column grid within card: Field Name | Data Type | Actions
- Data type dropdown with icons (String, Number, Date, Boolean, Email, Phone, Address)
- Drag handle icon on left for reordering
- Remove button (X icon) on right
- "Add Field" button at bottom with plus icon

### AI Prompt Interface
**Prompt Input**:
- Large textarea (min-h-32) with rounded border
- Placeholder: "Describe your dataset (e.g., 'Generate customer data with name, email, phone, and purchase history')"
- "Generate Schema" button below (primary CTA style)
- Loading spinner during AI processing

### Data Preview Table
**Table Design**:
- Sticky header row with text-sm font-semibold
- Zebra striping for rows (subtle background alternation)
- Monospace font for data cells
- Horizontal scroll for wide schemas
- Max height with vertical scroll (max-h-96)
- Row count indicator above table

### Controls Panel
**Row Count Selector**:
- Slider input with visible value display
- Range: 10 to 10,000 with preset options (10, 100, 500, 1000, 5000, 10000)
- Number input alternative for precise control

**Export Format Selector**:
- Button group with four options: JSON | CSV | XML | Parquet
- Icon for each format (use document icons)
- Active state with filled background

**Template Management**:
- "Save Template" and "Load Template" as secondary buttons
- Modal dialog for naming/selecting templates

### Action Buttons
**Primary CTA**: "Generate Data" or "Export Data"
- Prominent size: px-8 py-3
- Positioned bottom-right of workspace or centered below preview

**Secondary Actions**: Template save/load, file upload trigger
- px-4 py-2, outlined style

## Animations
**Minimal Motion**:
- Fade-in for generated data table (300ms)
- Smooth collapse/expand for advanced options
- Loading spinner for AI generation
- No scroll-triggered or decorative animations

## Images
**No Hero Image Required**
This is a professional tool focused on functionality. Instead:
- Use icon illustrations within empty states (upload zone, no data preview)
- Format-specific icons for export buttons
- Small badge/logo in header only

## Component Placement
**Three-Panel Layout** (stacked on mobile, side-by-side on desktop):
1. **Left Panel**: Input mode (upload or prompt) + schema builder (40% width on desktop)
2. **Right Panel**: Data preview table + controls (60% width on desktop)
3. **Bottom Bar**: Export controls and actions, full width, elevated

**Responsive Strategy**:
- Mobile: Single column stack (input → schema → preview → export)
- Tablet: Two columns (input+schema | preview)
- Desktop: Optimized three-panel with maximum table visibility

## Professional ETL Aesthetics
- Clean, uncluttered workspace prioritizing data visibility
- Consistent elevation system (cards at 1dp, modals at 8dp)
- Ample whitespace between functional zones
- Monospace fonts for all data values to maintain alignment
- Clear visual separation between input, processing, and output stages