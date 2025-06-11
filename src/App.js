import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoDueDate, setNewTodoDueDate] = useState('');

  useEffect(() => {
    try {
      const storedTodos = localStorage.getItem('todos');
      if (storedTodos) {
        const parsedTodos = JSON.parse(storedTodos).map(todo => {
          const { timeoutId, ...rest } = todo;
          return rest;
        });
        setTodos(parsedTodos);
      }
    } catch (error) {
      console.error("Failed to load todos from local storage:", error);
    }

    return () => {
      todos.forEach(todo => {
        if (todo.timeoutId) {
          clearTimeout(todo.timeoutId);
        }
      });
    };
  }, []);

  useEffect(() => {
    try {
      const todosToSave = todos.map(todo => {
        const { timeoutId, ...rest } = todo;
        return rest;
      });
      localStorage.setItem('todos', JSON.stringify(todosToSave));
    } catch (error) {
      console.error("Failed to save todos to local storage:", error);
    }
  }, [todos]);

  const addTodo = () => {
    if (newTodoText.trim() === '') {
      return;
    }
    const newTodo = {
      id: Date.now(),
      text: newTodoText.trim(),
      completed: false,
      dueDate: newTodoDueDate,
    };
    setTodos(prevTodos => [...prevTodos, newTodo]);
    setNewTodoText('');
    setNewTodoDueDate('');
  };

  const removeTodo = (id) => {
    setTodos(prevTodos => {
      const todoToRemove = prevTodos.find(todo => todo.id === id);
      if (todoToRemove && todoToRemove.timeoutId) {
        clearTimeout(todoToRemove.timeoutId);
      }
      return prevTodos.filter(todo => todo.id !== id);
    });
  };

  const toggleComplete = (id) => {
    setTodos(prevTodos => {
      return prevTodos.map(todo => {
        if (todo.id === id) {
          if (!todo.completed) {
            const timeoutId = setTimeout(() => {
              setTodos(currentTodos => {
                const updatedTodos = currentTodos.filter(item => item.id !== id);
                return updatedTodos;
              });
            }, 3000);

            return { ...todo, completed: true, timeoutId: timeoutId };
          } else {
            if (todo.timeoutId) {
              clearTimeout(todo.timeoutId);
            }
            const { timeoutId, ...rest } = todo;
            return { ...rest, completed: false };
          }
        }
        return todo;
      });
    });
  };

  return (
    <div className="app-container">
      <div className="todo-card">
        <h1 className="main-title">To-Do List</h1>

        <div className="add-task-section">
          <h2 className="section-title">Add New Task</h2>
          <div className="input-group">
            <input
              type="text"
              className="task-input"
              placeholder="Enter task description..."
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addTodo();
                }
              }}
            />
            <input
              type="date"
              className="date-input"
              value={newTodoDueDate}
              onChange={(e) => setNewTodoDueDate(e.target.value)}
            />
            <button
              onClick={addTodo}
              className="add-button"
            >
              ADD TASK
            </button>
          </div>
        </div>

        <div className="task-list-section">
          <h2 className="section-title">My Tasks</h2>
          {todos.length === 0 ? (
            <p className="empty-list-message">No tasks yet. Add one above!</p>
          ) : (
            <ul className="todo-list">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className="todo-item"
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleComplete(todo.id)}
                    className="todo-checkbox"
                  />
                  
                  <div className="todo-content">
                    <span
                      className={`task-text ${
                        todo.completed ? 'completed' : ''
                      }`}
                    >
                      {todo.text}
                    </span>
                    {todo.dueDate && (
                      <p className={`due-date-text ${
                        todo.completed ? 'completed' : ''
                      }`}>
                        Due: {new Date(todo.dueDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => removeTodo(todo.id)}
                    className="remove-button"
                    aria-label="Remove task"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
