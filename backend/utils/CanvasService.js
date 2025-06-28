const { createCanvas, loadImage } = require('canvas');
const PDFDocument = require('pdfkit');
const stream = require('stream');

class CanvasService {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.canvas = createCanvas(width, height);
        this.ctx = this.canvas.getContext('2d');
    }

    addRectangle(x, y, width, height, color = 'black') {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }

    addCircle(x, y, radius, color = 'black') {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = color;
        this.ctx.fill();
    }

    addText(text, x, y, fontSize = 20, color = 'black', fontFamily = 'Arial') {
        this.ctx.font = `${fontSize}px ${fontFamily}`;
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, x, y);
    }

    async addImage(image, x, y, width, height) {
        let img;
        if (Buffer.isBuffer(image)) {
            img = await loadImage(image);
        } else if (typeof image === 'string') {
            img = await loadImage(image);
        } else {
            throw new Error('Invalid image input');
        }
        this.ctx.drawImage(img, x, y, width, height);
    }

    exportToPDF({ scale = 0.5, quality = 0.6 } = {}) {
        const exportCanvas = createCanvas(this.width * scale, this.height * scale);
        const exportCtx = exportCanvas.getContext('2d');
        exportCtx.drawImage(this.canvas, 0, 0, exportCanvas.width, exportCanvas.height);
        const imgBuffer = exportCanvas.toBuffer('image/jpeg', { quality });

        const doc = new PDFDocument({ size: [exportCanvas.width, exportCanvas.height] });
        const passthrough = new stream.PassThrough();
        doc.pipe(passthrough);
        doc.image(imgBuffer, 0, 0, { width: exportCanvas.width, height: exportCanvas.height });
        doc.end();
        return passthrough;
    }
}

module.exports = CanvasService; 