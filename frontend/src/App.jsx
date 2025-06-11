import { useEffect, useState } from 'react';
import api from './api';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import Header from './components/Header';
import StatsCard from './components/StatsCard';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tasks');
      setTasks(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (newTask) => {
    const tempId = Date.now();
    // Optimistic UI
    setTasks(prev => [
      ...prev, 
      { ...newTask, id: tempId, completed: false }
    ]);
    
    try {
      const res = await api.post('/tasks', newTask);
      // Replace temp ID with server ID
      setTasks(prev => prev.map(t => t.id === tempId ? res.data : t));
    } catch (err) {
      console.error(err);
      // Revert on error
      setTasks(prev => prev.filter(t => t.id !== tempId));
      setError('Failed to add task');
    }
  };

  // Calculate stats
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = tasks.length - completedTasks;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <StatsCard 
          total={tasks.length} 
          completed={completedTasks} 
          pending={pendingTasks} 
        />
        
        <div className="bg-white rounded-xl shadow-md p-5 mb-6">
          <TaskForm onAdd={handleAddTask} />
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <TaskList tasks={tasks} setTasks={setTasks} />
        )}
      </main>

      <footer className="text-center py-6 text-gray-500 text-sm">
        © {new Date().getFullYear()} QuickTask - Your Productivity Partner
      </footer>
    </div>
  );
}

export default App;