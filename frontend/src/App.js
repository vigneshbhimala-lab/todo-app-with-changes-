import React, { useState, useEffect,useRef } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/todos';

function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // sorting state
  const [editId, setEditId] = useState(null);
    const [editText, setEditText] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const inputRef = useRef(null);

const startEdit = (id, currentText, currentDesc) => {
  setEditId(id);
  setEditText(currentText);
  setEditDesc(currentDesc || '');
};

const saveEdit = async (id, newText, newDesc) => {
  if (!newText.trim()) {
    deleteTodo(id);
    setEditId(null);
    return;
  }
  const todo = todos.find(t => t._id === id);
  const res = await axios.put(`${API_URL}/${id}`, {
    ...todo,
    text: newText,
    description: newDesc
  });
  setTodos(todos.map(t => (t._id === id ? res.data : t)));
  setEditId(null);
  setEditText('');
  setEditDesc('');
};

const cancelEdit = () => {
  setEditId(null);
  setEditText('');
  setEditDesc('');
};

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const res = await axios.get(API_URL);
    setTodos(res.data);
  };

  const addTodo = async () => {
    if (!text.trim()) return;
    const res = await axios.post(API_URL, { 
      text, 
      description, 
      createdAt: new Date().toISOString() // add timestamp
    });
    setTodos([...todos, res.data]);
    setText('');
    setDescription('');
    inputRef.current.focus(); 
  };

  const toggleTodo = async (id, completed) => {
    const res = await axios.put(`${API_URL}/${id}`, { completed: !completed });
    setTodos(todos.map(t => t._id === id ? res.data : t));
  };

  const deleteTodo = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    await axios.delete(`${API_URL}/${id}`);
    setTodos(todos.filter(t => t._id !== id));
  };

  

  const clearCompleted = async () => {
    if (!window.confirm("Clear completed tasks?")) return;
    const completed = todos.filter(t => t.completed);
    await Promise.all(completed.map(t => axios.delete(`${API_URL}/${t._id}`)));
    fetchTodos();
  };

  const resetAll = async () => {
    if (!window.confirm("Reset all todos?")) return;
    await Promise.all(todos.map(t => axios.delete(`${API_URL}/${t._id}`)));
    fetchTodos();
  };

  const remaining = todos.filter(t => !t.completed).length;

  
  const sortedTodos = [...todos].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'az') return a.text.localeCompare(b.text);
    if (sortBy === 'completed') return a.completed === b.completed ? 0 : a.completed ? 1 : -1;
    return 0;
  });

  return (
    <div className="container" role="main">
      <h1>My To-Do List</h1>
      <p className="lead">Add tasks, mark complete, edit, delete and  Double click to edit Todo</p>

      <div className="add-row">
        <input
          type="text"
          placeholder="Add a new task and press Enter"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTodo()}
          ref={inputRef}
        />
        <input
          type="text"
          placeholder="Task description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTodo()}
        />
        <button className="btn" onClick={addTodo}>Add</button>
      </div>

      <div className="sort-controls">
        <label>Sort by: </label>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="az">A-Z</option>
          <option value="completed">Completed First</option>
        </select>
      </div>

    <p className="edit-para">  Double click to edit Todo</p>

<div className="todo-card">
  <ul className="todo-list">
    {sortedTodos.length === 0 ? (
  <li className="empty-msg">No tasks yet — add one above</li>
) : (
  sortedTodos.map(td => (
    <li key={td._id}>
      <div className="todo-left">
        <input
          type="checkbox"
          checked={td.completed}
          onChange={() => toggleTodo(td._id, td.completed)}
        />

        
        {editId === td._id ? (
          <input
            type="text"
            className="edit-input"
            value={editText}
            onChange={e => setEditText(e.target.value)}
            
           onKeyDown={e => {
              if (e.key === 'Enter') saveEdit(td._id, editText, editDesc);
              if (e.key === 'Escape') cancelEdit();
            }}
            autoFocus
          />
        ) : (
          <div
            className={`todo-text ${td.completed ? 'completed' : ''}`}
            onDoubleClick={() => startEdit(td._id, td.text, td.description)}
          >
            {td.text}
          </div>
        )}

        {/* Editable description */}
        {editId === td._id ? (
          <input
            type="text"
            className="edit-input desc"
            placeholder="Edit description"
            value={editDesc}
            onChange={e => setEditDesc(e.target.value)}
            
            onKeyDown={e => {
                if (e.key === 'Enter') saveEdit(td._id, editText, editDesc);
                if (e.key === 'Escape') cancelEdit();
            }}  
          />
        ) : (
          td.description && (
            <div
              className="todo-desc"
              onDoubleClick={() => startEdit(td._id, td.text, td.description)}
            >
              {td.description}
            </div>
          )
        )}

        {td.createdAt && (
          <div className="todo-time">
            {new Date(td.createdAt).toLocaleString()}
          </div>
        )}
      </div>
      <div className="actions">
        <button className="icon-btn del" onClick={() => deleteTodo(td._id)}>Delete</button>
      </div>
    </li>
  ))
)}

     
  </ul>
</div>

      <div className="meta">
        <div>{remaining} remaining / {todos.length} total</div>
        <div>
          <button className="icon-btn ghost" onClick={clearCompleted}>Clear completed</button>
          <button className="icon-btn" onClick={resetAll}>Reset</button>
        </div>
      </div>
    </div>
  );
}

export default App;
