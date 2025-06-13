import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TaskItem({ task, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description);

  const handleToggleComplete = async () => {
    try {
      await onUpdate(task.id, {
        ...task,
        completed: !task.completed,
      });
    } catch (error) {
      console.error("Error toggling task completion:", error);
    }
  };

  const handleDeleteTask = async () => {
    try {
      await onDelete(task.id);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleSaveEdit = async () => {
    if (!editedTitle.trim()) {
      alert("Task title cannot be empty.");
      return;
    }

    try {
      await onUpdate(task.id, {
        ...task,
        title: editedTitle,
        description: editedDescription,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="card mb-3 shadow-sm"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <div className="card-body">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <input
                className="input mb-2"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="Task title"
              />
              <textarea
                className="input mb-2"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                rows="2"
                placeholder="Task description"
              />
              <div className="d-flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveEdit}
                  className="btn btn-primary"
                >
                  Save
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <motion.h5
                className={`card-title mb-1 ${
                  task.completed ? "text-decoration-line-through text-muted" : ""
                }`}
                layout
              >
                {task.title}
              </motion.h5>
              <motion.p
                className="card-text text-muted small mb-3"
                layout
              >
                {task.description}
              </motion.p>

              <div className="d-flex flex-wrap gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="btn btn-warning"
                >
                  Edit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleToggleComplete}
                  className={`btn ${
                    task.completed ? "btn-secondary" : "btn-success"
                  }`}
                >
                  {task.completed ? "Mark Incomplete" : "Mark Complete"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDeleteTask}
                  className="btn btn-danger"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
