const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const canvasRoutes = require('./routes/canvasRoutes');

const app = express();

const corsOptions = {
    origin: [
        'https://canvas-builder-api.vercel.app',
        'https://canvas-builder-api-git-main.vercel.app',
        'https://canvas-builder-api-git-develop.vercel.app',
        'http://localhost:3000',
        'http://localhost:5000',
        'http://localhost:8080',
        'http://127.0.0.1:5500',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/canvas', canvasRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Canvas Builder API is running' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Canvas Builder API running on port ${PORT}`);
}); 