const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const uploadRoutes = require('./routes/upload.routes');
const chatRoutes = require('./routes/chat.routes');
const documentRoutes = require('./routes/document.routes');
const historyRoutes = require('./routes/history.routes');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();

app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? 'https://doc-query-frontend-nu.vercel.app'
        : 'http://localhost:3000',
    credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/document', documentRoutes);
app.use('/api/history', historyRoutes);

// Root route — handles Render / hosting platform health check pings (HEAD / and GET /)
app.get('/',  (req, res) => res.json({ status: 'OK', app: 'DocQuery API', version: '1.0.0' }));
app.head('/', (req, res) => res.sendStatus(200));

app.get('/api/health', (req, res) => res.json({ status: 'OK', uptime: process.uptime() }));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
