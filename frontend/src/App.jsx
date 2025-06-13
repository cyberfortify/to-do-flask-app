import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Signup";
import Dashboard from "./components/Dashboard";
import api from "./api";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      fetchTasks();
    }
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/api/tasks');
      setTasks(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError(error.response?.data?.error || 'Failed to fetch tasks');
    }
  };

  const handleAddTask = async (newTask) => {
    try {
      const response = await api.post('/api/tasks', newTask);
      setTasks(prevTasks => [...prevTasks, response.data]);
      setError(null);
    } catch (error) {
      console.error('Error adding task:', error);
      setError(error.response?.data?.error || 'Failed to add task');
    }
  };

  const handleUpdateTask = async (taskId, updatedTask) => {
    try {
      const response = await api.put(`/api/tasks/${taskId}`, updatedTask);
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? response.data : task
        )
      );
      setError(null);
    } catch (error) {
      console.error('Error updating task:', error);
      setError(error.response?.data?.error || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/api/tasks/${taskId}`);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      setError(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      setError(error.response?.data?.error || 'Failed to delete task');
    }
  };

  const handleLogin = async (credentials) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      const { token } = response.data;
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      setError(null);
      fetchTasks(); // Fetch tasks after successful login
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.error || 'Login failed');
    }
  };

  const handleRegister = async (userData) => {
    try {
      const response = await api.post('/api/auth/signup', userData);
      const { token } = response.data;
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      setError(null);
      fetchTasks(); // Fetch tasks after successful registration
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.error || 'Registration failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setTasks([]); // Clear tasks on logout
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route 
          path="/login" 
          element={
            !isAuthenticated ? (
              <Login onLogin={handleLogin} error={error} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        <Route 
          path="/register" 
          element={
            !isAuthenticated ? (
              <Register onRegister={handleRegister} error={error} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              <Dashboard 
                tasks={tasks}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onLogout={handleLogout}
                error={error}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default App;
