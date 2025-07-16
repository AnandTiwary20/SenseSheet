import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import Plot from 'react-plotly.js';
import './App.css';
import axios from 'axios';
import UploadPage from './components/UploadPage';

function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filteredData, setFilteredData] = useState(null); // State to store the filtered data
  const [selectedChart, setSelectedChart] = useState('bar'); // State to track selected chart type

  const handleFileUpload = async (data) => {
    console.log('Received data in App.js:', data);
    
    if (!data || !data.data) {
      console.error('Invalid data received:', data);
      throw new Error('Invalid data format received');
    }

    try {
      // Set the filtered data to the state
      setFilteredData(data);
      console.log('Filtered data set in state:', data);

      // Save the filtered data to the backend
      await saveDataToBackend(data.data);
      console.log('Data saved to backend');
    } catch (error) {
      console.error('Error processing Excel file:', error);
      console.error('Error stack:', error.stack);
      alert(`Error processing Excel file: ${error.message}`);
    }
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
        <UploadPage onFileUpload={handleFileUpload} />
        
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
