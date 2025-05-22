import { useEffect, useState } from "react";
import {
  getProjects,
  addProject,
  deleteProject,
  getStoriesFromFirestore,
  deleteStoryFromFirestore,
  getTasksForStory,
  deleteTaskFromFirestore
} from "./dataService";

function ProjectAdminPanel({ onProjectListChange }) {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const data = await getProjects();
    setProjects(data);
    if (onProjectListChange) onProjectListChange(data);
  };

  const handleAddProject = async () => {
    if (!newProjectName.trim()) return;
    await addProject({ name: newProjectName.trim() });
    setNewProjectName("");
    fetchProjects();
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Czy na pewno chcesz usunąć ten projekt wraz ze wszystkimi danymi?")) return;

    const stories = await getStoriesFromFirestore(projectId);
    for (const story of stories) {
      const tasks = await getTasksForStory(projectId, story.id);
      for (const task of tasks) {
        await deleteTaskFromFirestore(task.id);
      }
      await deleteStoryFromFirestore(story.id);
    }

    await deleteProject(projectId);

    // Odświeżenie całej strony po usunięciu projektu
    window.location.reload();
  };

  return (
    <div className="mb-8 p-4 border rounded bg-gray-100 dark:bg-gray-800 dark:text-white space-y-4">
      <h3 className="text-lg font-semibold">Zarządzanie projektami (tylko admin)</h3>

      <div className="flex gap-2">
        <input
          type="text"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          placeholder="Nazwa nowego projektu"
          className="p-2 border rounded w-full dark:bg-gray-700 dark:text-white"
        />
        <button
          onClick={handleAddProject}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Dodaj
        </button>
      </div>

      <ul className="space-y-2">
        {projects.map((project) => (
          <li key={project.id} className="flex justify-between items-center bg-white dark:bg-gray-700 p-2 rounded">
            <span>{project.name}</span>
            <button
              onClick={() => handleDeleteProject(project.id)}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Usuń
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProjectAdminPanel;
