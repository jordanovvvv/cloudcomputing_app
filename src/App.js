import './App.css';
import {useEffect, useState} from "react";
import axios from "axios";

function App() {
  const [inputFile, setInputFile] = useState(null);
  const [processingTime, setProcessingTime] = useState(null);
  const [requests, setRequests] = useState(0);
  const [processingData, setProcessingData] = useState([]);


  axios.get('/sortingInfo')
      .then((response) => {
          const data = response.data;
          setRequests(data.requests);
          setProcessingData(data.processingData);
      })
      .catch((err) => console.error('Error fetching sorting info:', err));

  const handleFileUpload = (event) => {
    setInputFile(event.target.files[0]); //Set the input file
  }

  const startCalculation = async (event) => {
    event.preventDefault();
    const startTime = performance.now(); //Set the start of the processing time
    const formData = new FormData();
    formData.append('inputFile', inputFile);
    console.log(inputFile)

    try{
      await axios.post("/sort", formData, {  //Create POST method to API
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(() => {
        setProcessingTime(performance.now() - startTime); //Finish processing time
      });
    }catch(err){
      console.log(err);
    };
  };


  const downloadResult = () => {
      axios.get('/download', {
          responseType: 'blob' // Set the responseType to 'blob'
      })
          .then((response) => {
              const url = window.URL.createObjectURL(new Blob([response.data])); // Create a blob URL
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', 'result.txt'); // Set the file name for download
              document.body.appendChild(link); // Append the link to the body
              link.click(); // Simulate a click to trigger the download
              document.body.removeChild(link); // Clean up by removing the link from the body
          })
          .catch((err) => console.log(err));
  }
  const downloadTable = (data) => {
      const csvContent = [
          'Requests, Processing Time (ms)', // Header row with an empty cell
          ...data.map((item) => `${item.requests}, ${Math.round(item.processingTime*100)/100}`) // Mapping data to separate cells
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv'});
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'results.csv';
      link.click();
  }
  const handleDownload = () => { //handling the request for downloading the csv file
      downloadTable(processingData);
  }


  return (
      <div className="App">
        <input type="file" name="inputFile" onChange={handleFileUpload} />
        <button className="App-button" onClick={startCalculation}>Start Calculation</button>
        <button className="App-button" onClick={downloadResult}>Download latest Result</button>
          <p>Requests and Processing Times:</p>
          <ul>
              {processingData.map((item, index) => ( // index -> current item being processed
                  <li key={index}>
                      Requests: {item.requests}, Processing Time: {Math.round(item.processingTime*100)/100}ms
                  </li>
              ))}
          </ul>
          <button className="App-button" onClick={handleDownload}>Download CSV</button>
      </div>
  );
}

export default App;
