const { createCanvas, loadImage } = require('canvas');
const PDFDocument = require('pdfkit');
const stream = require('stream');
const https = require('https');
const http = require('http');


const canvases = {};


function fetchImage(url) {
    return new Promise((resolve, reject) => {
        
        if (!url || typeof url !== 'string') {
            reject(new Error('Invalid URL provided'));
            return;
        }

        
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            reject(new Error('Only HTTP(S) protocols are supported'));
            return;
        }

        const protocol = url.startsWith('https:') ? https : http;

        console.log('Fetching image from:', url);

        const request = protocol.get(url, (res) => {
            
            if (res.statusCode === 301 || res.statusCode === 302) {
                const newUrl = res.headers.location;
                console.log('Following redirect to:', newUrl);
                if (newUrl) {
                    
                    fetchImage(newUrl).then(resolve).catch(reject);
                    return;
                }
            }

            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                return;
            }

            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => {
                const buffer = Buffer.concat(chunks);
                console.log('Image fetched successfully, size:', buffer.length, 'bytes');
                resolve(buffer);
            });
            res.on('error', (err) => {
                console.error('Network error:', err.message);
                reject(err);
            });
        });

        request.on('error', (err) => {
            console.error('Request error:', err.message);
            reject(err);
        });

        
        request.setTimeout(10000, () => {
            request.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

exports.initCanvas = (req, res) => {
    const { width, height } = req.body;
    if (!width || !height) {
        return res.status(400).json({ error: 'Missing width or height' });
    }
    const id = 'c_' + Math.random().toString(36).substr(2, 9);
    const canvas = createCanvas(width, height);
    canvases[id] = { canvas, ctx: canvas.getContext('2d'), width, height, elements: [] };
    res.json({ id, width, height });
};

exports.addElement = async (req, res) => {
    const { id, type, properties } = req.body;
    const canvasObj = canvases[id];
    if (!canvasObj) return res.status(404).json({ error: 'Canvas not found' });
    const ctx = canvasObj.ctx;

    // Clear the canvas first
    ctx.clearRect(0, 0, canvasObj.width, canvasObj.height);

    // Redraw all existing elements
    for (const element of canvasObj.elements) {
        if (element.type === 'rectangle') {
            const { x, y, w, h, color } = element.properties;
            ctx.fillStyle = color || 'black';
            ctx.fillRect(x, y, w, h);
        } else if (element.type === 'circle') {
            const { x, y, radius, color } = element.properties;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = color || 'black';
            ctx.fill();
        } else if (element.type === 'text') {
            const { x, y, text, font, color } = element.properties;
            ctx.font = font || '20px Arial';
            ctx.fillStyle = color || 'black';
            ctx.fillText(text, x, y);
        } else if (element.type === 'image') {
            const { x, y, w, h, url } = element.properties;
            try {
                const response = await fetchImage(url);
                const img = await loadImage(response);
                ctx.drawImage(img, x, y, w, h);
            } catch (e) {
                console.error('Image loading error:', e.message);
            }
        }
    }

    
    if (type === 'rectangle') {
        const { x, y, w, h, color } = properties;
        ctx.fillStyle = color || 'black';
        ctx.fillRect(x, y, w, h);
        canvasObj.elements.push({ type, properties });
    } else if (type === 'circle') {
        const { x, y, radius, color } = properties;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color || 'black';
        ctx.fill();
        canvasObj.elements.push({ type, properties });
    } else if (type === 'text') {
        const { x, y, text, font, color } = properties;
        ctx.font = font || '20px Arial';
        ctx.fillStyle = color || 'black';
        ctx.fillText(text, x, y);
        canvasObj.elements.push({ type, properties });
    } else if (type === 'image') {
        const { x, y, w, h, url } = properties;
        try {
            console.log('Loading image from URL:', url);
            console.log('URL type:', typeof url);
            console.log('URL length:', url ? url.length : 'undefined');
            console.log('URL starts with http:', url ? url.startsWith('http') : 'N/A');
            console.log('URL starts with https:', url ? url.startsWith('https') : 'N/A');

            // Check if URL is provided
            if (!url || url.trim() === '') {
                throw new Error('No image URL provided');
            }

            
            let imageUrl = url.trim();
            if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
                imageUrl = 'https://' + imageUrl;
                console.log('Added https:// prefix, new URL:', imageUrl);
            }

            console.log('Final URL to fetch:', imageUrl);

            const response = await fetchImage(imageUrl);
            const img = await loadImage(response);
            ctx.drawImage(img, x, y, w, h);
            canvasObj.elements.push({ type, properties });
            console.log('Image loaded successfully');
        } catch (e) {
            console.error('Image loading error:', e.message);
            return res.status(400).json({ error: `Image loading failed: ${e.message}` });
        }
    }
    res.json({ message: 'Element added' });
};

exports.exportPDF = (req, res) => {
    const { id } = req.query;
    const canvasObj = canvases[id];
    if (!canvasObj) return res.status(404).json({ error: 'Canvas not found' });

    
    const scale = 0.5; 
    const exportCanvas = createCanvas(canvasObj.width * scale, canvasObj.height * scale);
    const exportCtx = exportCanvas.getContext('2d');
    exportCtx.drawImage(canvasObj.canvas, 0, 0, exportCanvas.width, exportCanvas.height);
    const imgBuffer = exportCanvas.toBuffer('image/jpeg', { quality: 0.6 });

    const doc = new PDFDocument({ size: [exportCanvas.width, exportCanvas.height] });
    const passthrough = new stream.PassThrough();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="canvas_${id}.pdf"`);
    doc.pipe(passthrough);
    doc.image(imgBuffer, 0, 0, { width: exportCanvas.width, height: exportCanvas.height });
    doc.end();
    passthrough.pipe(res);
}; 