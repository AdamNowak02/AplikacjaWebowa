import { useState, useEffect } from "react";
import ProjectManager from "./ProjectManager";
import {
  getTasksForStory,
  addTaskToFirestore,
  updateTaskInFirestore,
  deleteTaskFromFirestore
} from "./dataService";

const TASK_STATES = {
  todo: "Do zrobienia",
  doing: "W trakcie",
  done: "Zrobione"
};

function TaskManager({ storyId, allUsers, user }) {
  const [tasks, setTasks] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [detailsTaskId, setDetailsTaskId] = useState(null);

  const activeProject = ProjectManager.getActiveProject();

  // Domyślny obiekt nowego zadania
  const defaultTask = {
    name: "",
    description: "",
    priority: "średni",
    estimatedTime: "",
    state: "todo",
    createdAt: new Date().toISOString(),
    startedAt: null,
    finishedAt: null,
    assignedUser: null,
    storyId,
    projectName: activeProject,
  };

  const [newTask, setNewTask] = useState(defaultTask);

  
  const [editTask, setEditTask] = useState(null);

  useEffect(() => {
    const loadTasks = async () => {
      const fetched = await getTasksForStory(activeProject, storyId);
      setTasks(fetched);
    };
    loadTasks();
  }, [storyId, activeProject]);

  // Zapis zadania 
  const handleSaveTask = async () => {
    let updatedTasks = [...tasks];

    if (editTask) {
      await updateTaskInFirestore(editTask.id, newTask);
      updatedTasks = updatedTasks.map(t => (t.id === editTask.id ? { ...newTask, id: editTask.id } : t));
    } else {
      const saved = await addTaskToFirestore({ ...newTask, createdAt: new Date().toISOString() });
      updatedTasks.push(saved);
    }

    setTasks(updatedTasks);
    setNewTask(defaultTask);
    setEditTask(null);
    setShowForm(false);
  };

  const handleEditTask = (task) => {
    setEditTask(task);
    setNewTask(task);
    setShowForm(true);
  };

  // Usunięcie zadania
  const handleDeleteTask = async (taskId) => {
    await deleteTaskFromFirestore(taskId);
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const getUserName = (userId) => {
    const u = allUsers.find(u => u.id === userId);
    return u?.name || u?.email || "Nieprzypisane";
  };

  return (
    <div className="p-4 border rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-600 space-y-6">
      <h4 className="text-xl font-semibold dark:text-white">Zadania dla historyjki</h4>

      {/* Przycisk pokazujący formularz dodawania */}
      {user.role !== "guest" && !showForm && (
        <button
          onClick={() => {
            setShowForm(true);
            setNewTask(defaultTask);
            setEditTask(null);
          }}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Dodaj nowe zadanie
        </button>
      )}

      {/* Formularz dodawania / edycji zadania */}
      {user.role !== "guest" && showForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nazwa zadania"
            value={newTask.name}
            onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
            className="p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          <input
            type="text"
            placeholder="Przewidywany czas (w godzinach)"
            value={newTask.estimatedTime}
            onChange={(e) => setNewTask({ ...newTask, estimatedTime: e.target.value })}
            className="p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          <textarea
            placeholder="Opis zadania"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            className="p-2 border rounded col-span-2 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          <select
            value={newTask.priority}
            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
            className="p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            <option value="niski">Niski</option>
            <option value="średni">Średni</option>
            <option value="wysoki">Wysoki</option>
          </select>
          <select
            value={newTask.state}
            onChange={(e) => {
              const newState = e.target.value;
              setNewTask({
                ...newTask,
                state: newState,
                startedAt: newState === "doing" ? new Date().toISOString() : newTask.startedAt,
                finishedAt: newState === "done" ? new Date().toISOString() : null,
              });
            }}
            className="p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            <option value="todo">Do zrobienia</option>
            <option value="doing">W trakcie</option>
            <option value="done">Zrobione</option>
          </select>
          <select
            value={newTask.assignedUser || ""}
            onChange={(e) => setNewTask({ ...newTask, assignedUser: e.target.value || null })}
            className="p-2 border rounded col-span-2 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            <option value="">-- Wybierz użytkownika --</option>
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name || u.email}
              </option>
            ))}
          </select>

          {/* Przycisk zapisu i anulowania */}
          <div className="col-span-2 flex gap-2">
            <button
              onClick={handleSaveTask}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {editTask ? "Zapisz zmiany" : "Dodaj zadanie"}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditTask(null);
                setNewTask(defaultTask);
              }}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              Anuluj
            </button>
          </div>
        </div>
      )}

      {/* Lista zadań */}
      <ul className="space-y-4">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="p-4 bg-white dark:bg-gray-700 border rounded shadow flex flex-col gap-2 dark:border-gray-600"
          >
            <div className="flex justify-between items-start">
              <div>
                <h5 className="text-lg font-semibold dark:text-white">{task.name}</h5>
                <p className="text-sm text-gray-600 dark:text-gray-300">{task.description}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Priorytet: <span className="font-medium">{task.priority}</span> | Stan:{" "}
                  <span className="font-medium">{TASK_STATES[task.state]}</span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Przydzielono: {getUserName(task.assignedUser)}
                </p>
              </div>

              {/* Przyciski akcji: edytuj, usuń, szczegóły */}
              <div className="flex gap-2">
                {user.role !== "guest" && (
                  <>
                    <button
                      className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                      onClick={() => handleEditTask(task)}
                    >
                      Edytuj
                    </button>
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      Usuń
                    </button>
                  </>
                )}
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => setDetailsTaskId(task.id === detailsTaskId ? null : task.id)}
                >
                  Szczegóły
                </button>
              </div>
            </div>

            {/* Szczegóły zadania */}
            {detailsTaskId === task.id && (
              <div className="mt-2 text-sm text-gray-700 dark:text-gray-200 space-y-1 border-t pt-2 dark:border-gray-600">
                <p><strong>Opis:</strong> {task.description}</p>
                <p><strong>Czas:</strong> {task.estimatedTime} godz.</p>
                <p><strong>Utworzono:</strong> {new Date(task.createdAt).toLocaleString()}</p>
                {task.startedAt && <p><strong>Rozpoczęto:</strong> {new Date(task.startedAt).toLocaleString()}</p>}
                {task.finishedAt && <p><strong>Zakończono:</strong> {new Date(task.finishedAt).toLocaleString()}</p>}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskManager;
