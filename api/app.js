const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/',});
const fs = require("fs");
const readline = require("readline");

const app = express();
app.use(express.json());

const processingData = [];
let sortingRequests = 0;

app.post('/sort', upload.single('inputFile'), (req, res) => {
    const inputFile = req.file; //Get input file
    const startTime = performance.now();
    let requestsCounter = 0;

    const readStream = fs.createReadStream(inputFile.path, 'utf8');
    const writeStream = fs.createWriteStream(__dirname + '/uploads/result.txt');

    const rl = readline.createInterface({
            input: readStream,
            output: writeStream,
            terminal: false
    });
    const dateArray = [];

    rl.on('line', (line) => {
        dateArray.push(line);
    })
    rl.on('close', () => {
        dateArray.sort((a, b) => {
            requestsCounter++;
            return new Date(b) - new Date(a)
        });
        const sortedDateArray = dateArray.join('\n');

        const data = {
            requests: requestsCounter,
            processingTime: performance.now() - startTime
        }

        processingData.push(data);
        sortingRequests+=requestsCounter;

        writeStream.write(sortedDateArray, 'utf8', (err) => {
            if(err){
                return res.status(500).json({ error: 'Error writing file'});
            }
            res.json({ message: 'File sorted and saved as result.txt'});
        })
    })

});

app.get('/download', (req, res) => {
    const filePath = __dirname + '/uploads/result.txt';
    res.download(filePath, 'result.txt', (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error downloading file' });
        }
    });
});

app.get('/sortingInfo', (req, res) => {
    res.json({ requests: sortingRequests, processingData: processingData });
});

app.listen(8000, () => {
    console.log('Server is running on port 8000');
});
