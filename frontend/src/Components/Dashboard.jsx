import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";
import StatsCard from "./StatsCard";

export default function Dashboard({ tasks = [], onAddTask, onUpdateTask, onDeleteTask, onLogout, error: propError }) {
  const [error, setError] = useState(null);

  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = tasks.length - completedTasks;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-vh-100"
    >
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h3 mb-0"
          >
            Task Dashboard
          </motion.h1>
          <motion.button
            onClick={onLogout}
            className="btn btn-outline-danger"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Logout
          </motion.button>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <StatsCard
            total={tasks.length}
            completed={completedTasks}
            pending={pendingTasks}
          />
        </motion.div>

        <div className="row mt-4 g-4">
          <motion.div
            className="col-md-8"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="card shadow">
              <div className="card-body">
                <h2 className="h4 mb-4">Add New Task</h2>
                <TaskForm onAdd={onAddTask} />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="col-md-4"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="card shadow">
              <div className="card-body">
                <h2 className="h4 mb-3">Your Tasks</h2>

                <AnimatePresence mode="wait">
                  {(error || propError) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="alert alert-danger"
                    >
                      {error || propError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  style={{ maxHeight: "500px", overflowY: "auto" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <TaskList
                    tasks={tasks}
                    onUpdate={onUpdateTask}
                    onDelete={onDeleteTask}
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.footer
        className="text-center py-4 text-muted small"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        © {new Date().getFullYear()} QuickTask - Manage your work smartly
      </motion.footer>
    </motion.div>
  );
} 