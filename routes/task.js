// routes/task.routes.js
const router = require('express').Router();
const taskController = require('../controllers/tasks.controller');
router.post('/', taskController.createTask);
router.get('/mine/:userId', taskController.getMyTasks);
router.put('/:id/status', taskController.updateTaskStatus);
router.delete('/:id', taskController.deleteTask);
module.exports = router;