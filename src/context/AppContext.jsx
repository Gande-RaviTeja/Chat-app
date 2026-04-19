import { createContext, useEffect, useState, useRef, useCallback } from "react";
import {
  doc,
  updateDoc,
  getDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../config/firebase.js";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [chatData, setChatData] = useState([]);
  const [messagesId, setMessagesId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatUser, setChatUser] = useState(null);

  const intervalRef = useRef(null);

  // ✅ useCallback prevents new function reference on every render
  // This stops App.jsx useEffect from firing repeatedly
  const loadUserData = useCallback(async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return;

      const data = userSnap.data();
      const finalUser = { ...data, id: uid };

      setUserData(finalUser);

      if (finalUser?.avatar && finalUser?.username) {
        navigate("/chat");
      } else {
        navigate("/profile");
      }

      await updateDoc(userRef, { lastSeen: Date.now() });

      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(async () => {
        if (auth.currentUser) {
          await updateDoc(userRef, { lastSeen: Date.now() });
        }
      }, 60000);

    } catch (error) {
      console.error("Load user error:", error);
    }
  }, []); // ✅ empty deps — only created once

  // ✅ LOAD CHATS (REALTIME)
  useEffect(() => {
    if (!userData?.id) return;

    const chatRef = doc(db, "chats", userData.id);

    const unSub = onSnapshot(chatRef, async (res) => {
      try {
        if (!res.exists()) {
          await setDoc(chatRef, { chatsData: [] });
          return;
        }

        const chatItems = res.data()?.chatsData || [];

        const tempData = await Promise.all(
          chatItems.map(async (item) => {
            const userRef = doc(db, "users", item.rId);
            const userSnap = await getDoc(userRef);
            return {
              ...item,
              userData: userSnap.exists() ? userSnap.data() : {},
            };
          })
        );

        setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt));
      } catch (error) {
        console.error("Chat fetch error:", error);
      }
    });

    return () => unSub();
  }, [userData?.id]); // ✅ only re-run if the user ID actually changes

  // ✅ LOAD MESSAGES (REALTIME)
  useEffect(() => {
    if (!messagesId) return;

    const msgRef = doc(db, "messages", messagesId);

    const unSub = onSnapshot(msgRef, (res) => {
      setMessages(res.data()?.messages || []);
    });

    return () => unSub();
  }, [messagesId]);

  // ✅ CLEANUP interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const value = {
    userData,
    setUserData,
    chatData,
    setChatData,
    loadUserData,
    messages,
    setMessages,
    messagesId,
    setMessagesId,
    chatUser,
    setChatUser,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;