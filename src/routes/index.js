const express = require('express');
const authRoutes = require('./authRoutes');
const taskRoutes = require('./taskRoutes');

const router = express.Router();

router.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'DayFlow API v1',
  });
});

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);

module.exports = router;
