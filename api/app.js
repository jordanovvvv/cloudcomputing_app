const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/',});
const fs = require("fs");
const readline = require("readline");


const app = express();
app.use(express.json());

const processingData = [];
let sortingRequests = 0;
let requestsCounter = 0;

app.post('/sort', upload.single('inputFile'), async (req, res) => {
    const inputFile = req.file; // Get input file
    const startTime = performance.now();

    function mergeSort(arr)
    {
        if (arr.length < 2)
            return arr;

        var middle = parseInt(arr.length / 2);
        var left   = arr.slice(0, middle);
        var right  = arr.slice(middle, arr.length);

        return merge(mergeSort(left), mergeSort(right));
    }

    function merge(left, right)
    {
        var result = [];

        while (left.length && right.length) {
            if (left[0] <= right[0]) {
                result.push(left.shift());
            } else {
                result.push(right.shift());
            }
        }

        while (left.length)
            result.push(left.shift());

        while (right.length)
            result.push(right.shift());

        return result;
    }

    const processRequest = async () => {
        const dateArray = [];

        return new Promise((resolve, reject) => {
            const rl = readline.createInterface({
                input: fs.createReadStream(inputFile.path, 'utf8'),
                terminal: false
            });

            rl.on('line', (line) => {
                dateArray.push(line);
            });

            rl.on('close', () => {
                // dateArray.sort((a, b) => new Date(b) - new Date(a));
                mergeSort(dateArray);

                sortingRequests += requestsCounter;

                const sortedDateArray = dateArray.join('\n');

                fs.writeFile(__dirname + '/uploads/result.txt', sortedDateArray, 'utf8', (err) => {
                    if (err) {
                        reject('Error writing file');
                    }
                    resolve();
                });
            });
        });
    };

    const numRequests = req.query.numRequests || 1;
    console.log(numRequests);

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    };

    const requestOrder = Array.from({ length: numRequests }, (_, index) => index + 1);
    shuffleArray(requestOrder); // Randomize the order of requests

    for (let i = 0; i < numRequests; i++) {
        const currentRequest = requestOrder[i];
        let j = currentRequest;
        const startTime = performance.now(); // Start processing time for each request
        while (j) {
            await processRequest();
            j--;
        }


        requestsCounter += currentRequest; // Increment requests counter for each request
    }
    const data = {
        requests: numRequests,
        processingTime: performance.now() - startTime
    };
    processingData.push(data); // Push data after each request is processed
    res.json({ message: `File sorted and saved as result.txt for ${numRequests} requests` });
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
