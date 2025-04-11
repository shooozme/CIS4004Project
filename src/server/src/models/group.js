const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: '#4285F4' // Default blue color
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      email: {
        type: String,
        required: true
      },
      name: {
        type: String
      },
      joinedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  invites: [
    {
      email: {
        type: String,
        required: true
      },
      invitedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Group', GroupSchema);