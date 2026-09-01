const mongoose = require('mongoose');
const Task = require('../models/Task');
const Category = require('../models/Category');
const User = require('../models/User');

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

exports.listTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.userId })
      .populate('category', 'name')
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    return res.render('taskList', {
      title: 'My Tasks',
      tasks,
      heading: 'My Tasks',
      isAdminView: false,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (err) {
    console.error('List tasks error:', err.message);
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Unable to load tasks right now.'
    });
  }
};

exports.listAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({})
      .populate('category', 'name')
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    return res.render('taskList', {
      title: 'All User Tasks',
      tasks,
      heading: 'All User Tasks',
      isAdminView: true,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (err) {
    console.error('List all tasks error:', err.message);
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Unable to load tasks right now.'
    });
  }
};

exports.newTaskForm = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    let users = [];
    if (req.user.role === 'admin') {
      users = await User.find({}).select('username email role').sort({ username: 1 });
    }

    return res.render('taskForm', {
      title: 'Add Task',
      task: null,
      categories,
      users,
      formAction: '/tasks',
      error: null
    });
  } catch (err) {
    console.error('New task form error:', err.message);
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Unable to load the task form.'
    });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, category, assignedUser } = req.body;

    if (!title || !title.trim()) {
      const categories = await Category.find({}).sort({ name: 1 });
      const users = req.user.role === 'admin' ? await User.find({}).select('username email role') : [];
      return res.status(400).render('taskForm', {
        title: 'Add Task',
        task: req.body,
        categories,
        users,
        formAction: '/tasks',
        error: 'Title is required.'
      });
    }

    let ownerId = req.user.userId;
    if (req.user.role === 'admin' && assignedUser && isValidObjectId(assignedUser)) {
      const targetUser = await User.findById(assignedUser);
      if (targetUser) {
        ownerId = targetUser._id;
      }
    }

    const task = new Task({
      title: title.trim(),
      description: description ? description.trim() : '',
      status: status || 'Pending',
      priority: priority || 'Medium',
      dueDate: dueDate || null,
      category: category && isValidObjectId(category) ? category : null,
      user: ownerId
    });

    await task.save();

    await User.findByIdAndUpdate(ownerId, { $addToSet: { tasks: task._id } });

    const redirectPath = req.user.role === 'admin' ? '/admin/tasks' : '/tasks';
    return res.redirect(`${redirectPath}?success=Task created successfully.`);
  } catch (err) {
    console.error('Create task error:', err.message);
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Unable to create the task.'
    });
  }
};

exports.editTaskForm = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).render('error', { title: 'Not Found', message: 'Task not found.' });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).render('error', { title: 'Not Found', message: 'Task not found.' });
    }

    if (req.user.role !== 'admin' && task.user.toString() !== req.user.userId) {
      return res.status(403).render('forbidden', {
        title: 'Forbidden',
        message: 'You do not have permission to edit this task.'
      });
    }

    const categories = await Category.find({}).sort({ name: 1 });
    let users = [];
    if (req.user.role === 'admin') {
      users = await User.find({}).select('username email role').sort({ username: 1 });
    }

    return res.render('taskForm', {
      title: 'Edit Task',
      task,
      categories,
      users,
      formAction: `/tasks/${task._id}/update`,
      error: null
    });
  } catch (err) {
    console.error('Edit task form error:', err.message);
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Unable to load the task.'
    });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).render('error', { title: 'Not Found', message: 'Task not found.' });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).render('error', { title: 'Not Found', message: 'Task not found.' });
    }

    if (req.user.role !== 'admin' && task.user.toString() !== req.user.userId) {
      return res.status(403).render('forbidden', {
        title: 'Forbidden',
        message: 'You do not have permission to edit this task.'
      });
    }

    const { title, description, status, priority, dueDate, category, assignedUser } = req.body;

    if (!title || !title.trim()) {
      const categories = await Category.find({}).sort({ name: 1 });
      const users = req.user.role === 'admin' ? await User.find({}).select('username email role') : [];
      return res.status(400).render('taskForm', {
        title: 'Edit Task',
        task: { ...req.body, _id: id },
        categories,
        users,
        formAction: `/tasks/${id}/update`,
        error: 'Title is required.'
      });
    }

    const previousOwner = task.user.toString();

    task.title = title.trim();
    task.description = description ? description.trim() : '';
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.dueDate = dueDate || null;
    task.category = category && isValidObjectId(category) ? category : null;

    if (req.user.role === 'admin' && assignedUser && isValidObjectId(assignedUser)) {
      task.user = assignedUser;
    }

    await task.save();

    if (task.user.toString() !== previousOwner) {
      await User.findByIdAndUpdate(previousOwner, { $pull: { tasks: task._id } });
      await User.findByIdAndUpdate(task.user, { $addToSet: { tasks: task._id } });
    }

    const redirectPath = req.user.role === 'admin' ? '/admin/tasks' : '/tasks';
    return res.redirect(`${redirectPath}?success=Task updated successfully.`);
  } catch (err) {
    console.error('Update task error:', err.message);
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Unable to update the task.'
    });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).render('error', { title: 'Not Found', message: 'Task not found.' });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).render('error', { title: 'Not Found', message: 'Task not found.' });
    }

    if (req.user.role !== 'admin' && task.user.toString() !== req.user.userId) {
      return res.status(403).render('forbidden', {
        title: 'Forbidden',
        message: 'You do not have permission to delete this task.'
      });
    }

    await Task.findByIdAndDelete(id);
    await User.findByIdAndUpdate(task.user, { $pull: { tasks: task._id } });

    const redirectPath = req.user.role === 'admin' ? '/admin/tasks' : '/tasks';
    return res.redirect(`${redirectPath}?success=Task deleted successfully.`);
  } catch (err) {
    console.error('Delete task error:', err.message);
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Unable to delete the task.'
    });
  }
};
