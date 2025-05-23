class ProjectManager {
  static getActiveProject() {
    return localStorage.getItem("activeProject") || null;
  }

  static setActiveProject(projectId) {
    localStorage.setItem("activeProject", projectId);
  }
}

export default ProjectManager;
