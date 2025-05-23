import { auth, db, googleProvider } from "./firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const USER_KEY = "loggedUser";

const AuthManager = {
  async loginWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    let userData;
    if (userSnap.exists()) {
      userData = userSnap.data();
    } else {
      userData = {
        id: user.uid,
        email: user.email,
        name: user.displayName,
        role: "guest", // domyślnie
      };
      await setDoc(userRef, userData);
    }

    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    return userData;
  },

  logout() {
    signOut(auth);
    localStorage.removeItem(USER_KEY);
  },

  getUser() {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },
};

export default AuthManager;
