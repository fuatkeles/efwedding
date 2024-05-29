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
    const upload = multer({ dest: 'uploads/' });

    const DROPBOX_ACCESS_TOKEN = process.env.DROPBOX_ACCESS_TOKEN;

    const dbx = new Dropbox({ accessToken: DROPBOX_ACCESS_TOKEN, fetch: fetch });

    app.use(express.static(path.join(__dirname, 'public')));

    app.post('/upload', upload.single('file'), (req, res) => {
        const file = req.file;
        const filePath = `/${file.originalname}`;
    
        fs.readFile(file.path, (err, contents) => {
            if (err) {
                return res.status(500).send('File reading error');
            }
    
            dbx.filesUpload({ path: filePath, contents: contents })
                .then(response => {
                    fs.unlinkSync(file.path); // Upload işleminden sonra dosyayı sunucudan sil
                    res.status(200).send('File successfully uploaded to Dropbox');
                })
                .catch(err => {
                    res.status(500).send('Error uploading to Dropbox');
                });
        });
    });
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

initializeServer().catch(err => {
    console.error('Error initializing server:', err);
});
