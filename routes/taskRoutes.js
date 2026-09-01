const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(authMiddleware);


router.get('/admin/tasks', requireRole('admin'), taskController.listAllTasks);

router.get('/tasks', taskController.listTasks);
router.get('/tasks/new', taskController.newTaskForm);
router.post('/tasks', taskController.createTask);
router.get('/tasks/:id/edit', taskController.editTaskForm);
router.post('/tasks/:id/update', taskController.updateTask);
router.post('/tasks/:id/delete', taskController.deleteTask);

module.exports = router;
