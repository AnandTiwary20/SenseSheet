import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';
import './DataVisualization.css';

// Register all Chart.js components
Chart.register(...registerables);

const DataVisualization = ({ chartData, onBack, onLogout }) => {
  const [filteredData, setFilteredData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chartTitle, setChartTitle] = useState('');
  const [xAxisLabel, setXAxisLabel] = useState('');
  const [yAxisLabel, setYAxisLabel] = useState('');
  const [selectedChart, setSelectedChart] = useState('bar');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const chartRef = useRef(null);
  const navigate = useNavigate();

  // Handle back button click
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  // Get yColumns for the current data
  const getYColumns = () => {
    try {
      if (!filteredData || !Array.isArray(filteredData) || filteredData.length === 0) return [];
      const firstRow = filteredData[0];
      if (!firstRow || typeof firstRow !== 'object') return [];
      return Object.keys(firstRow).filter(key => {
        const value = firstRow[key];
        return typeof value === 'number' || 
               (typeof value === 'string' && !isNaN(parseFloat(value)));
      });
    } catch (error) {
      console.error('Error getting Y columns:', error);
      return [];
    }
  };

  const yColumns = getYColumns();
  
  // Function to handle chart download
  const handleDownload = () => {
    try {
      if (!chartRef.current) {
        console.warn('Chart reference not available');
        return;
      }
      
      const link = document.createElement('a');
      const chart = chartRef.current;
      
      if (chart && chart.toBase64Image) {
        const url = chart.toBase64Image('image/png', 1);
        link.href = url;
        link.download = `chart-${new Date().toISOString().slice(0, 10)}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.warn('Chart export not supported');
      }
    } catch (error) {
      console.error('Error exporting chart:', error);
    }
  };
  
  // Enhanced pie chart options
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        right: 20,
        bottom: 40,
        left: 20
      }
    },
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#e0e0e0',
          font: {
            size: 12
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          boxHeight: 8
        }
      },
      title: {
        display: true,
        text: chartTitle || 'Pie Chart',
        color: '#e0e0e0',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#e0e0e0',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        displayColors: true,
        padding: 12,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
      datalabels: {
        formatter: (value, ctx) => {
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = Math.round((value / total) * 100);
          return percentage > 5 ? `${percentage}%` : '';
        },
        color: '#fff',
        font: {
          weight: 'bold',
          size: 12
        }
      }
    },
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: 'rgba(0, 0, 0, 0.5)'
      }
    },
    cutout: '60%',
    radius: '80%'
  };

  // Common chart options with dark theme
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 30,
        right: 20,
        bottom: 30,
        left: 20
      }
    },
    aspectRatio: 2,
    backgroundColor: '#000000',
    color: '#e0e0e0',
    borderColor: '#444',
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e0e0e0',
          font: {
            size: 12
          },
          padding: 20
        }
      },
      title: {
        display: true,
        text: chartTitle || 'Data Visualization',
        color: '#e0e0e0',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#e0e0e0',
        borderColor: '#444',
        borderWidth: 1,
        displayColors: true,
        padding: 12,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'decimal',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: xAxisLabel || 'X-Axis',
          color: '#a0a0a0',
          font: {
            size: 12,
            weight: 'bold'
          },
          padding: { top: 10 }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#a0a0a0',
          font: {
            size: 11
          }
        }
      },
      y: {
        title: {
          display: true,
          text: yAxisLabel || 'Y-Axis',
          color: '#a0a0a0',
          font: {
            size: 12,
            weight: 'bold'
          },
          padding: { bottom: 10 }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#a0a0a0',
          font: {
            size: 11
          },
          callback: function(value) {
            return new Intl.NumberFormat('en-US', {
              notation: 'compact',
              compactDisplay: 'short'
            }).format(value);
          }
        }
      }
    }
  };

  // Generate chart data based on the selected chart type
  const generateChartData = () => {
    if (!filteredData || filteredData.length === 0) return { labels: [], datasets: [] };
    
    // Get the first numeric column for pie chart data
    const firstNumericColumn = filteredData[0] ? 
      Object.keys(filteredData[0]).find(key => {
        const value = filteredData[0][key];
        return typeof value === 'number' || (typeof value === 'string' && !isNaN(parseFloat(value)));
      }) : '';
    
    // Get labels from the first non-numeric column or use index as fallback
    const labelColumn = filteredData[0] ? 
      Object.keys(filteredData[0]).find(key => {
        const value = filteredData[0][key];
        return typeof value === 'string' && isNaN(parseFloat(value));
      }) : null;
    
    const labels = labelColumn ? 
      filteredData.map(item => String(item[labelColumn] || '')) :
      filteredData.map((_, index) => `Item ${index + 1}`);
    
    const datasets = [];
    
    if (selectedChart === 'pie') {
      const data = firstNumericColumn ? 
        filteredData.map(item => {
          const value = item[firstNumericColumn];
          return typeof value === 'number' ? value : parseFloat(value) || 0;
        }) :
        filteredData.map((_, index) => index + 1); // Fallback to index-based values
      
      // Generate a consistent color palette
      const backgroundColors = [
        'rgba(99, 102, 241, 0.8)',  // indigo
        'rgba(236, 72, 153, 0.8)',  // pink
        'rgba(234, 179, 8, 0.8)',   // yellow
        'rgba(16, 185, 129, 0.8)',  // emerald
        'rgba(139, 92, 246, 0.8)',  // violet
        'rgba(20, 184, 166, 0.8)',  // teal
        'rgba(249, 115, 22, 0.8)',  // orange
        'rgba(236, 72, 153, 0.8)',  // pink
        'rgba(6, 182, 212, 0.8)',   // cyan
        'rgba(139, 92, 246, 0.8)'   // violet
      ];
      
      // Add hover effects
      const hoverBackgroundColors = backgroundColors.map(color => 
        color.replace('0.8', '1')
      );
      
      return {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColors.slice(0, data.length),
          borderColor: 'rgba(0, 0, 0, 0.3)',
          borderWidth: 1,
          hoverBackgroundColor: hoverBackgroundColors.slice(0, data.length),
          hoverBorderColor: 'rgba(255, 255, 255, 0.8)',
          hoverOffset: 10,
          spacing: 2
        }]
      };
    }
    
    // For other chart types
    yColumns.forEach((column, index) => {
      const color = `hsl(${(index * 360) / yColumns.length}, 70%, 50%)`;
      
      datasets.push({
        label: column,
        data: filteredData.map(item => item[column]),
        backgroundColor: `rgba(${index * 50}, ${index * 100}, ${index * 150}, 0.5)`,
        borderColor: color,
        borderWidth: 2,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointHoverRadius: 5,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: '#fff',
        pointHitRadius: 10,
        pointBorderWidth: 2,
        fill: selectedChart === 'area',
        tension: selectedChart === 'area' ? 0.4 : 0.1
      });
    });
    
    return {
      labels: labels,
      datasets: datasets
    };
  };

  // Chart types configuration
  const chartTypes = [
    { value: 'bar', label: 'Bar', icon: '📊', description: 'Compare values across categories' },
    { value: 'line', label: 'Line', icon: '📈', description: 'Show trends over time' },
    { value: 'pie', label: 'Pie', icon: '�', description: 'Show parts of a whole' },
    { value: 'scatter', label: 'Scatter', icon: '✱', description: 'Show relationships between variables' },
    { value: 'area', label: 'Area', icon: '▀', description: 'Show magnitude of change over time' }
  ];

  // Get icon for chart type
  const getChartIcon = (type) => {
    const chartType = chartTypes.find(ct => ct.value === type);
    return chartType ? chartType.icon : '📊';
  };

  // Effect to set initial data
  useEffect(() => {
    console.log('DataVisualization mounted or chartData changed:', { chartData });
    try {
      // Handle different data structures
      if (!chartData) {
        console.warn('No chartData provided');
        setFilteredData([]);
        return;
      }

      // If chartData has a data property (from UploadPage)
      if (chartData.data && Array.isArray(chartData.data)) {
        console.log('Setting filtered data with chartData.data:', chartData.data);
        setFilteredData(chartData.data);
        return;
      }
      
      // If chartData is directly an array
      if (Array.isArray(chartData)) {
        if (chartData.length > 0) {
          console.log('Setting filtered data with chartData array:', chartData);
          setFilteredData(chartData);
        } else {
          console.warn('Empty chart data array received');
          setFilteredData([]);
        }
        return;
      }
      
      // If chartData is an object (but not an array)
      if (typeof chartData === 'object' && chartData !== null) {
        // Try to convert object to array of values
        const dataArray = Object.values(chartData);
        console.warn('Converted chartData object to array:', dataArray);
        setFilteredData(dataArray);
        return;
      }
      
      // If we get here, the format is not supported
      console.warn('Unsupported chartData format:', chartData);
      setFilteredData([]);
      
    } catch (err) {
      console.error('Error processing chart data:', err);
      console.error('Error processing chart data:', err);
      setFilteredData([]);
    }
  }, [chartData]);

  if (!filteredData || !Array.isArray(filteredData) || filteredData.length === 0) {
    console.log('No filtered data available, showing upload prompt', { filteredData, chartData });
    return (
      <div className="no-data">
        <p>No data available for visualization. Please upload a different file.</p>
        <div style={{ marginTop: '20px', padding: '10px', background: '#2d2d2d', borderRadius: '4px' }}>
          <p style={{ fontSize: '12px', color: '#aaa' }}>Debug Info:</p>
          <pre style={{ fontSize: '10px', color: '#ddd', overflow: 'auto', maxHeight: '200px' }}>
            Chart Data: {chartData && Array.isArray(chartData) 
              ? JSON.stringify(chartData.slice(0, 2), null, 2) 
              : JSON.stringify(chartData, null, 2)}
          </pre>
        </div>
        <button onClick={handleBack} className="btn btn-outline" style={{ marginTop: '20px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Upload
        </button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <a href="/" className="logo">
              <i className="fas fa-chart-line logo-icon"></i>
              <h1>SenseSheet <span className="made-by">Made with ❤️ by Anand</span></h1>
            </a>
          </div>
          <div className="header-actions">
            <button className="export-btn" onClick={handleDownload}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{marginRight: '6px'}}>
                <path d="M8.5 1.5A1.5 1.5 0 0 1 10 0h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h6c-.314.418-.5.937-.5 1.5v6h-2a.5.5 0 0 0-.354.854l2.5 2.5a.5.5 0 0 0 .708 0l2.5-2.5A.5.5 0 0 0 11 7.5H9v-6z"/>
              </svg>
              EXPORT
            </button>
            <button 
              className="logout-btn" 
              onClick={onLogout || (() => console.log('Logout'))}
              title="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{marginRight: '6px'}}>
                <path d="M7.5 1v7h1V1h-1z"/>
                <path d="M3 8.812a4.999 4.999 0 0 1 2.578-4.375l-.485-.874A6 6 0 1 0 11 3.616l-.501.865A5 5 0 1 1 3 8.812z"/>
              </svg>
              LOGOUT
            </button>
          </div>
        </div>
      </header>
      
      <div className="content-wrapper">
        <div 
          className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
          onClick={() => setIsSidebarOpen(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Escape' && setIsSidebarOpen(false)}
          aria-label="Close sidebar"
        />
        <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          <button 
            className="sidebar-toggle" 
            onClick={(e) => {
              e.stopPropagation();
              setIsSidebarOpen(!isSidebarOpen);
            }}
            aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {isSidebarOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
          
          <div className="chart-content">
            <div className={`chart-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
              <div className="chart-options">
                {selectedChart === 'bar' && <Bar ref={chartRef} data={generateChartData()} options={commonOptions} />}
                {selectedChart === 'line' && <Line ref={chartRef} data={generateChartData()} options={commonOptions} />}
                {selectedChart === 'pie' && (
                  <Pie 
                    ref={chartRef} 
                    data={generateChartData()} 
                    options={{
                      ...pieChartOptions,
                      plugins: {
                        ...pieChartOptions.plugins,
                        title: {
                          ...pieChartOptions.plugins.title,
                          text: chartTitle || 'Pie Chart Distribution'
                        }
                      }
                    }} 
                  />
                )}
                {selectedChart === 'scatter' && (
                  <Scatter 
                    ref={chartRef}
                    data={generateChartData()}
                    options={{
                      ...commonOptions,
                      scales: {
                        ...commonOptions.scales,
                        x: {
                          ...commonOptions.scales.x,
                          type: 'linear'
                        }
                      }
                    }}
                  />
                )}
                {selectedChart === 'area' && (
                  <Line
                    ref={chartRef}
                    data={generateChartData()}
                    options={{
                      ...commonOptions,
                      elements: {
                        line: {
                          fill: true,
                          tension: 0.4
                        }
                      }
                    }}
                  />
                )}
              </div>
            </div>
            
            <div className="data-container">
              <div className="data-preview">
                <h3>Data Preview</h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        {Object.keys(filteredData[0] || {}).map((key) => (
                          <th key={key}>{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.slice(0, 5).map((row, index) => (
                        <tr key={index}>
                          {Object.values(row).map((value, i) => (
                            <td key={i}>{value !== null && value !== undefined ? String(value) : '-'}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredData.length > 5 && (
                  <p className="text-muted">Showing 5 of {filteredData.length} rows</p>
                )}
              </div>
              
              <div className="axes-controls">
                <h3>Axes Configuration</h3>
                <div className="form-group">
                  <label>X-Axis</label>
                  <select 
                    className="form-control"
                    value={xAxis}
                    onChange={(e) => setXAxis(e.target.value)}
                  >
                    {filteredData[0] && Object.keys(filteredData[0]).map((key) => (
                      <option key={`x-${key}`} value={key}>{key}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>Y-Axis</label>
                  <select 
                    className="form-control"
                    value={yAxis}
                    onChange={(e) => setYAxis(e.target.value)}
                  >
                    {filteredData[0] && Object.keys(filteredData[0]).map((key) => (
                      <option key={`y-${key}`} value={key}>{key}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-content">
            <h2>{chartTitle || 'Data Visualization'}</h2>
            
            <div className="sidebar-section">
              <h3>Chart Type</h3>
              <div className="chart-type-selector">
                {chartTypes.map((type) => (
                  <button
                    key={type.value}
                    className={`chart-type-btn ${selectedChart === type.value ? 'active' : ''}`}
                    onClick={() => setSelectedChart(type.value)}
                    title={type.description}
                  >
                    <div className="chart-icon">
                      {getChartIcon(type.value)}
                    </div>
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="sidebar-section">
              <h3>Chart Options</h3>
              <div className="form-group">
                <label htmlFor="chartTitle">Chart Title</label>
                <input
                  type="text"
                  id="chartTitle"
                  value={chartTitle}
                  onChange={(e) => setChartTitle(e.target.value)}
                  placeholder="Enter chart title"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="xAxisLabel">X-Axis Label</label>
                <input
                  type="text"
                  id="xAxisLabel"
                  value={xAxisLabel}
                  onChange={(e) => setXAxisLabel(e.target.value)}
                  placeholder="X-axis label"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="yAxisLabel">Y-Axis Label</label>
                <input
                  type="text"
                  id="yAxisLabel"
                  value={yAxisLabel}
                  onChange={(e) => setYAxisLabel(e.target.value)}
                  placeholder="Y-axis label"
                  className="form-control"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataVisualization;
