const Habit = require('../models/habit'); // Import the Habit model

/** 
 * Get all habits
 * Handles fetching all habit data and rendering it to the index view
 */
exports.getAllHabits = async (req, res) => {
  try {
    const habits = await Habit.find(); // Retrieve all habit records from the database
    res.render('index', { habits }); // Render the index view with the retrieved habit data
  } catch (error) {
    console.error('Error retrieving habits:', error); // Log the error if fetching fails
    res.status(500).json({ message: 'Failed to retrieve habits' }); // Send a 500 status code on failure
  }
};

/** 
 * Get habit detail by ID
 * Handles fetching a specific habit and rendering its details to the habitDetail view
 */
exports.getHabitDetail = async (req, res) => {
  try {
    const { id } = req.params; // Extract habit ID from request parameters
    const habit = await Habit.findById(id); // Fetch the habit by its ID

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' }); // Respond with a 404 if the habit does not exist
    }

    habit.updateStreakAndTotalDays(); // Call method to update streak and total days

    res.render('habitDetail', { habit }); // Render habit details view with the habit data
  } catch (error) {
    console.error('Error retrieving habit details:', error); // Log error
    res.status(500).json({ message: 'Failed to retrieve habit details' }); // Send a 500 status code on failure
  }
};

/**
 * Create a new habit
 * Handles the creation of a new habit and redirects back to index
 */
exports.createHabit = async (req, res) => {
  try {
    const { name } = req.body; // Extract habit name from request body
    const habit = await Habit.create({ name }); // Create a new habit in the database
    res.redirect('/'); // Redirect to the index page after habit creation
  } catch (error) {
    console.error('Error creating habit:', error); // Log the error
    res.status(500).json({ message: 'Failed to create habit' }); // Send a 500 status code on failure
  }
};

/**
 * Update habit status
 * Handles updating the habit's status and timing over the past week
 */
exports.updateHabitStatus = async (req, res) => {
  try {
    const { id } = req.params; // Extract habit ID from request parameters
    const { statuses, timings } = req.body; // Extract statuses and timings from request body

    const habit = await Habit.findById(id); // Find the habit by ID
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' }); // Return 404 if habit doesn't exist
    }

    const history = habit.history; // Access the habit's history data
    const today = new Date().setHours(0, 0, 0, 0); // Normalize the current date to midnight

    for (let i = 0; i < 7; i++) {
      const date = new Date(today - i * 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0); // Generate dates for the past 7 days
      const index = history.findIndex((item) => item.date.getTime() === date); // Search for a matching date in history

      if (index !== -1) {
        // If a history entry exists for the date, update it
        history[index].status = statuses[i];
        history[index].timing = timings[i];
      } else {
        // Otherwise, create a new history entry
        history.push({ date: new Date(date), status: statuses[i], timing: timings[i] });
      }
    }

    habit.updateStreakAndTotalDays(); // Update streak and total days
    await habit.save(); // Save the updated habit data

    res.redirect(`/habits/${id}`); // Redirect to the habit detail page
  } catch (error) {
    console.error('Error updating habit status:', error); // Log error
    res.status(500).json({ message: 'Failed to update habit status' }); // Send a 500 status code on failure
  }
};

/**
 * Update habit name
 * Handles renaming a specific habit
 */
exports.updateHabitName = async (req, res) => {
  try {
    const { id } = req.params; // Extract habit ID from request parameters
    const { name } = req.body; // Extract new habit name from request body

    const habit = await Habit.findById(id); // Find the habit by its ID
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' }); // Respond with 404 if habit is not found
    }

    habit.name = name; // Update habit name
    await habit.save(); // Save changes to the database

    res.redirect(`/`); // Redirect to the index page
  } catch (error) {
    console.error('Error updating habit name:', error); // Log error
    res.status(500).json({ message: 'Failed to update habit name' }); // Send a 500 status code on failure
  }
};

/**
 * Delete a habit
 * Handles deleting a habit and redirecting back to the index page
 */
exports.deleteHabit = async (req, res) => {
  try {
    const { id } = req.params; // Extract habit ID from request parameters

    const habit = await Habit.findByIdAndRemove(id); // Delete habit from database
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' }); // Respond with 404 if habit is not found
    }

    res.redirect('/'); // Redirect back to the index page after deletion
  } catch (error) {
    console.error('Error deleting habit:', error); // Log error
    res.status(500).json({ message: 'Failed to delete habit' }); // Send a 500 status code on failure
  }
};
