import { useState } from "react";
import api from "../api";
import {
  TrashIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function TaskItem({ task, setTasks, fetchTasks }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description);

  const handleToggleComplete = async () => {
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === task.id ? { ...t, completed: !task.completed } : t
      )
    );

    await api.put(`/tasks/${task.id}`, {
      title: task.title,
      description: task.description,
      completed: !task.completed,
    });

    fetchTasks();
  };

  const handleDeleteTask = async () => {
    setTasks((prevTasks) => prevTasks.filter((t) => t.id !== task.id));
    await api.delete(`/tasks/${task.id}`);
    fetchTasks();
  };

  const handleSaveEdit = async () => {
    if (!editedTitle.trim()) {
      alert("Task title cannot be empty.");
      return;
    }

    // Optimistically update UI
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === task.id
          ? { ...t, title: editedTitle, description: editedDescription }
          : t
      )
    );

    setIsEditing(false); // Hide input immediately

    // API call runs in background
    await api.put(`/tasks/${task.id}`, {
      title: editedTitle,
      description: editedDescription,
      completed: task.completed,
    });

    fetchTasks(); // Final sync with DB (optional but recommended)
  };

  return (
    <div className="card mb-3">
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
            />
            <button onClick={handleSaveEdit} className="btn btn-success me-2">
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <h5
              className={`card-title ${
                task.completed ? "text-decoration-line-through text-muted" : ""
              }`}
            >
              {task.title}
            </h5>
            <p className="card-text">{task.description}</p>
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-warning me-2"
            >
              Edit
            </button>
            <button
              onClick={handleToggleComplete}
              className={`btn ${
                task.completed ? "btn-secondary" : "btn-success"
              } me-2`}
            >
              {task.completed ? "Mark Incomplete" : "Mark Complete"}
            </button>
            <button onClick={handleDeleteTask} className="btn btn-danger">
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
