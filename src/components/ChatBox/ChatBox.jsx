import React, { useState, useContext, useEffect, useRef } from 'react'
import "./ChatBox.css"
import assets from "../../assets/assets.js";
import { AppContext } from '../../context/AppContext.jsx';
import { doc, updateDoc, arrayUnion, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase.js';
import { toast } from 'react-toastify';

const getAvatar = (user) =>
  user?.avatar && user.avatar !== ""
    ? user.avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "U")}&background=random&color=fff`;

// ✅ Fixed: uses calendar date comparison not hour difference
const formatLastSeen = (lastSeen) => {
  if (!lastSeen) return "Offline";

  const now = Date.now();
  const diff = now - lastSeen;
  const minutes = Math.floor(diff / 60000);

  if (diff < 2 * 60 * 1000) return "online";
  if (minutes < 60) return `last seen ${minutes} min ago`;

  const lastSeenDate = new Date(lastSeen);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const time = lastSeenDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  if (isSameDay(lastSeenDate, today)) return `last seen today at ${time}`;
  if (isSameDay(lastSeenDate, yesterday)) return `last seen yesterday at ${time}`;

  return `last seen ${lastSeenDate.toLocaleDateString([], {
    day: "numeric",
    month: "short",
  })}`;
};

const ChatBox = () => {
  const { userData, messagesId, chatUser, messages } = useContext(AppContext);
  const [input, setInput] = useState("");
  const [chatUserData, setChatUserData] = useState(null);
  const chatMsgRef = useRef(null);

  // ✅ Auto-scroll to bottom on new messages
  useEffect(() => {
    if (chatMsgRef.current) {
      chatMsgRef.current.scrollTop = chatMsgRef.current.scrollHeight;
    }
  }, [messages]);

  // ✅ Realtime listener on chat user's doc for lastSeen
  useEffect(() => {
    if (!chatUser?.rId) {
      setChatUserData(null);
      return;
    }

    const userRef = doc(db, "users", chatUser.rId);
    const unSub = onSnapshot(userRef, (snap) => {
      if (snap.exists()) setChatUserData(snap.data());
    });

    return () => unSub();
  }, [chatUser?.rId]);

  // ✅ Re-render every 30s so "X min ago" stays accurate
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = async () => {
    try {
      if (!input.trim() || !messagesId) return;

      await updateDoc(doc(db, "messages", messagesId), {
        messages: arrayUnion({
          text: input,
          sId: userData.id,
          createdAt: Date.now(),
        }),
      });

      const userIds = [chatUser.rId, userData.id];
      for (let id of userIds) {
        const userChatsRef = doc(db, "chats", id);
        const snap = await getDoc(userChatsRef);
        if (snap.exists()) {
          const data = snap.data();
          const index = data.chatsData.findIndex((c) => c.messageId === messagesId);
          if (index >= 0) {
            data.chatsData[index].lastMessage = input.slice(0, 30);
            data.chatsData[index].updatedAt = Date.now();
            if (data.chatsData[index].rId === userData.id) {
              data.chatsData[index].messageSeen = false;
            }
            await updateDoc(userChatsRef, { chatsData: data.chatsData });
          }
        }
      }

      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.message);
    }
  };

  if (!chatUser) {
    return (
      <div className='chat-welcome'>
        <img src={assets.logo_icon} alt="" />
        <p>Chat anytime, anywhere</p>
      </div>
    );
  }

  const statusText = formatLastSeen(chatUserData?.lastSeen);
  const isOnline = statusText === "online";
  const sortedMessages = [...messages].sort((a, b) => a.createdAt - b.createdAt);

  return (
    <div className='chat-box'>

      {/* HEADER */}
      <div className="chat-user">
        <div className="chat-user-avatar-wrap">
          <img
            src={getAvatar(chatUserData || chatUser.userData)}
            alt={chatUser.userData?.username}
            className="chat-user-avatar"
          />
          {isOnline && <span className="online-ring" />}
        </div>

        <div className="chat-user-info">
          <p className="chat-user-name">{chatUser.userData?.username}</p>
          <span className={`chat-user-status ${isOnline ? "status-online" : "status-offline"}`}>
            {isOnline ? "● online" : statusText}
          </span>
        </div>

        <img src={assets.help_icon} alt="" className='help-icon' />
      </div>

      {/* MESSAGES */}
      <div className="chat-msg" ref={chatMsgRef}>
        {sortedMessages.map((msg, i) => {
          const isMe = msg.sId === userData.id;
          const nextMsg = sortedMessages[i + 1];
          const isLastInGroup = !nextMsg || nextMsg.sId !== msg.sId;

          return (
            <div
              key={i}
              className={`msg-row ${isMe ? "msg-row-me" : "msg-row-them"}`}
              style={{ marginBottom: isLastInGroup ? "10px" : "2px" }}
            >
              {isLastInGroup ? (
                <img
                  src={isMe ? getAvatar(userData) : getAvatar(chatUserData || chatUser.userData)}
                  alt=""
                  className="msg-avatar"
                />
              ) : (
                <div className="msg-avatar-spacer" />
              )}

              <div className={`msg-bubble-wrap ${isMe ? "msg-bubble-wrap-me" : "msg-bubble-wrap-them"}`}>
                <p className={`msg ${isMe ? "msg-me" : "msg-them"}`}>
                  {msg.text}
                </p>
                {isLastInGroup && (
                  <span className="msg-time">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* INPUT */}
      <div className="chat-input">
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type='text'
          placeholder='Send a message'
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <img
          onClick={sendMessage}
          src={assets.send_button}
          alt=''
          style={{ cursor: "pointer" }}
        />
      </div>

    </div>
  );
};

export default ChatBox;