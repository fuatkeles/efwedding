// server.js

const express = require('express');
const multer = require('multer');
const Dropbox = require('dropbox').Dropbox;
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Dinamik import için async fonksiyon oluşturun
async function initializeServer() {
    const { default: fetch } = await import('node-fetch');

    const app = express();
    const upload = multer({ dest: 'uploads/' }); // Dosyaların kaydedileceği klasörü belirtin

    const DROPBOX_ACCESS_TOKEN = process.env.DROPBOX_ACCESS_TOKEN;

    const dbx = new Dropbox({ accessToken: DROPBOX_ACCESS_TOKEN, fetch: fetch });

    app.use(express.static(path.join(__dirname, 'public')));

    app.post('/api/upload', upload.single('file'), async (req, res) => {
        try {
            const file = req.file;
            const filePath = `/${file.originalname}`;

            const contents = fs.readFileSync(file.path);

            await dbx.filesUpload({ path: filePath, contents: contents });

            fs.unlinkSync(file.path);

            res.status(200).send('File successfully uploaded to Dropbox');
        } catch (err) {
            res.status(500).send('Error uploading to Dropbox');
        }
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

initializeServer().catch(err => {
    console.error('Error initializing server:', err);
});
