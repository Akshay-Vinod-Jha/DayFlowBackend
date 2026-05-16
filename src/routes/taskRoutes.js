const express = require('express');
const {
  createTask,
  getTasksByDate,
  updateTask,
  toggleTaskStatus,
  deleteTask,
  getHeatmapData,
  getDashboardStats,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getTasksByDate);
router.post('/', createTask);
router.get('/heatmap', getHeatmapData);
router.get('/stats', getDashboardStats);
router.put('/:taskId', updateTask);
router.patch('/:taskId/toggle', toggleTaskStatus);
router.delete('/:taskId', deleteTask);

module.exports = router;
