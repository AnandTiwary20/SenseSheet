import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';
import { FiDownload, FiChevronLeft } from 'react-icons/fi';
import './DataVisualization.clean.css';

// Register all Chart.js components
Chart.register(...registerables);

const COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
];

const DataVisualization = ({ chartData, onBack, onLogout }) => {
  // State management
  const [selectedChart, setSelectedChart] = useState('bar');
  const [chartTitle, setChartTitle] = useState('Data Visualization');
  const [xAxisLabel, setXAxisLabel] = useState('Categories');
  const [yAxisLabel, setYAxisLabel] = useState('Values');
  const [xAxisColumn, setXAxisColumn] = useState('');
  const [yAxisColumns, setYAxisColumns] = useState([]);
  const [hasValidData, setHasValidData] = useState(false);
  const [processedData, setProcessedData] = useState(null);
  const [isSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [previewData, setPreviewData] = useState([]);
  
  const chartRef = useRef(null);
  const navigate = useNavigate();

  // Get all column names with their types
  const getColumnInfo = useCallback((data) => {
    if (!data || data.length === 0) return { numeric: [], text: [] };
    
    const firstRow = data[0];
    const numericCols = [];
    const textCols = [];
    
    Object.keys(firstRow).forEach(key => {
      const value = firstRow[key];
      if (typeof value === 'number' || (typeof value === 'string' && !isNaN(parseFloat(value)))) {
        numericCols.push(key);
      } else {
        textCols.push(key);
      }
    });
    
    return { numeric: numericCols, text: textCols };
  }, []);

  // Process data when component mounts or chartData changes
  useEffect(() => {
    const processData = () => {
      setIsLoading(true);
      
      if (!chartData?.data?.length) {
        setHasValidData(false);
        setIsLoading(false);
        return;
      }

      try {
        // Get column information
        const { numeric: numericCols, text: textCols } = getColumnInfo(chartData.data);
        
        // Set default x-axis (prefer text columns, fallback to first numeric)
        if (!xAxisColumn) {
          const defaultX = textCols.length > 0 ? textCols[0] : numericCols[0];
          if (defaultX) setXAxisColumn(defaultX);
        }
        
        // Set default y-axis (first numeric column not used for x-axis)
        if (yAxisColumns.length === 0 && numericCols.length > 0) {
          const defaultY = numericCols.find(col => col !== xAxisColumn) || numericCols[0];
          if (defaultY) setYAxisColumns([defaultY]);
        }
        
        // Set preview data (first 5 rows)
        setPreviewData(chartData.data.slice(0, 5));
        setProcessedData(chartData.data);
        setHasValidData(true);
      } catch (error) {
        console.error('Error processing data:', error);
        setHasValidData(false);
      } finally {
        setIsLoading(false);
      }
    };

    processData();
  }, [chartData, getColumnInfo, xAxisColumn, yAxisColumns]);

  // Handle going back to previous page
  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  }, [navigate, onBack]);

  // Handle chart download
  const handleDownload = (type = 'png') => {
    if (!chartRef.current) return;
    
    const fileName = `chart-${new Date().toISOString().slice(0, 10)}`;
    
    switch (type) {
      case 'png':
        const pngLink = document.createElement('a');
        pngLink.download = `${fileName}.png`;
        pngLink.href = chartRef.current.toBase64Image('image/png', 1);
        pngLink.click();
        break;
        
      case 'jpeg':
        const jpegLink = document.createElement('a');
        jpegLink.download = `${fileName}.jpg`;
        jpegLink.href = chartRef.current.toBase64Image('image/jpeg', 1);
        jpegLink.click();
        break;
        
      case 'svg':
        const svgLink = document.createElement('a');
        svgLink.download = `${fileName}.svg`;
        svgLink.href = `data:image/svg+xml;base64,${btoa(chartRef.current.toBase64Image('image/svg+xml', 1))}`;
        svgLink.click();
        break;
        
      case 'csv':
        if (!processedData || !xAxisColumn) return;
        
        const headers = [xAxisColumn, ...yAxisColumns];
        const csvContent = [
          headers.join(','),
          ...processedData.map(row => 
            headers.map(header => 
              `"${String(row[header] || '').replace(/"/g, '""')}"`
            ).join(',')
          )
        ].join('\n');
        
        const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const csvUrl = URL.createObjectURL(csvBlob);
        const csvLink = document.createElement('a');
        csvLink.href = csvUrl;
        csvLink.download = `${fileName}.csv`;
        document.body.appendChild(csvLink);
        csvLink.click();
        document.body.removeChild(csvLink);
        break;
        
      default:
        break;
    }
  };

  // Enhanced chart options with dark theme
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: true,
    backgroundColor: 'var(--bg-light)',
    color: '#ffffff', // White text for all chart elements
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ffffff', // White legend text
          font: {
            size: 13,
            family: 'Inter, system-ui, -apple-system, sans-serif',
            weight: '500'
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: true,
        text: chartTitle || 'Chart Title',
        color: '#ffffff', // White title text
        font: {
          size: 18,
          weight: '600',
          family: 'Inter, system-ui, -apple-system, sans-serif'
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(37, 46, 62, 0.95)',
        titleColor: 'var(--text-primary)',
        bodyColor: 'var(--text-secondary)', 
        titleFont: {
          size: 14,
          weight: '600',
          family: 'Inter, system-ui, -apple-system, sans-serif'
        },
        bodyFont: {
          size: 13,
          family: 'Inter, system-ui, -apple-system, sans-serif'
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        usePointStyle: true,
        borderColor: 'var(--border)',
        borderWidth: 1,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
      }
    },
    scales: {
      x: {
        grid: {
          color: 'var(--chart-grid)',
          drawBorder: false,
          borderDash: [5, 5]
        },
        ticks: {
          color: '#ffffff', // White axis ticks
          font: {
            size: 12,
            family: 'Inter, system-ui, -apple-system, sans-serif'
          }
        },
        title: {
          display: !!xAxisLabel,
          text: xAxisLabel,
          color: '#ffffff', // White axis title
          font: {
            size: 14,
            weight: '500',
            family: 'Inter, system-ui, -apple-system, sans-serif'
          },
          padding: { top: 10, bottom: 5 }
        },
        border: {
          color: 'var(--border)'
        }
      },
      y: {
        grid: {
          color: 'var(--chart-grid)',
          drawBorder: false,
          borderDash: [5, 5]
        },
        ticks: {
          color: '#ffffff', // White axis ticks
          font: {
            size: 12,
            family: 'Inter, system-ui, -apple-system, sans-serif'
          },
          padding: 8
        },
        title: {
          display: !!yAxisLabel,
          text: yAxisLabel,
          color: '#ffffff', // White axis title
          font: {
            size: 14,
            weight: '500',
            family: 'Inter, system-ui, -apple-system, sans-serif'
          },
          padding: { bottom: 10, top: 5 }
        },
        border: {
          color: 'var(--border)'
        }
      }
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 2,
        fill: false
      },
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2,
        hoverBorderWidth: 2,
        backgroundColor: 'var(--primary)'
      },
      bar: {
        borderRadius: 4,
        borderSkipped: false,
        backgroundColor: 'var(--primary)',
        borderColor: 'var(--primary-hover)'
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    },
    layout: {
      padding: {
        left: 20,
        right: 20,
        top: 20,
        bottom: 20
      }
    },
    interaction: {
      mode: 'nearest',
      intersect: false
    },
    hover: {
      mode: 'nearest',
      intersect: true
    }
  }), [chartTitle, xAxisLabel, yAxisLabel]);

  // Chart data getter functions
  const getBarChartData = useCallback(() => {
    if (!processedData || !xAxisColumn || yAxisColumns.length === 0) return { labels: [], datasets: [] };
    
    return {
      labels: processedData.map(item => String(item[xAxisColumn])),
      datasets: yAxisColumns.map((col, index) => ({
        label: col,
        data: processedData.map(item => parseFloat(item[col]) || 0),
        backgroundColor: `${COLORS[index % COLORS.length]}33`,
        borderColor: COLORS[index % COLORS.length],
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 'flex',
        maxBarThickness: 32,
        borderSkipped: false,
      }))
    };
  }, [processedData, xAxisColumn, yAxisColumns]);

  const getLineChartData = useCallback(() => {
    if (!processedData || !xAxisColumn || yAxisColumns.length === 0) return { labels: [], datasets: [] };
    
    return {
      labels: processedData.map(item => String(item[xAxisColumn])),
      datasets: yAxisColumns.map((col, index) => ({
        label: col,
        data: processedData.map(item => parseFloat(item[col]) || 0),
        borderColor: COLORS[index % COLORS.length],
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointBackgroundColor: COLORS[index % COLORS.length],
        pointBorderColor: '#fff',
        pointHoverRadius: 5,
        pointHoverBackgroundColor: COLORS[index % COLORS.length],
        pointHoverBorderColor: '#fff',
        pointHitRadius: 10,
        pointBorderWidth: 2,
        tension: 0.3,
        fill: false
      }))
    };
  }, [processedData, xAxisColumn, yAxisColumns]);

  const getPieChartData = useCallback(() => {
    if (!processedData || !xAxisColumn) return { labels: [], datasets: [] };
    
    const labels = processedData.map(item => String(item[xAxisColumn]));
    const data = yAxisColumns.length > 0 
      ? processedData.map(item => parseFloat(item[yAxisColumns[0]]) || 0)
      : processedData.map((_, i) => i + 1);
    
    return {
      labels,
      datasets: [{
        data,
        backgroundColor: labels.map((_, i) => {
          const color = COLORS[i % COLORS.length];
          return color + '80';
        }),
        borderColor: '#fff',
        borderWidth: 2,
        hoverOffset: 8
      }]
    };
  }, [processedData, xAxisColumn, yAxisColumns]);

  const getScatterChartData = useCallback(() => {
    if (!processedData || !xAxisColumn || yAxisColumns.length === 0) return { datasets: [] };
    
    return {
      datasets: yAxisColumns.map((col, idx) => ({
        label: col,
        data: processedData.map(item => ({
          x: parseFloat(item[xAxisColumn]) || 0,
          y: parseFloat(item[col]) || 0
        })),
        backgroundColor: COLORS[idx % COLORS.length],
        borderColor: '#fff',
        borderWidth: 1,
        pointRadius: 6,
        pointHoverRadius: 8
      }))
    };
  }, [processedData, xAxisColumn, yAxisColumns]);

  // Show loading state if data is being processed
  if (isLoading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
        <p>Processing your data...</p>
      </div>
    );
  }

  if (!hasValidData) {
    return (
      <div className="no-data">
        <h2>No Data Available</h2>
        <p>Please upload a valid dataset to begin visualization.</p>
        <button onClick={handleBack} className="btn-primary">
          <FiChevronLeft /> Back to Upload
        </button>
      </div>
    );
  }

  return (
    <>
      <header className="dashboard-header">
        <button className="export-btn" onClick={() => handleDownload()}>
          <FiDownload /> Export Chart
        </button>
        <h1>SenseSheet</h1>
      </header>
      <div className="dashboard-container">
        <div className="dashboard-layout">
        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-section">
            <h3>Chart Type</h3>
            <div className="form-group">
              <select
                value={selectedChart}
                onChange={(e) => setSelectedChart(e.target.value)}
                className="select-input"
              >
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="scatter">Scatter Plot</option>
              </select>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Axes Configuration</h3>
            <div className="form-group">
              <label>X-Axis</label>
              <select
                value={xAxisColumn}
                onChange={(e) => setXAxisColumn(e.target.value)}
                className="select-input"
              >
                {chartData?.headers?.map((header, idx) => (
                  <option key={`x-${idx}`} value={header}>
                    {header}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={xAxisLabel}
                onChange={(e) => setXAxisLabel(e.target.value)}
                placeholder="X-axis label"
                className="text-input"
              />
            </div>

            <div className="form-group">
              <label>Y-Axis</label>
              <select
                multiple
                value={yAxisColumns}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  setYAxisColumns(selected);
                }}
                className="select-input"
                size="4"
              >
                {chartData?.headers?.filter(h => h !== xAxisColumn).map((header, idx) => (
                  <option key={`y-${idx}`} value={header}>
                    {header}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={yAxisLabel}
                onChange={(e) => setYAxisLabel(e.target.value)}
                placeholder="Y-axis label"
                className="text-input"
              />
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Display Options</h3>
            <div className="form-group">
              <label>Chart Title</label>
              <input
                type="text"
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
                placeholder="Enter chart title"
                className="text-input"
              />
            </div>
            <button className="btn btn-primary" onClick={handleDownload}>
              <FiDownload /> Export Chart
            </button>
          </div>
        </aside>

        <div className="main-content">
          <div className="chart-area">
            <h2>{chartTitle}</h2>
            <div className="chart-wrapper">
              {processedData && xAxisColumn && yAxisColumns.length > 0 ? (
                <>
                  {selectedChart === 'bar' && (
                    <Bar 
                      ref={chartRef} 
                      data={getBarChartData()} 
                      options={{
                        ...chartOptions,
                        maintainAspectRatio: false,
                        responsive: true,
                        animation: { duration: 0 },
                        layout: { padding: 20 },
                        plugins: {
                          legend: { position: 'top', labels: { padding: 20 } }
                        }
                      }}
                    />
                  )}
                  {selectedChart === 'line' && (
                    <Line 
                      ref={chartRef} 
                      data={getLineChartData()} 
                      options={{
                        ...chartOptions,
                        maintainAspectRatio: false,
                        responsive: true,
                        animation: { duration: 0 },
                        layout: { padding: 20 },
                        plugins: {
                          legend: { position: 'top', labels: { padding: 20 } }
                        }
                      }}
                    />
                  )}
                  {selectedChart === 'pie' && (
                    <Pie 
                      ref={chartRef} 
                      data={getPieChartData()} 
                      options={{
                        ...chartOptions,
                        maintainAspectRatio: false,
                        responsive: true,
                        animation: { duration: 0 },
                        layout: { padding: 20 },
                        plugins: {
                          legend: { position: 'right', labels: { padding: 20 } }
                        }
                      }}
                    />
                  )}
                  {selectedChart === 'scatter' && (
                    <Scatter 
                      ref={chartRef} 
                      data={getScatterChartData()} 
                      options={{
                        ...chartOptions,
                        maintainAspectRatio: false,
                        responsive: true,
                        animation: { duration: 0 },
                        layout: { padding: 20 },
                        plugins: {
                          legend: { position: 'top', labels: { padding: 20 } }
                        }
                      }}
                    />
                  )}
                </>
              ) : (
                <div className="no-data-message">
                  <p>Please select X and Y axes to display the chart</p>
                </div>
              )}
            </div>
          </div>

          <div className="data-overview">
            <div className="product-overview">
              <h3>Data Overview</h3>
              <div className="overview-stats">
                <div className="stat-card">
                  <span className="stat-value">{processedData?.length || 0}</span>
                  <span className="stat-label">Total Records</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{chartData?.headers?.length || 0}</span>
                  <span className="stat-label">Columns</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{yAxisColumns.length}</span>
                  <span className="stat-label">Metrics</span>
                </div>
              </div>
              {xAxisColumn && (
                <div className="dimension-info">
                  <h4>Current Dimensions</h4>
                  <p>X-Axis: <strong>{xAxisLabel || xAxisColumn}</strong></p>
                  <p>Y-Axis: <strong>{yAxisColumns.length > 0 ? yAxisColumns.join(', ') : 'None selected'}</strong></p>
                </div>
              )}
            </div>

            <div className="data-preview">
              <div className="preview-header">
                <h3>Data Preview</h3>
                <span className="badge">{previewData.length} of {processedData?.length || 0} rows</span>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      {chartData?.headers?.map((header, idx) => (
                        <th key={idx}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, rowIdx) => (
                      <tr key={rowIdx}>
                        {chartData?.headers?.map((header, colIdx) => (
                          <td key={`${rowIdx}-${colIdx}`}>
                            {typeof row[header] === 'number' 
                              ? row[header].toLocaleString() 
                              : row[header] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default DataVisualization;
