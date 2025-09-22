const Todo = require('../models/Todo');

const getTodos = async () => {
  return await Todo.find();
};

const createTodo = async (data) => {
  const newTodo = new Todo({
    text: data.text,
    description: data.description,
    completed: false,
  });
  return await newTodo.save();
};

const updateTodo = async (id, data) => {
  return await Todo.findByIdAndUpdate(
    id,
    { ...data, updatedAt: Date.now() },
    { new: true }
  );
};

const deleteTodo = async (id) => {
  return await Todo.findByIdAndDelete(id);
};

module.exports = {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
};
