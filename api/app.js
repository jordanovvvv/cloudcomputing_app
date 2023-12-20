const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/',});
const bodyParser = require('body-parser');
const fs = require("fs");
//const cors = require("cors")

const app = express();
//app.use(cors);
app.use(express.json());

app.post('/sort', upload.single('inputFile'), (req, res) => {
    const inputFile = req.file;
    //const contents = [];

    fs.readFile(inputFile.path, 'utf8', (err, fileContents) => {
        if (err) {
            return res.status(500).json({error: 'Error reading file'});
        }

        const numbers = fileContents
            .trim()
            .split("\n")
            .map((line) => parseInt(line, 10))
            .filter((number) => !isNaN(number));

        const sortedNumbers = numbers.sort((a, b) => a - b); // Sorting numbers in ascending order

        const sortedFileContent = sortedNumbers.join('\n'); // Join numbers with newline

        const filePath = __dirname + '/uploads/result.txt'; // File path to save sorted data

        fs.writeFile(filePath, sortedFileContent, 'utf8', (err) => {
            if (err) {
                return res.status(500).json({error: 'Error writing file'});
            }

            res.json({message: 'File sorted and saved as result.txt'});
        });
    });
});

app.get('/download', (req, res) => {
    const filePath = __dirname + '/uploads/result.txt';
    res.download(filePath, 'result.txt', (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error downloading file' });
        }
    });
});

app.listen(8000, () => {
    console.log('Server is running on port 8000');
});