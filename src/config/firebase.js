// Firebase core
import { initializeApp } from "firebase/app";

// Auth
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";

// Firestore
import { 
  getFirestore, 
  doc, 
  setDoc 
} from "firebase/firestore";



const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase instances
export const auth = getAuth(app);
export const db = getFirestore(app);
export { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut };

// ✅ SIGNUP
export const signup = async (username, email, password) => {
  try {
    console.log("📝 Starting signup for:", username);
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    console.log("✅ User created:", user.uid);

    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email,
      name: "",
      avatar: "",
      bio: "Hey there! I am using Chat App.",
      lastSeen: Date.now(),
    });
    console.log("✅ User document saved");

    await setDoc(doc(db, "chats", user.uid), {
      chatsData: []
    });
    console.log("✅ Chats document created");
  } catch (err) {
    console.error("❌ Signup error:", err);
  }
};

// ✅ LOGIN
export const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    console.error(err);
  }
};

// ✅ LOGOUT
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (err) {
    console.error(err);
  }
};