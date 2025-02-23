require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

const thumbnailRouter = require('./routes/thumbnail');
const downloadRouter = require('./routes/download');
const uploadRouter = require('./routes/upload');
const apiRouter = require('./routes/api');
const webRouter = require('./routes/web');

const { deleteExpiredBuckets } = require('./utils/expiration');

const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(thumbnailRouter);
app.use(downloadRouter);
app.use(uploadRouter);
app.use(apiRouter);
app.use(webRouter); // Web Paths frontend

// Cron file delete scheduler
cron.schedule('0 * * * *', () => {
    console.log('Running bucket cleanup task');
    deleteExpiredBuckets();
});

app.listen(PORT, HOST, () => {
    console.log(`Server listening at http://${HOST}:${PORT}`);
});
