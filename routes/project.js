// routes/project.routes.js
const router = require('express').Router();
const projectController = require('../controllers/projects.controller');

router.post('/', projectController.createProject);
router.get('/:id', projectController.getProjectById);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;
