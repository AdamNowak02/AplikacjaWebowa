import { useState, useEffect } from "react";
import AuthManager from "./authManager";
import ProjectManager from "./ProjectManager";
import TaskManager from "./TaskManager";
import ProjectAdminPanel from "./ProjectAdminPanel";
import {
  getProjects,
  getStoriesFromFirestore,
  addStoryToFirestore,
  updateStoryInFirestore,
  deleteStoryFromFirestore,
  getTasksForStory,
  deleteTaskFromFirestore,
  getAllUsersFromFirestore
} from "./dataService";

function App() {
  const [user, setUser] = useState(AuthManager.getUser());
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(ProjectManager.getActiveProject());
  const [stories, setStories] = useState([]);
  const [editStory, setEditStory] = useState(null);
  const [showTasks, setShowTasks] = useState(null);
  const [showAddStoryForm, setShowAddStoryForm] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [allUsers, setAllUsers] = useState([]);

  const [newStory, setNewStory] = useState({
    name: "",
    description: "",
    priority: "średni",
    state: "do_zrobienia",
    owner: user ? user.id : null,
    createdAt: "",
    project: activeProject,
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    const fetchProjects = async () => {
      const data = await getProjects();
      setProjects(data);
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const loadStories = async () => {
      if (activeProject) {
        const fetchedStories = await getStoriesFromFirestore(activeProject);
        setStories(fetchedStories);
      }
    };
    loadStories();
  }, [activeProject]);

  useEffect(() => {
    const fetchUsers = async () => {
      const users = await getAllUsersFromFirestore();
      setAllUsers(users);
    };
    if (user) fetchUsers();
  }, [user]);

  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    ProjectManager.setActiveProject(projectId);
    setActiveProject(projectId);
  };

  const saveStory = async () => {
    if (!activeProject) return;

    if (editStory) {
      const updated = {
        ...newStory,
        project: activeProject,
      };
      await updateStoryInFirestore(editStory.id, updated);
      setStories((prev) =>
        prev.map((story) => (story.id === editStory.id ? { id: story.id, ...updated } : story))
      );
    } else {
      const newStoryData = {
        ...newStory,
        createdAt: new Date().toISOString(),
        owner: user.id,
        project: activeProject,
      };
      const saved = await addStoryToFirestore(newStoryData);
      setStories([...stories, saved]);
    }

    setNewStory({
      name: "",
      description: "",
      priority: "średni",
      state: "do_zrobienia",
      owner: user.id,
      createdAt: "",
      project: activeProject,
    });
    setEditStory(null);
    setShowAddStoryForm(false);
  };

  const editStoryHandler = (story) => {
    setEditStory(story);
    setNewStory({ ...story });
    setShowAddStoryForm(true);
  };

  const deleteStory = async (id) => {
    const relatedTasks = await getTasksForStory(activeProject, id);
    for (const task of relatedTasks) {
      await deleteTaskFromFirestore(task.id);
    }

    await deleteStoryFromFirestore(id);
    setStories(stories.filter((story) => story.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 bg-white dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 transition-colors">
      {!user ? (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Zaloguj się przez Google:</h2>
          <button
            onClick={async () => {
              const loggedUser = await AuthManager.loginWithGoogle();
              setUser(loggedUser);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Zaloguj się
          </button>
        </div>
      ) : (
        <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
          <div className="text-gray-700 dark:text-gray-300">
            Zalogowany jako: <span className="font-semibold">{user.name}</span> ({user.role})
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700 dark:text-gray-300">Tryb ciemny</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 dark:peer-focus:ring-blue-400 rounded-full peer dark:bg-gray-600 peer-checked:bg-blue-600 transition-colors"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-full"></div>
              </label>
            </div>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={() => {
                AuthManager.logout();
                setUser(null);
              }}
            >
              Wyloguj
            </button>
          </div>
        </div>
      )}

      {user?.role === "admin" && <ProjectAdminPanel onProjectListChange={setProjects} />}

      {user && (
        <>
          <div className="mb-6">
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Wybierz projekt:</label>
            <select
              value={activeProject || ""}
              onChange={handleProjectChange}
              className="p-2 border rounded w-full dark:bg-gray-800 dark:text-white dark:border-gray-600"
            >
              <option value="">-- Wybierz projekt --</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.name}
                </option>
              ))}
            </select>
          </div>

          {!activeProject && (
            <p className="text-gray-500 dark:text-gray-400">Wybierz projekt, aby zobaczyć historyjki.</p>
          )}

          {activeProject && (
            <>
              <h2 className="text-xl font-bold mb-4">Historyjki dla projektu</h2>

              {user.role !== "guest" && !showAddStoryForm && (
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mb-4"
                  onClick={() => setShowAddStoryForm(true)}
                >
                  Dodaj historyjkę
                </button>
              )}

              {user.role !== "guest" && showAddStoryForm && (
                <div className="space-y-4 mb-8 bg-gray-100 dark:bg-gray-800 p-4 rounded shadow">
                  <input
                    type="text"
                    placeholder="Nazwa historyjki"
                    value={newStory.name}
                    onChange={(e) => setNewStory({ ...newStory, name: e.target.value })}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                  />
                  <textarea
                    placeholder="Opis"
                    value={newStory.description}
                    onChange={(e) => setNewStory({ ...newStory, description: e.target.value })}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                  />
                  <select
                    value={newStory.priority}
                    onChange={(e) => setNewStory({ ...newStory, priority: e.target.value })}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                  >
                    <option value="niski">Niski</option>
                    <option value="średni">Średni</option>
                    <option value="wysoki">Wysoki</option>
                  </select>
                  <button
                    onClick={saveStory}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    {editStory ? "Zapisz zmiany" : "Dodaj historyjkę"}
                  </button>
                </div>
              )}

              <h3 className="text-lg font-semibold mb-2">Lista historyjek</h3>
              <ul className="space-y-4">
                {stories.map((story) => (
                  <li
                    key={story.id}
                    className="border rounded p-4 bg-white dark:bg-gray-800 shadow flex flex-col gap-2"
                  >
                    <div>
                      <strong>{story.name}</strong> - {story.description} ({story.priority})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {user.role !== "guest" && (
                        <>
                          <button
                            className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                            onClick={() => editStoryHandler(story)}
                          >
                            Edytuj
                          </button>
                          <button
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            onClick={() => deleteStory(story.id)}
                          >
                            Usuń
                          </button>
                        </>
                      )}
                      <button
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        onClick={() => setShowTasks(showTasks === story.id ? null : story.id)}
                      >
                        Zadania
                      </button>
                    </div>
                    {showTasks === story.id && (
                      <div className="mt-2">
                        <TaskManager storyId={story.id} allUsers={allUsers} user={user} />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;
