# Canvas Builder API Backend

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm run start
   ```
   For development with auto-reload:
   ```bash
   npm run dev
   ```

## Project Structure

- `app.js` — Main entry point
- `routes/canvasRoutes.js` — API routes
- `controllers/canvasController.js` — Route handlers
- `utils/` — Utility functions (add as needed)

## API Endpoints

- `POST /api/canvas/init` — Initialize a canvas
  - Body: `{ width, height }`
  - Returns: `{ id, width, height }`
- `POST /api/canvas/elements` — Add element to canvas
  - Body: `{ id, type, properties }`
    - `type`: `rectangle | circle | text | image`
    - `properties`: shape/text/image properties (see code)
- `GET /api/canvas/export?id=CANVAS_ID` — Export canvas as compressed PDF

## Notes
- Canvas state is stored in memory (not persistent).
- Uses `canvas` for drawing, `pdfkit` for PDF export, and basic compression (scales down image for PDF).

---

This backend uses Node.js, Express, node-canvas, pdf-lib, and archiver. 