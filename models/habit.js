const mongoose = require('mongoose');

// Define habit schema with Mongoose
const habitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // The habit name is a required field
  },
  history: [
    {
      date: {
        type: Date,
        required: true, // Each history entry must have a date
      },
      status: {
        type: String,
        enum: ['Done', 'Not Done', 'None'], // Allowed statuses
        default: 'None', // Default value is 'None' if not specified
      },
      timing: {
        type: String,
        default: '', // Default timing is an empty string
      },
      streak: {
        type: Number,
        default: 0, // Default streak value is 0
      },
    },
  ],
  longestStreak: {
    type: Number,
    default: 0, // Tracks the longest streak of "Done" days
  },
  totalDays: {
    type: Number,
    default: 0, // Tracks the total number of days within the last 7 days habit status was checked
  },
  totalDoneDays: {
    type: Number,
    default: 0, // Tracks how many days the habit was successfully completed
  },
});

// Method to update streak count, total days, and other statistics based on habit history
habitSchema.methods.updateStreakAndTotalDays = function () {
  // Sort history by date to process entries in chronological order
  const sortedHistory = this.history.sort((a, b) => a.date - b.date);
  
  let streakCount = 0; // Counter to track consecutive "Done" streaks
  let maxStreak = 0; // Maximum streak found
  let totalDays = 0; // Number of days with habit entries within the last 7 days
  let totalDoneDays = 0; // Counter for the number of "Done" days
  let prevDate = null; // Track the previous date during history iteration

  const today = new Date(); 
  const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); // Calculate the date 7 days ago

  for (const entry of sortedHistory) {
    const currentDate = entry.date;
    const isConsecutiveDay = prevDate && prevDate.getTime() === currentDate.getTime() - 24 * 60 * 60 * 1000;

    if (entry.status === 'Done') {
      // If the habit was completed today, calculate streak or reset streak
      streakCount = isConsecutiveDay ? streakCount + 1 : 1;
      maxStreak = Math.max(maxStreak, streakCount); // Update the longest streak found
      totalDoneDays++; // Increment the count of total "Done" days
    } else {
      // Reset the streak if the habit was not done
      streakCount = 0;
    }

    // Assign the current streak value to the database history entry
    entry.streak = streakCount;

    prevDate = currentDate; // Update the previous date for comparison

    // Check if the current date is within the last 7 days
    if (currentDate >= last7Days && currentDate <= today) {
      totalDays++;
    }
  }

  // Update the calculated statistics to the main habit fields
  this.longestStreak = maxStreak;
  this.totalDays = totalDays;
  this.totalDoneDays = totalDoneDays; 
};

// Create the Habit model using the schema
const Habit = mongoose.model('Habit', habitSchema);

// Export the Habit model for use in routes/controllers
module.exports = Habit;
