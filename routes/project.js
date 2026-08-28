const router = require('express').Router();
const projectController = require('../controllers/projects.controller');

//CRUD routes for projects
router.post('/', projectController.createProject);
router.get('/mine/:userId', projectController.getMyProjects);
router.get('/:id', projectController.getProjectById);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);
router.get('/w/:workspaceId', projectController.getAllProjectsByWorkspace);

module.exports = router;
