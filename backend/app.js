const cors = require('cors');
app.use(cors());
const express = require('express');
// const cors = require('cors');
const bodyParser = require('body-parser');
const canvasRoutes = require('./routes/canvasRoutes');

const app = express();

// app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/canvas', canvasRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Canvas Builder API running on port ${PORT}`);
}); 