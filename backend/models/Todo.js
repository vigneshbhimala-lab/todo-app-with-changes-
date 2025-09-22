const mongoose = require('mongoose');
const todoSchema = new mongoose.Schema({
  text: String,
  description: String,
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },  
  updatedAt: { type: Date, default: Date.now },  
});
module.exports = mongoose.model('Todo', todoSchema);
