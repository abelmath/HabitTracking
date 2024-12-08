const express = require('express');
const habitController = require('../controllers/habitController');
const router = express.Router();

// Route to get all habits
router.get('/', habitController.getAllHabits);

// Route to get habit detail
router.get('/habits/:id', habitController.getHabitDetail);

// Route to create a new habit
router.post('/habits', habitController.createHabit);

// Route to update habit status
router.post('/habits/:id/update-status', habitController.updateHabitStatus);

// Route to update habit name
router.post('/habits/:id/update-name', habitController.updateHabitName);

// Route to delete a habit
router.post('/habits/:id/delete', habitController.deleteHabit);

module.exports = router;