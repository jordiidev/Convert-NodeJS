const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const multer = require('multer');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
// use res.render to load up an ejs view file

app.use(express.static('public'));

const upload = multer({ dest: 'uploads/' });

app.get('/', function(req, res) {
    res.render('index', { result: '', downloadLink: '' });
});

app.post('/convert', upload.single('imageFile'), async (req, res) => {
    const { conversionType, imageType, base64Image } = req.body;
    const uploadedFile = req.file;

    try {
        let result = '';
        let downloadLink = '';

        if (conversionType === '1' && uploadedFile) { // Convert Image to Base64
            const data = await fs.readFile(uploadedFile.path);
            let base64Image = Buffer.from(data).toString('base64');
            result = `data:image/${imageType};base64,${base64Image}`;
        } else if (conversionType === '2') { // Convert Base64 to Image
            let base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
            let base64ImageBuffer = Buffer.from(base64Data, 'base64');
            let outputFileName = `${Date.now()}_converted.${imageType}`;
            let outputFilePath = path.join(__dirname, 'downloads', outputFileName);
            await fs.writeFile(outputFilePath, base64ImageBuffer);
            result = `File saved as ${outputFileName}`;
            downloadLink = `/downloads/${outputFileName}`;
        }

        res.render('index', { result, downloadLink, conversionType, imageType });
    } catch (err) {
        res.render('index', { result: `Error: ${err.message}`, downloadLink: '' });
    }
});

// Serve the downloads directory for generated images
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));


app.listen(8015);
console.log('Running at http://localhost:8015');