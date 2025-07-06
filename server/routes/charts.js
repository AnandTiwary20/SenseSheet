const express = require('express');
const router = express.Router();
const Chart = require('../models/Chart');

// Get all charts for a user
router.get('/:userId', async (req, res) => {
  try {
    const charts = await Chart.find({ userId: req.params.userId }).sort('-createdAt');
    res.json(charts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get a single chart
router.get('/chart/:id', async (req, res) => {
  try {
    const chart = await Chart.findById(req.params.id);
    if (!chart) {
      return res.status(404).json({ message: 'Chart not found' });
    }
    res.json(chart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Save a new chart
router.post('/', async (req, res) => {
  try {
    const { name, description, chartType, data, userId } = req.body;
    
    const newChart = new Chart({
      name,
      description,
      chartType,
      data,
      userId
    });

    const savedChart = await newChart.save();
    res.status(201).json(savedChart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update a chart
router.put('/:id', async (req, res) => {
  try {
    const { name, description, data } = req.body;
    
    const chart = await Chart.findById(req.params.id);
    if (!chart) {
      return res.status(404).json({ message: 'Chart not found' });
    }

    chart.name = name || chart.name;
    chart.description = description || chart.description;
    chart.data = data || chart.data;

    const updatedChart = await chart.save();
    res.json(updatedChart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete a chart
router.delete('/:id', async (req, res) => {
  try {
    const chart = await Chart.findById(req.params.id);
    if (!chart) {
      return res.status(404).json({ message: 'Chart not found' });
    }

    await chart.remove();
    res.json({ message: 'Chart removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
