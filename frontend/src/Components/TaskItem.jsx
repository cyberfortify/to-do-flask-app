import { useState } from "react";
import api from "../api";

export default function TaskItem({ task, setTasks }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description);

  const handleToggleComplete = async () => {
    const updatedTask = {
      ...task,
      completed: !task.completed,
    };

    // Optimistic UI
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === task.id ? updatedTask : t))
    );

    await api.put(`/tasks/${task.id}`, updatedTask);
  };

  const handleDeleteTask = async () => {
    setTasks((prevTasks) => prevTasks.filter((t) => t.id !== task.id));
    await api.delete(`/tasks/${task.id}`);
  };

  const handleSaveEdit = async () => {
    if (!editedTitle.trim()) {
      alert("Task title cannot be empty.");
      return;
    }

    const updatedTask = {
      ...task,
      title: editedTitle,
      description: editedDescription,
    };

    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === task.id ? updatedTask : t))
    );

    setIsEditing(false);
    await api.put(`/tasks/${task.id}`, updatedTask);
  };

  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-body">
        {isEditing ? (
          <>
            <input
              className="form-control mb-2"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
            />
            <textarea
              className="form-control mb-2"
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              rows="2"
            />
            <div className="d-flex gap-2">
              <button onClick={handleSaveEdit} className="btn btn-success btn-sm">
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <h5
              className={`card-title mb-1 ${
                task.completed ? "text-decoration-line-through text-muted" : ""
              }`}
            >
              {task.title}
            </h5>
            <p className="card-text text-muted small mb-3">{task.description}</p>

            <div className="d-flex flex-wrap gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-warning btn-sm"
              >
                Edit
              </button>
              <button
                onClick={handleToggleComplete}
                className={`btn btn-sm ${
                  task.completed ? "btn-secondary" : "btn-success"
                }`}
              >
                {task.completed ? "Mark Incomplete" : "Mark Complete"}
              </button>
              <button
                onClick={handleDeleteTask}
                className="btn btn-danger btn-sm"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
