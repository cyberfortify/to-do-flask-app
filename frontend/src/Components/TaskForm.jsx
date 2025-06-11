import { useState } from "react";
import { PlusCircleIcon } from "@heroicons/react/24/solid";

export default function TaskForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onAdd({ title, description });
    setTitle("");
    setDescription("");
    setLoading(false);
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Task</h2>
      <form onSubmit={handleSubmit} className="d-grid gap-3">
      <div className="mb-3">
        <label htmlFor="taskTitle" className="form-label fw-semibold">
          Task Title <span className="text-danger">*</span>
        </label>
        <input
          id="taskTitle"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="form-control form-control-lg shadow-sm"
          placeholder="e.g., Buy groceries"
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="taskDescription" className="form-label fw-semibold">
          Description <small className="text-muted">(optional)</small>
        </label>
        <textarea
          id="taskDescription"
          rows="3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="form-control shadow-sm"
          placeholder="Add more details about this task"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center gap-2"
      >
        {loading ? (
          <>
            <div className="spinner-border spinner-border-sm" role="status"></div>
            Adding...
          </>
        ) : (
          <>
            <PlusCircleIcon className="me-2" style={{ width: "1.25rem", height: "1.25rem" }} />
            Add Task
          </>
        )}
      </button>
    </form>
    </div>
  );
}
