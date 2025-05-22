class UserManager {
  static STORAGE_KEY = 'loggedUser';
  static USERS_KEY = 'allUsers';

  static getUser() {
      const userData = localStorage.getItem(this.STORAGE_KEY);
      return userData ? JSON.parse(userData) : null;
  }

  static setUser(user) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  static getAllUsers() {
      const usersData = localStorage.getItem(this.USERS_KEY);
      return usersData ? JSON.parse(usersData) : [];
  }

  static setAllUsers(users) {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  static initializeMockUsers() {
      if (!this.getAllUsers().length) {
          const mockUsers = [
              { id: 1, name: "Admin User", email: "admin@example.com", role: "admin" },
              { id: 2, name: "DevOps User", email: "devops@example.com", role: "devops" },
              { id: 3, name: "Developer User", email: "developer@example.com", role: "developer" }
          ];
          this.setAllUsers(mockUsers);
      }

      if (!this.getUser()) {
          // Logujemy domyślnie Admina, jeśli nikogo nie ma
          const adminUser = this.getAllUsers().find(user => user.role === "admin");
          this.setUser(adminUser);
      }
  }

  static loginUser(email) {
      const users = this.getAllUsers();
      const user = users.find(user => user.email === email);

      if (user) {
          this.setUser(user);
          return true;
      }

      return false;
  }

  static logoutUser() {
      localStorage.removeItem(this.STORAGE_KEY);
  }
}

// Inicjalizacja użytkowników, jeśli ich nie ma
UserManager.initializeMockUsers();

export default UserManager;
