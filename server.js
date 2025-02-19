require('dotenv').config();
const express = require('express');
const cors = require('cors');

const downloadRouter = require('./routes/download');
const uploadRouter = require('./routes/upload');
const apiRouter = require('./routes/api');
const webRouter = require('./routes/web');

const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());

app.use(downloadRouter);
app.use(uploadRouter);
app.use(apiRouter);
app.use(webRouter); // Web Paths frontend

app.listen(PORT, HOST, () => {
    console.log(`Server listening at http://${HOST}:${PORT}`);
});
