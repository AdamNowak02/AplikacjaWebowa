import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  addDoc
} from "firebase/firestore";

// === PROJECTS ===

export const getProjects = async () => {
  const snapshot = await getDocs(collection(db, "projects"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const addProject = async (project) => {
  const docRef = await addDoc(collection(db, "projects"), project);
  return { id: docRef.id, ...project };
};

export const deleteProject = async (projectId) => {
  await deleteDoc(doc(db, "projects", projectId));
};

// === STORIES ===

export const getStoriesFromFirestore = async (projectId) => {
  const storiesRef = collection(db, "stories");
  const q = query(storiesRef, where("project", "==", projectId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addStoryToFirestore = async (story) => {
  const newRef = doc(collection(db, "stories"));
  await setDoc(newRef, story);
  return { id: newRef.id, ...story };
};

export const updateStoryInFirestore = async (storyId, storyData) => {
  await updateDoc(doc(db, "stories", storyId), storyData);
};

export const deleteStoryFromFirestore = async (storyId) => {
  await deleteDoc(doc(db, "stories", storyId));
};

// === TASKS ===

export const getTasksForStory = async (projectId, storyId) => {
  const tasksRef = collection(db, "tasks");
  const q = query(
    tasksRef,
    where("projectName", "==", projectId),
    where("storyId", "==", storyId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addTaskToFirestore = async (task) => {
  const newRef = doc(collection(db, "tasks"));
  await setDoc(newRef, task);
  return { id: newRef.id, ...task };
};

export const updateTaskInFirestore = async (taskId, task) => {
  await updateDoc(doc(db, "tasks", taskId), task);
};

export const deleteTaskFromFirestore = async (taskId) => {
  await deleteDoc(doc(db, "tasks", taskId));
};

// === USERS ===

export const getAllUsersFromFirestore = async () => {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
