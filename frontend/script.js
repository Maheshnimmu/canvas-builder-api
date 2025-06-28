const API_URL = 'https://canvas-backend.onrender.com/api/canvas';
let canvasId = null;
let previewCanvas = document.getElementById('preview-canvas');
let ctx = null;
let width = 0, height = 0;
let allElements = [];

const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
tabBtns.forEach(btn => {
    btn.onclick = () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(tc => tc.style.display = 'none');
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).style.display = '';
    };
});
document.querySelector('.tab-btn').classList.add('active');

function showFieldError(inputId, message) {
    const input = document.getElementById(inputId);
    input.classList.add('error');
    setTimeout(() => {
        input.classList.remove('error');
    }, 3000);
    alert(message);
}

function clearFieldError(inputId) {
    const input = document.getElementById(inputId);
    input.classList.remove('error');
}

const canvasForm = document.getElementById('canvas-dim-form');
canvasForm.onsubmit = async (e) => {
    e.preventDefault();
    const widthInput = document.getElementById('canvas-width');
    const heightInput = document.getElementById('canvas-height');

    clearFieldError('canvas-width');
    clearFieldError('canvas-height');

    const canvasWidth = parseInt(widthInput.value);
    const canvasHeight = parseInt(heightInput.value);

    if (!canvasWidth || !canvasHeight) {
        showFieldError('canvas-width', 'Please enter both width and height values.');
        return;
    }

    if (canvasWidth <= 0 || canvasHeight <= 0) {
        if (canvasWidth <= 0) showFieldError('canvas-width', 'Width must be greater than 0.');
        if (canvasHeight <= 0) showFieldError('canvas-height', 'Height must be greater than 0.');
        return;
    }

    if (canvasWidth > 2000 || canvasHeight > 2000) {
        if (canvasWidth > 2000) showFieldError('canvas-width', 'Width must be less than 2000 pixels.');
        if (canvasHeight > 2000) showFieldError('canvas-height', 'Height must be less than 2000 pixels.');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/init`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ width: canvasWidth, height: canvasHeight })
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: 'Network error' }));
            alert(`Failed to create canvas: ${errorData.error || 'Unknown error'}`);
            return;
        }

        const data = await res.json();
        if (data.id) {
            canvasId = data.id;
            width = canvasWidth;
            height = canvasHeight;
            previewCanvas.width = width;
            previewCanvas.height = height;

            ctx = getCanvasContext();
            if (ctx) {
                ctx.clearRect(0, 0, width, height);

                ctx.fillStyle = '#e0e0e0';
                ctx.fillRect(0, 0, width, height);
                console.log('Canvas created and test background drawn');
            }

            allElements = [];
            document.getElementById('element-controls').style.display = '';
            document.getElementById('export-pdf').style.display = '';
        }
    } catch (error) {
        console.error('Network error:', error);
        alert('Failed to connect to the server. Please check your internet connection and try again.');
    }
};

function getCanvasContext() {
    if (!previewCanvas) {
        previewCanvas = document.getElementById('preview-canvas');
    }
    if (!ctx && previewCanvas) {
        ctx = previewCanvas.getContext('2d');
    }
    return ctx;
}

function redrawPreview() {
    const canvasCtx = getCanvasContext();
    if (!canvasCtx || !width || !height) {
        console.error('Cannot redraw: missing context or dimensions', {
            ctx: !!canvasCtx,
            width,
            height
        });
        return;
    }

    console.log('Redrawing preview with', allElements.length, 'elements');

    canvasCtx.clearRect(0, 0, width, height);

    allElements.forEach((element, index) => {
        console.log('Drawing element', index, ':', element.type, element.properties);

        if (element.type === 'rectangle') {
            const { x, y, w, h, color } = element.properties;
            canvasCtx.fillStyle = color || 'black';
            canvasCtx.fillRect(x, y, w, h);
            console.log('Drew rectangle at', x, y, 'size', w, 'x', h, 'color', color);
        } else if (element.type === 'circle') {
            const { x, y, radius, color } = element.properties;
            canvasCtx.beginPath();
            canvasCtx.arc(x, y, radius, 0, 2 * Math.PI);
            canvasCtx.fillStyle = color || 'black';
            canvasCtx.fill();
            console.log('Drew circle at', x, y, 'radius', radius, 'color', color);
        } else if (element.type === 'text') {
            const { x, y, text, font, color } = element.properties;
            canvasCtx.font = font || '20px Arial';
            canvasCtx.fillStyle = color || 'black';
            canvasCtx.fillText(text, x, y);
            console.log('Drew text:', text, 'at', x, y, 'font', font, 'color', color);
        } else if (element.type === 'image') {
            const { x, y, w, h, url } = element.properties;
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.onload = function () {
                canvasCtx.drawImage(img, x, y, w, h);
                console.log('Drew image at', x, y, 'size', w, 'x', h, 'from', url);
            };
            img.onerror = function () {
                console.error('Failed to load image:', url);
            };
            img.src = url;
        }
    });
}

async function addElement(type, properties, drawFn) {
    if (!canvasId) {
        console.error('No canvas ID available');
        alert('Please create a canvas first');
        return;
    }

    console.log('Adding element:', type, properties);
    console.log('Canvas ID:', canvasId);

    try {
        const res = await fetch(`${API_URL}/elements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: canvasId, type, properties })
        });

        console.log('Response status:', res.status);

        if (res.ok) {
            console.log('Element added successfully');
            allElements.push({ type, properties });
            redrawPreview();
        } else {
            const errorData = await res.json();
            console.error('Error response:', errorData);
            alert(`Error adding ${type}: ${errorData.error}`);
        }
    } catch (error) {
        console.error('Network error:', error);
        alert('Failed to add element. Please check your internet connection and try again.');
    }
}

const addRectBtn = document.getElementById('add-rect');
addRectBtn.onclick = () => {
    const x = parseFloat(document.getElementById('rect-x').value);
    const y = parseFloat(document.getElementById('rect-y').value);
    const w = parseFloat(document.getElementById('rect-w').value);
    const h = parseFloat(document.getElementById('rect-h').value);
    const color = document.getElementById('rect-color').value;

    if (isNaN(x) || isNaN(y) || isNaN(w) || isNaN(h)) {
        alert('Please enter valid numbers for all rectangle properties.');
        return;
    }

    if (w <= 0 || h <= 0) {
        alert('Width and height must be greater than 0.');
        return;
    }

    addElement('rectangle', { x, y, w, h, color }, () => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
    });
};

const addCircleBtn = document.getElementById('add-circle');
addCircleBtn.onclick = () => {
    const x = parseFloat(document.getElementById('circle-x').value);
    const y = parseFloat(document.getElementById('circle-y').value);
    const radius = parseFloat(document.getElementById('circle-radius').value);
    const color = document.getElementById('circle-color').value;

    if (isNaN(x) || isNaN(y) || isNaN(radius)) {
        alert('Please enter valid numbers for all circle properties.');
        return;
    }

    if (radius <= 0) {
        alert('Radius must be greater than 0.');
        return;
    }

    addElement('circle', { x, y, radius, color }, () => {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
    });
};

const addTextBtn = document.getElementById('add-text');
addTextBtn.onclick = () => {
    const text = document.getElementById('text-content').value.trim();
    const x = parseFloat(document.getElementById('text-x').value);
    const y = parseFloat(document.getElementById('text-y').value);
    const fontSize = parseInt(document.getElementById('text-size').value) || 20;
    const color = document.getElementById('text-color').value;

    if (!text) {
        alert('Please enter some text.');
        return;
    }

    if (isNaN(x) || isNaN(y)) {
        alert('Please enter valid numbers for X and Y coordinates.');
        return;
    }

    if (fontSize <= 0) {
        alert('Font size must be greater than 0.');
        return;
    }

    addElement('text', { text, x, y, font: `${fontSize}px Arial`, color }, () => {
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
    });
};

const addImageBtn = document.getElementById('add-image');
addImageBtn.onclick = () => {
    let url = document.getElementById('image-url').value.trim();
    const x = parseFloat(document.getElementById('image-x').value);
    const y = parseFloat(document.getElementById('image-y').value);
    const w = parseFloat(document.getElementById('image-w').value);
    const h = parseFloat(document.getElementById('image-h').value);

    if (!url) {
        alert('Please enter an image URL.');
        return;
    }

    if (isNaN(x) || isNaN(y) || isNaN(w) || isNaN(h)) {
        alert('Please enter valid numbers for all image properties.');
        return;
    }

    if (w <= 0 || h <= 0) {
        alert('Width and height must be greater than 0.');
        return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
        console.log('Added https:// prefix, final URL:', url);
        document.getElementById('image-url').value = url;
    }

    addElement('image', { url, x, y, w, h }, () => {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = function () {
            ctx.drawImage(img, x, y, w, h);
        };
        img.src = url;
    });
};

const exportBtn = document.getElementById('export-pdf');
exportBtn.onclick = async () => {
    if (!canvasId) return;
    exportBtn.disabled = true;
    exportBtn.textContent = 'Exporting...';
    const res = await fetch(`${API_URL}/export?id=${canvasId}`);
    if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `canvas_${canvasId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } else {
        alert('Export failed');
    }
    exportBtn.disabled = false;
    exportBtn.textContent = 'Export as PDF';
}; 