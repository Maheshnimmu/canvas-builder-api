# Canvas Builder API with PDF Export

A full-stack web application for creating and exporting canvas designs as compressed PDFs.

## Features

- **Canvas Creation**: Initialize canvases with custom dimensions
- **Element Addition**: Add rectangles, circles, text, and images
- **Live Preview**: Real-time canvas preview with element stacking
- **PDF Export**: Export canvas as compressed PDF with automatic compression
- **Form Validation**: Comprehensive input validation with visual feedback
- **Modern UI**: Clean, responsive interface with tabbed controls

## Tech Stack

### Backend
- **Node.js** with Express.js
- **Canvas API** for drawing operations
- **PDFKit** for PDF generation
- **HTTP/HTTPS** modules for image fetching
- **Modular Architecture** with routes, controllers, and utilities

### Frontend
- **Vanilla JavaScript** with Fetch API
- **HTML5 Canvas** for live preview
- **CSS3** with modern styling and animations
- **Responsive Design** for various screen sizes

## Project Structure

```
Canvas/
├── backend/
│   ├── app.js                 # Main Express server
│   ├── routes/
│   │   └── canvasRoutes.js    # API route definitions
│   ├── controllers/
│   │   └── canvasController.js # Route handlers
│   ├── utils/
│   │   └── CanvasService.js   # Canvas service class
│   └── package.json
├── frontend/
│   ├── index.html             # Main HTML file
│   ├── script.js              # Frontend JavaScript
│   ├── styles.css             # CSS styling
│   └── README.md
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
```bash
cd frontend
# Open index.html in your browser
# Or use a local server:
npx serve .
```

## API Endpoints

### Canvas Management
- `POST /api/canvas/init` - Initialize a new canvas
- `POST /api/canvas/elements` - Add elements to canvas
- `GET /api/canvas/export` - Export canvas as PDF

### Request Examples

**Initialize Canvas:**
```json
POST /api/canvas/init
{
  "width": 800,
  "height": 600
}
```

**Add Rectangle:**
```json
POST /api/canvas/elements
{
  "id": "canvas_id",
  "type": "rectangle",
  "properties": {
    "x": 10,
    "y": 10,
    "w": 100,
    "h": 50,
    "color": "#ff0000"
  }
}
```

**Add Image:**
```json
POST /api/canvas/elements
{
  "id": "canvas_id",
  "type": "image",
  "properties": {
    "x": 0,
    "y": 0,
    "w": 200,
    "h": 200,
    "url": "https://example.com/image.jpg"
  }
}
```

## Usage

1. **Create Canvas**: Enter width and height, click "Create Canvas"
2. **Add Elements**: Use tabbed controls to add shapes, text, or images
3. **Preview**: See live preview of your canvas
4. **Export**: Click "Export as PDF" to download compressed PDF

## Features

### Form Validation
- Canvas dimensions validation (positive numbers, max 2000px)
- Element property validation
- Real-time error feedback with visual indicators

### Image Handling
- Automatic HTTPS protocol addition
- Redirect handling (301/302)
- Cross-origin image support
- Timeout protection (10 seconds)

### PDF Export
- Automatic compression (50% scale, 60% JPEG quality)
- Proper PDF formatting
- File download with custom naming

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues and questions, please open an issue on GitHub. 