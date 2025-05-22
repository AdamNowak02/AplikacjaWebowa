class StoryManager {
    static getStories() {
      const stories = JSON.parse(localStorage.getItem("stories")) || [];
      const activeProject = localStorage.getItem("activeProject");
      return stories.filter(story => story.project === activeProject);
    }
  
    static addStory(story) {
      const stories = JSON.parse(localStorage.getItem("stories")) || [];
      const newStory = { id: Date.now(), ...story };
      stories.push(newStory);
      localStorage.setItem("stories", JSON.stringify(stories));
      return newStory;
    }
  
    static updateStory(updatedStory) {
      let stories = JSON.parse(localStorage.getItem("stories")) || [];
      stories = stories.map(story => (story.id === updatedStory.id ? updatedStory : story));
      localStorage.setItem("stories", JSON.stringify(stories));
    }
  
    static deleteStory(storyId) {
      let stories = JSON.parse(localStorage.getItem("stories")) || [];
      stories = stories.filter(story => story.id !== storyId);
      localStorage.setItem("stories", JSON.stringify(stories));
    }
  }
  
  export default StoryManager;
  