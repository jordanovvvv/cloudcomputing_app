import './App.css';
import {useState} from "react";
import axios from "axios";

function App() {
  const [inputFile, setInputFile] = useState(null);
  // const [result, setResult] = useState(null);
  const [processingTime, setProcessingTime] = useState(null);

  const handleFileUpload = (event) => {
    setInputFile(event.target.files[0]);
  }

  const startCalculation = async (event) => {
    event.preventDefault();
    const startTime = performance.now();
    const formData = new FormData();
    formData.append('inputFile', inputFile);
    console.log(inputFile)

    try{
      await axios.post("/sort", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(() => {
        setProcessingTime(performance.now() - startTime);
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


  return (
      <div className="App">
        <input type="file" name="inputFile" onChange={handleFileUpload} />
        <button className="App-button" onClick={startCalculation}>Start Calculation</button>
        <button className="App-button" onClick={downloadResult}>Download Result</button>
        <p>Processing time: {processingTime}ms</p>
      </div>
  );
}

export default App;
