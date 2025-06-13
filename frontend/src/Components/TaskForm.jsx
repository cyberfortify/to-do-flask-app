import { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircleIcon } from "@heroicons/react/24/solid";

export default function TaskForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!title.trim()) {
        throw new Error("Title is required");
      }

      const taskData = {
        title: title.trim(),
        description: description.trim() || null,
        completed: false
      };

      await onAdd(taskData);
      
      // Only clear form if task was added successfully
      setTitle("");
      setDescription("");
    } catch (err) {
      console.error("Error adding task:", err);
      setError(err.response?.data?.error || err.message || "Failed to add task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="card-body">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h4 mb-4"
        >
          Add New Task
        </motion.h2>
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="alert alert-danger"
          >
            {error}
          </motion.div>
        )}
        
        <form onSubmit={handleSubmit} className="d-grid gap-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label htmlFor="taskTitle" className="form-label fw-semibold">
              Task Title <span className="text-danger">*</span>
            </label>
            <input
              id="taskTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-control"
              placeholder="e.g., Buy groceries"
              required
              disabled={loading}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label htmlFor="taskDescription" className="form-label fw-semibold">
              Description <small className="text-muted">(optional)</small>
            </label>
            <textarea
              id="taskDescription"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-control"
              placeholder="Add more details about this task"
              disabled={loading}
            />
          </motion.div>

          <motion.button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="d-flex align-items-center justify-content-center gap-2"
              >
                <div className="spinner-border spinner-border-sm" role="status" />
                Adding...
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="d-flex align-items-center justify-content-center gap-2"
              >
                <PlusCircleIcon style={{ width: "1.25rem", height: "1.25rem" }} />
                Add Task
              </motion.div>
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
