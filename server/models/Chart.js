const mongoose = require('mongoose');

const ChartSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  chartType: {
    type: String,
    required: true,
    enum: ['bar', 'line', 'pie', 'scatter', 'bubble', 'surface']
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Chart', ChartSchema);
