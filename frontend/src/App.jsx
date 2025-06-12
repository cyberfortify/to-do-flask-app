import { useEffect, useState } from "react";
import api from "./api";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import Header from "./components/Header";
import StatsCard from "./components/StatsCard";

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tasks");
      setTasks(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load tasks. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (newTask) => {
    const tempId = Date.now(); // ✅ temporary ID for UI only
  
    // ✅ Optimistic UI update → Add task immediately to the UI
    setTasks((prevTasks) => [
      ...prevTasks,
      { ...newTask, id: tempId, completed: false },
    ]);
  
    try {
      const res = await api.post("/tasks", newTask);
  
      // ✅ Replace temp task with server response (if you get it back)
      fetchTasks();  // Fresh from server
    } catch (err) {
      console.error(err);
      setError("Failed to add task");
  
      // ❗ Remove the optimistic task on failure
      setTasks((prevTasks) => prevTasks.filter((t) => t.id !== tempId));
    }
  };
  

  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = tasks.length - completedTasks;

  return (
    <div className="bg-light min-vh-100">
      <Header />

      <div className="container py-5">
        <StatsCard
          total={tasks.length}
          completed={completedTasks}
          pending={pendingTasks}
        />

        {/* ✅ Proper Bootstrap 2-column layout */}
        <div className="row mt-4 g-4">
          {/* Left: Task Form */}
          <div className="col-md-8">
            <div className="card shadow">
              <div className="card-body">
                <h2 className="h4 mb-4">Add New Task</h2>
                <TaskForm onAdd={handleAddTask} />
              </div>
            </div>
          </div>

          {/* Right: Task List */}
          <div className="col-md-4">
            <div className="card shadow">
              <div className="card-body">
                <h2 className="h4 mb-3">Your Tasks</h2>

                {error && <div className="alert alert-danger">{error}</div>}

                {loading ? (
                  <div className="d-flex justify-content-center py-4">
                    <div
                      className="spinner-border text-primary"
                      role="status"
                    ></div>
                  </div>
                ) : (
                  <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                    <TaskList
                      tasks={tasks}
                      setTasks={setTasks}
                      fetchTasks={fetchTasks}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="text-center py-4 text-muted small">
        © {new Date().getFullYear()} QuickTask - Manage your work smartly
      </footer>
    </div>
  );
}

export default App;
