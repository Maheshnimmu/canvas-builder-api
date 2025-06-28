const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const { createCanvas, loadImage } = require('canvas');
const { PDFDocument } = require('pdf-lib');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));


const canvases = {};


app.post('/api/canvas/init', (req, res) => {
    const { id, width, height } = req.body;
    if (!id || !width || !height) {
        return res.status(400).json({ error: 'Missing id, width, or height' });
    }
    const canvas = createCanvas(width, height);
    canvases[id] = { canvas, ctx: canvas.getContext('2d'), width, height, elements: [] };
    res.json({ message: 'Canvas initialized', id });
});


app.post('/api/canvas/add', upload.single('image'), async (req, res) => {
    const { id, type, x, y, w, h, radius, color, text, font, imageUrl } = req.body;
    const canvasObj = canvases[id];
    if (!canvasObj) return res.status(404).json({ error: 'Canvas not found' });
    const ctx = canvasObj.ctx;

    if (type === 'rect') {
        ctx.fillStyle = color || 'black';
        ctx.fillRect(x, y, w, h);
        canvasObj.elements.push({ type, x, y, w, h, color });
    } else if (type === 'circle') {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color || 'black';
        ctx.fill();
        canvasObj.elements.push({ type, x, y, radius, color });
    } else if (type === 'text') {
        ctx.font = font || '20px Arial';
        ctx.fillStyle = color || 'black';
        ctx.fillText(text, x, y);
        canvasObj.elements.push({ type, x, y, text, font, color });
    } else if (type === 'image') {
        let imgPath = req.file ? req.file.path : imageUrl;
        try {
            const img = await loadImage(imgPath);
            ctx.drawImage(img, x, y, w, h);
            canvasObj.elements.push({ type, x, y, w, h, src: imgPath });
            if (req.file) fs.unlinkSync(imgPath); // Clean up upload
        } catch (e) {
            return res.status(400).json({ error: 'Invalid image' });
        }
    }
    res.json({ message: 'Element added' });
});


app.get('/api/canvas/export/:id', async (req, res) => {
    const { id } = req.params;
    const canvasObj = canvases[id];
    if (!canvasObj) return res.status(404).json({ error: 'Canvas not found' });
    const imgBuffer = canvasObj.canvas.toBuffer('image/png');
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([canvasObj.width, canvasObj.height]);
    const pngImage = await pdfDoc.embedPng(imgBuffer);
    page.drawImage(pngImage, { x: 0, y: 0, width: canvasObj.width, height: canvasObj.height });
    const pdfBytes = await pdfDoc.save();

    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="canvas_${id}.zip"`);
    const archive = archiver('zip');
    archive.append(Buffer.from(pdfBytes), { name: `canvas_${id}.pdf` });
    archive.finalize();
    archive.pipe(res);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Canvas Builder API running on port ${PORT}`);
}); 