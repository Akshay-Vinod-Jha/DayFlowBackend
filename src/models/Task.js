const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: 1200,
    },
    completed: {
      type: Boolean,
      default: false,
      index: true,
    },
    taskDate: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ user: 1, taskDate: 1 });

module.exports = mongoose.model('Task', taskSchema);
