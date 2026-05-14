const express = require('express');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getAiSuggestions
} = require('../controllers/taskController');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/ai-suggest', getAiSuggestions);

router
  .route('/')
  .get(getTasks)
  .post(createTask);

router
  .route('/:id')
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;
