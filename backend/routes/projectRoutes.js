const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addProjectMember
} = require('../controllers/projectController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router
  .route('/')
  .get(getProjects)
  .post(authorize('admin'), createProject);

router
  .route('/:id')
  .get(getProject)
  .put(authorize('admin'), updateProject)
  .delete(authorize('admin'), deleteProject);

router.post('/:id/members', authorize('admin'), addProjectMember);

module.exports = router;
