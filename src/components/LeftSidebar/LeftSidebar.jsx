import React, { useContext, useState } from "react";
import "./LeftSidebar.css";
import assets from "../../assets/assets.js";
import { useNavigate } from "react-router-dom";
import {
  arrayUnion,
  collection,
  getDocs,
  serverTimestamp,
  updateDoc,
  doc,
  setDoc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../config/firebase.js";
import { AppContext } from "../../context/AppContext.jsx";
import { toast } from "react-toastify";

const getAvatar = (user) =>
  user?.avatar && user.avatar !== ""
    ? user.avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "U")}&background=random&color=fff`;

const LeftSidebar = () => {
  const navigate = useNavigate();

  const {
    userData,
    chatData,
    setChatUser,
    setMessagesId,
    messagesId,
    logout, // ✅ from context
  } = useContext(AppContext);

  const [search, setSearch] = useState("");
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendEmail, setFriendEmail] = useState("");
  const [foundUser, setFoundUser] = useState(null);
  const [searching, setSearching] = useState(false);

  const handleLogout = async () => {
    try {
      await logout(); // ✅ clears ALL state + navigates
    } catch (error) {
      toast.error(error.message);
    }
  };

  const openModal = () => {
    setShowAddFriend(true);
    setFoundUser(null);
    setFriendEmail("");
  };

  const closeModal = () => {
    setShowAddFriend(false);
    setFoundUser(null);
    setFriendEmail("");
  };

  const searchByEmail = async () => {
    const email = friendEmail.trim().toLowerCase();
    if (!email) return toast.error("Enter an email address");
    if (email === userData.email) return toast.error("That's your own email!");

    setSearching(true);
    setFoundUser(null);

    try {
      const q = query(collection(db, "users"), where("email", "==", email));
      const snap = await getDocs(q);

      if (snap.empty) {
        toast.error("No user found with that email");
      } else {
        setFoundUser(snap.docs[0].data());
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSearching(false);
    }
  };

  const createChat = async (selectedUser) => {
    try {
      const chatsRef = collection(db, "chats");
      const messageRef = collection(db, "messages");
      const newMessageRef = doc(messageRef);

      await setDoc(newMessageRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      const chatObj = {
        messageId: newMessageRef.id,
        lastMessage: "",
        rId: selectedUser.id,
        updatedAt: Date.now(),
        messageSeen: true,
      };

      try {
        await updateDoc(doc(chatsRef, userData.id), { chatsData: arrayUnion(chatObj) });
      } catch (err) {
        if (err.code === "not-found") {
          await setDoc(doc(chatsRef, userData.id), { chatsData: [chatObj] });
        } else throw err;
      }

      const otherChatObj = { ...chatObj, rId: userData.id };
      try {
        await updateDoc(doc(chatsRef, selectedUser.id), { chatsData: arrayUnion(otherChatObj) });
      } catch (err) {
        if (err.code === "not-found") {
          await setDoc(doc(chatsRef, selectedUser.id), { chatsData: [otherChatObj] });
        } else throw err;
      }

      setMessagesId(newMessageRef.id);
      setChatUser({ ...chatObj, userData: selectedUser });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAddFriend = async () => {
    if (!foundUser) return;

    const safeChatData = Array.isArray(chatData) ? chatData : [];
    const alreadyExists = safeChatData.find((c) => c.rId === foundUser.id);

    if (alreadyExists) {
      setMessagesId(alreadyExists.messageId);
      setChatUser({ ...alreadyExists, userData: foundUser });
      toast.info("Already in your chats!");
    } else {
      await createChat(foundUser);
      toast.success(`${foundUser.username} added! `);
    }

    closeModal();
  };

  const handleUserClick = async (user) => {
    const safeChatData = Array.isArray(chatData) ? chatData : [];
    const existingChat = safeChatData.find((c) => c.rId === user.id);

    if (existingChat) {
      setMessagesId(existingChat.messageId);
      setChatUser({ ...existingChat, userData: user });

      if (!existingChat.messageSeen) {
        const chatRef = doc(db, "chats", userData.id);
        const snap = await getDoc(chatRef);
        if (snap.exists()) {
          const data = snap.data();
          const idx = data.chatsData.findIndex((c) => c.messageId === existingChat.messageId);
          if (idx >= 0) {
            data.chatsData[idx].messageSeen = true;
            await updateDoc(chatRef, { chatsData: data.chatsData });
          }
        }
      }
    } else {
      await createChat(user);
    }

    setSearch("");
  };

  const safeChatData = Array.isArray(chatData) ? chatData : [];

  const dedupedChatData = safeChatData.reduce((acc, chat) => {
    const existing = acc.find((c) => c.rId === chat.rId);
    if (!existing) {
      acc.push(chat);
    } else if (chat.updatedAt > existing.updatedAt) {
      return acc.map((c) => (c.rId === chat.rId ? chat : c));
    }
    return acc;
  }, []);

  const isSearching = search.trim().length > 0;
  const filteredChats = isSearching
    ? dedupedChatData.filter((c) =>
        c.userData?.username?.toLowerCase().includes(search.toLowerCase())
      )
    : dedupedChatData;

  return (
    <div className="ls">

      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} alt="" className="logo" />
          <div className="menu">
            <img src={assets.menu_icon} alt="" />
            <div className="sub-menu">
              <p onClick={() => navigate("/profile")}>Edit Profile</p>
              <hr />
              <p onClick={handleLogout}>Logout</p>
            </div>
          </div>
        </div>

        <div className="ls-search">
          <img src={assets.search_icon} alt="" className="search-icon" />
          <input
            type="text"
            placeholder="Search chats..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="add-friend-btn" onClick={openModal}>
          + Add Friend
        </button>
      </div>

      <div className="ls-list">
        {filteredChats.length === 0 ? (
          <p className="ls-empty">
            {isSearching ? "No chats found" : "No chats yet. Add a friend!"}
          </p>
        ) : (
          filteredChats.map((chat, index) => {
            const isActive = chat.messageId === messagesId;
            const hasUnread = !chat.messageSeen && !isActive;

            return (
              <div
                key={index}
                className={`friends ${isActive ? "active" : ""} ${hasUnread ? "unread" : ""}`}
                onClick={() => handleUserClick(chat.userData)}
              >
                <img src={getAvatar(chat.userData)} alt={chat.userData?.username} />
                <div className="chat-info">
                  <p>{chat.userData?.username}</p>
                  <span>{chat.lastMessage || "Say hi 👋"}</span>
                </div>
                {hasUnread && <span className="unread-dot" />}
              </div>
            );
          })
        )}
      </div>

      {showAddFriend && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box">

            <h3>Add a Friend</h3>
            <p className="modal-subtitle">Enter their email address to find and start a chat.</p>

            <div className="modal-email-row">
              <input
                type="email"
                placeholder="friend@email.com"
                value={friendEmail}
                onChange={(e) => { setFriendEmail(e.target.value); setFoundUser(null); }}
                onKeyDown={(e) => e.key === "Enter" && searchByEmail()}
              />
              <button
                className="modal-find-btn"
                onClick={searchByEmail}
                disabled={searching}
              >
                {searching ? "..." : "Find"}
              </button>
            </div>

            {foundUser && (
              <div className="found-user-card">
                <img src={getAvatar(foundUser)} alt={foundUser.username} />
                <div className="found-user-info">
                  <p>{foundUser.username}</p>
                  <p>{foundUser.email}</p>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button className="modal-cancel-btn" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="modal-add-btn"
                onClick={handleAddFriend}
                disabled={!foundUser}
              >
                Add to Chats
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default LeftSidebar;