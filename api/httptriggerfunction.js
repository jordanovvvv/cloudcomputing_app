const { performance, promisify } = require('perf_hooks');
const fs = require('fs');
const readline = require('readline');
const util = require('util');
const mkdirAsync = util.promisify(fs.mkdir);

const processingData = [];
let sortingRequests = 0;

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

module.exports = async function (context, req) {
    context.res = {
        headers: {
            'Content-Type': 'application/json'
        },
    };


    if (req.method === 'POST') {
        if (req.query.action === 'sort') {
            try {
                const startTime = performance.now();
                let requestsCounter = 0;

                // Read the raw request body
                const fileContent = req.body.toString();


                // Process file content (assuming it's newline-separated data)
                const dateArray = fileContent.split('\n');

                dateArray.sort((a, b) => {
                    requestsCounter++;
                    return new Date(b) - new Date(a);
                });

                const sortedDateArray = dateArray.join('\n');

                const data = {
                    requests: requestsCounter,
                    processingTime: performance.now() - startTime,
                };

                processingData.push(data);
                sortingRequests += requestsCounter;

                const filePath = `${context.executionContext.functionDirectory}/uploads/result.txt`;

                await mkdirAsync(`${context.executionContext.functionDirectory}/uploads`, { recursive: true });

                // Use writeFileAsync to handle file writing
                await writeFileAsync(filePath, sortedDateArray, 'utf8');

                context.res = {
                    status: 200,
                    body: { message: 'File sorted and saved as result.txt', processingData },
                };
            } catch (error) {
                context.res = {
                    status: 500,
                    body: { error: 'Internal Server Error', details: error.message },
                };
            }
        }
    } else if (req.method === 'GET') {
        if (req.query.action === 'download') {
            // Handle file download
            try {
                const filePath = `${context.executionContext.functionDirectory}/uploads/result.txt`;
                context.res = {
                    status: 200,
                    body: fs.readFileSync(filePath, 'utf8'),
                    headers: {
                        'Content-Type': 'text/plain',
                        'Content-Disposition': 'attachment; filename=result.txt',
                    },
                };
                context.done();
            } catch (error) {
                context.res = {
                    status: 500,
                    body: { error: 'Error downloading file' },
                };
                context.done();
            }
        } else if (req.query.action === 'sortingInfo') {

            // Handle sorting information request
            try {
                const sortingInfo = {
                    requests: sortingRequests,
                    processingData: processingData,
                };
                context.res = {
                    status: 200,
                    body: sortingInfo,
                };
                context.done();
            } catch (error) {
                context.res = {
                    status: 500,
                    body: { error: 'Internal Server Error' },
                };
                context.done();
            }
        } else {
            // Handle other GET requests as needed
            try {
                const greetingMessage = 'Hello from Azure Function!';
                context.res = {
                    status: 200,
                    body: { message: greetingMessage },
                };
                context.done();
            } catch (error) {
                context.res = {
                    status: 500,
                    body: { error: 'Internal Server Error' },
                };
                context.done();
            }
        }
    } else {
        context.res = {
            status: 405,
            body: { error: 'Method Not Allowed' },
        };
        context.done();
    }
};
async function processFileUpload(req) {
    return new Promise((resolve, reject) => {
        upload.single('inputFile')(req, {}, (err) => {
            if (err) {
                console.error('Error processing file upload:', err);
                reject(new Error('Error processing file upload'));
            } else {
                resolve(req.file);
            }
        });
    });
}