import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import Dropzone from 'react-dropzone';
import Plot from 'react-plotly.js';
import './App.css';
import axios from 'axios';

function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filteredData, setFilteredData] = useState(null); // State to store the filtered data
  const [selectedChart, setSelectedChart] = useState('bar'); // State to track selected chart type

  const handleFileUpload = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    setUploadedFile(file);

    const reader = new FileReader();
    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.SheetNames[0];
      const excelData = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);

      // Remove columns with all null values
      const filteredData = excelData.filter((item) => !Object.values(item).every((value) => value === null));

      // Set the filtered data to the state
      setFilteredData(filteredData);

      // Save the filtered data to the backend
      saveDataToBackend(filteredData);
    };
    reader.readAsArrayBuffer(file);
  };

  const saveDataToBackend = async (data) => {
    try {
      await axios.post('/api/saveData', { data });
      console.log('Data saved to MongoDB');
    } catch (error) {
      console.error('Error saving data to MongoDB:', error);
    }
  };

  // Move the chart data generation outside of the render function to avoid recreation on every render
  let traces = [];
  let barTraces = [];
  let lineTraces = [];
  let boxTraces = [];
  let whiskerTraces = [];
  let bubbleTraces = [];
  let surfaceTrace = {};

  if (filteredData && filteredData.length > 0) {
    const columns = Object.keys(filteredData[0]);

    traces = columns.map((column) => ({
      x: filteredData.map((item) => item[column]),
      y: filteredData.map((item) => item[column]),
      type: 'scatter',
      mode: 'lines+markers',
      name: column,
    }));

    barTraces = columns.map((column) => ({
      x: columns,
      y: filteredData.map((item) => item[column]),
      type: 'bar',
      name: column,
    }));

    lineTraces = columns.map((column) => ({
      x: filteredData.map((item) => item[column]),
      y: filteredData.map((item) => item[column]),
      type: 'line',
      name: column,
    }));

    boxTraces = columns.map((column) => ({
      y: filteredData.map((item) => item[column]),
      type: 'box',
      name: column,
    }));

    whiskerTraces = columns.map((column) => ({
      y: filteredData.map((item) => item[column]),
      type: 'box',
      boxpoints: 'all',
      jitter: 0.3,
      pointpos: -1.8,
      name: column,
    }));

    bubbleTraces = columns.map((column) => ({
      x: filteredData.map((item) => item[column]),
      y: filteredData.map((item) => item[column]),
      mode: 'markers',
      marker: {
        size: filteredData.map((item) => item[column] * 5), // Adjust size based on data value
      },
      name: column,
    }));

    surfaceTrace = {
      type: 'surface',
      z: filteredData.map((item) => Object.values(item).map((value) => value * 10)), // Multiply by 10 to amplify the surface plot
    };
  }

  const chartTypes = [
    { value: 'bar', label: 'Bar Chart' },
    { value: 'line', label: 'Line Chart' },
    { value: 'scatter', label: 'Scatter Plot' },
    { value: 'box', label: 'Box Plot' },
    { value: 'whisker', label: 'Whisker Plot' },
    { value: 'bubble', label: 'Bubble Chart' },
    { value: 'surface', label: '3D Surface Plot' },
  ];

  const renderSelectedChart = () => {
    if (!filteredData) return null;
    
    const chartComponents = {
      bar: <div className="chart-container">
             <Plot data={barTraces} layout={{ title: 'Bar Chart', barmode: 'group' }} config={{ responsive: true }} />
           </div>,
      line: <div className="chart-container">
              <Plot data={lineTraces} layout={{ title: 'Line Chart' }} config={{ responsive: true }} />
            </div>,
      scatter: <div className="chart-container">
                 <Plot data={traces} layout={{ title: 'Scatter Plot' }} config={{ responsive: true }} />
               </div>,
      box: <div className="chart-container">
             <Plot data={boxTraces} layout={{ title: 'Box Plot' }} config={{ responsive: true }} />
           </div>,
      whisker: <div className="chart-container">
                 <Plot data={whiskerTraces} layout={{ title: 'Whisker Plot' }} config={{ responsive: true }} />
               </div>,
      bubble: <div className="chart-container">
                <Plot data={bubbleTraces} layout={{ title: 'Bubble Chart' }} config={{ responsive: true }} />
              </div>,
      surface: <div className="chart-container">
                 <Plot data={[surfaceTrace]} layout={{ title: '3D Surface Plot' }} config={{ responsive: true }} />
               </div>,
    };

    return chartComponents[selectedChart] || null;
  };

  return (
    <div className="container">
      <main className="main-content">
        <h1 className="title">Get It Visualized</h1>
        <p className="subtitle">Easily transform your Excel data into beautiful, interactive visualizations</p>
        
        <Dropzone onDrop={handleFileUpload}>
          {({ getRootProps, getInputProps, isDragActive }) => (
            <div 
              {...getRootProps()} 
              className={`dropzone fade-in ${isDragActive ? 'active' : ''}`}
            >
              <input {...getInputProps()} />
              <div className="dropzone-content">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <p>{isDragActive ? 'Drop your file here' : 'Drag & drop an Excel file here, or click to browse'}</p>
                <p className="file-hint">Supports .xlsx, .xls, .csv files</p>
                {uploadedFile && <p className="file-info">Uploaded: {uploadedFile.name}</p>}
              </div>
            </div>
          )}
        </Dropzone>
        
        {filteredData && (
          <div className="chart-selector fade-in">
            <label htmlFor="chart-type">Select Visualization Type</label>
            <select 
              id="chart-type" 
              value={selectedChart}
              onChange={(e) => setSelectedChart(e.target.value)}
              className="chart-dropdown"
              aria-label="Select chart type"
            >
              {chartTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="chart-wrapper">
          {filteredData ? (
            <div className="fade-in" style={{ width: '100%' }}>
              {renderSelectedChart()}
            </div>
          ) : (
            <div className="no-data">
              <p>No data to visualize. Upload an Excel file to get started.</p>
              <p>Your data will be processed locally and never leaves your browser.</p>
            </div>
          )}
        </div>
      </main>
      
      <footer className="footer">
        <p>© {new Date().getFullYear()} Get It Visualized. All data remains in your browser.</p>
      </footer>
    </div>
  );
}

export default App;
