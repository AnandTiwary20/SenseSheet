import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dropzone from 'react-dropzone';
import * as XLSX from 'xlsx';

const UploadPage = ({ onFileUpload }) => {
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleFileUpload = async (acceptedFiles) => {
    if (!acceptedFiles || !acceptedFiles[0]) return;
    
    setIsUploading(true);
    const file = acceptedFiles[0];
    
    try {
      const data = await readFile(file);
      onFileUpload(data);
      navigate('/visualize');
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          if (!workbook.SheetNames.length) {
            throw new Error('No sheets found in the Excel file');
          }
          
          const firstSheet = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheet];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (!jsonData.length) {
            throw new Error('No data found in the sheet');
          }
          
          // Get headers (first row)
          const headers = jsonData[0];
          
          // Process data rows
          const rows = jsonData.slice(1).map(row => {
            const rowData = {};
            headers.forEach((header, index) => {
              rowData[header] = row[index] !== undefined ? row[index] : null;
            });
            return rowData;
          });
          
          // Filter out empty rows
          const filteredData = rows.filter(row => 
            Object.values(row).some(value => value !== null && value !== undefined && value !== '')
          );
          
          if (filteredData.length === 0) {
            throw new Error('No valid data found in the file');
          }
          
          resolve({
            data: filteredData,
            headers,
            fileName: file.name
          });
          
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <div className="upload-container">
      <div className="upload-content">
        <h1>Upload Your Data</h1>
        <p className="subtitle">Get started by uploading your Excel or CSV file</p>
        
        <div className="dropzone-wrapper">
          <Dropzone onDrop={handleFileUpload} disabled={isUploading}>
            {({ getRootProps, getInputProps, isDragActive }) => (
              <div 
                {...getRootProps()} 
                className={`dropzone ${isDragActive ? 'active' : ''} ${isUploading ? 'uploading' : ''}`}
                aria-label="File upload area"
              >
                <input {...getInputProps()} />
                <div className="dropzone-content">
                  {isUploading ? (
                    <div className="uploading-animation">
                      <div className="spinner"></div>
                      <p>Processing your file...</p>
                    </div>
                  ) : (
                    <>
                      <div className="dropzone-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                      </div>
                      <p className="dropzone-text">
                        {isDragActive ? '📁 Drop files here' : '📊 Upload Excel or CSV file'}
                      </p>
                      <p className="dropzone-hint">
                        Drag & drop your file or click to browse
                      </p>
                      <p className="file-formats">
                        Supports: .xlsx, .xls, .csv
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </Dropzone>
        </div>
        
        <div className="upload-features">
          <div className="feature">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h3>Secure</h3>
            <p>Your data stays in your browser and is never sent to any server.</p>
          </div>
          
          <div className="feature">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3>Easy to Use</h3>
            <p>Simply upload your file and start visualizing your data in seconds.</p>
          </div>
          
          <div className="feature">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3>Multiple Chart Types</h3>
            <p>Choose from various chart types to best represent your data.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
