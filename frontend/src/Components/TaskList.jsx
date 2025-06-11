import TaskItem from './TaskItem';

export default function TaskList({ tasks, setTasks, fetchTasks }) {
  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          setTasks={setTasks}
          fetchTasks={fetchTasks}  // ✅ PASS fetchTasks here!
        />
      ))}
    </div>
  );
}
