const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');
const {
  parseDateInput,
  startOfDay,
  endOfDay,
  toIsoDayString,
  getMonthBounds,
} = require('../utils/date');

const normalizeTask = (task) => ({
  id: task._id,
  title: task.title,
  description: task.description,
  completed: task.completed,
  taskDate: toIsoDayString(task.taskDate),
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
});

const getDateWindow = (dateQuery) => {
  const parsed = parseDateInput(dateQuery) || new Date();
  return {
    start: startOfDay(parsed),
    end: endOfDay(parsed),
    isoDate: toIsoDayString(parsed),
  };
};

const createTask = asyncHandler(async (req, res) => {
  const { title, description = '', taskDate } = req.body;

  if (!title || !title.trim()) {
    res.status(400);
    throw new Error('Task title is required.');
  }

  const parsedDate = parseDateInput(taskDate) || new Date();

  const task = await Task.create({
    user: req.user._id,
    title: title.trim(),
    description: description.trim(),
    taskDate: startOfDay(parsedDate),
  });

  res.status(201).json({
    success: true,
    message: 'Task created successfully.',
    data: normalizeTask(task),
  });
});

const getTasksByDate = asyncHandler(async (req, res) => {
  const { start, end, isoDate } = getDateWindow(req.query.date);

  const tasks = await Task.find({
    user: req.user._id,
    taskDate: { $gte: start, $lte: end },
  }).sort({ createdAt: -1 });

  const completedCount = tasks.filter((task) => task.completed).length;

  res.status(200).json({
    success: true,
    data: {
      date: isoDate,
      tasks: tasks.map(normalizeTask),
      totalCount: tasks.length,
      completedCount,
      pendingCount: tasks.length - completedCount,
    },
  });
});

const updateTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { title, description, taskDate } = req.body;

  const task = await Task.findOne({
    _id: taskId,
    user: req.user._id,
  });

  if (!task) {
    res.status(404);
    throw new Error('Task not found.');
  }

  if (typeof title === 'string' && title.trim()) task.title = title.trim();
  if (typeof description === 'string') task.description = description.trim();

  if (taskDate) {
    const parsedDate = parseDateInput(taskDate);
    if (!parsedDate) {
      res.status(400);
      throw new Error('Invalid task date.');
    }
    task.taskDate = startOfDay(parsedDate);
  }

  await task.save();

  res.status(200).json({
    success: true,
    message: 'Task updated successfully.',
    data: normalizeTask(task),
  });
});

const toggleTaskStatus = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findOne({
    _id: taskId,
    user: req.user._id,
  });

  if (!task) {
    res.status(404);
    throw new Error('Task not found.');
  }

  task.completed = !task.completed;
  await task.save();

  res.status(200).json({
    success: true,
    message: task.completed ? 'Task marked complete.' : 'Task marked incomplete.',
    data: normalizeTask(task),
  });
});

const deleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findOneAndDelete({
    _id: taskId,
    user: req.user._id,
  });

  if (!task) {
    res.status(404);
    throw new Error('Task not found.');
  }

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully.',
  });
});

const getHeatmapData = asyncHandler(async (req, res) => {
  const monthBounds = getMonthBounds(req.query.month);

  if (!monthBounds) {
    res.status(400);
    throw new Error('Provide month in YYYY-MM format.');
  }

  const rows = await Task.aggregate([
    {
      $match: {
        user: req.user._id,
        taskDate: {
          $gte: monthBounds.start,
          $lte: monthBounds.end,
        },
        completed: true,
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$taskDate',
          },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const maxCount = rows.reduce((max, row) => Math.max(max, row.count), 0);

  res.status(200).json({
    success: true,
    data: {
      month: req.query.month,
      maxCount,
      days: rows.map((row) => ({
        date: row._id,
        completedCount: row.count,
      })),
    },
  });
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const { start, end, isoDate } = getDateWindow(req.query.date);

  const [dayTasks, recentTasks] = await Promise.all([
    Task.find({ user: req.user._id, taskDate: { $gte: start, $lte: end } }).sort({ createdAt: -1 }),
    Task.find({ user: req.user._id }).sort({ updatedAt: -1 }).limit(6),
  ]);

  const completedCount = dayTasks.filter((task) => task.completed).length;

  res.status(200).json({
    success: true,
    data: {
      date: isoDate,
      completedCount,
      pendingCount: dayTasks.length - completedCount,
      totalCount: dayTasks.length,
      completionRate: dayTasks.length
        ? Math.round((completedCount / dayTasks.length) * 100)
        : 0,
      recentActivity: recentTasks.map(normalizeTask),
    },
  });
});

module.exports = {
  createTask,
  getTasksByDate,
  updateTask,
  toggleTaskStatus,
  deleteTask,
  getHeatmapData,
  getDashboardStats,
};
