// // import React, { useState, useContext, useEffect, useRef } from 'react'
// // import "./ChatBox.css"
// // import assets from "../../assets/assets.js";
// // import { AppContext } from '../../context/AppContext.jsx';
// // import { doc, updateDoc, arrayUnion, getDoc, onSnapshot } from 'firebase/firestore';
// // import { db } from '../../config/firebase.js';
// // import { toast } from 'react-toastify';

// // const getAvatar = (user) =>
// //   user?.avatar && user.avatar !== ""
// //     ? user.avatar
// //     : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "U")}&background=random&color=fff`;

// // const formatLastSeen = (lastSeen) => {
// //   if (!lastSeen) return "Offline";
// //   const now = Date.now();
// //   const diff = now - lastSeen;
// //   const minutes = Math.floor(diff / 60000);
// //   if (diff < 2 * 60 * 1000) return "online";
// //   if (minutes < 60) return `last seen ${minutes} min ago`;
// //   const lastSeenDate = new Date(lastSeen);
// //   const today = new Date();
// //   const yesterday = new Date();
// //   yesterday.setDate(today.getDate() - 1);
// //   const time = lastSeenDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
// //   const isSameDay = (d1, d2) =>
// //     d1.getFullYear() === d2.getFullYear() &&
// //     d1.getMonth() === d2.getMonth() &&
// //     d1.getDate() === d2.getDate();
// //   if (isSameDay(lastSeenDate, today)) return `last seen today at ${time}`;
// //   if (isSameDay(lastSeenDate, yesterday)) return `last seen yesterday at ${time}`;
// //   return `last seen ${lastSeenDate.toLocaleDateString([], { day: "numeric", month: "short" })}`;
// // };

// // const ChatBox = () => {
// //   const { userData, messagesId, chatUser, messages } = useContext(AppContext);
// //   const [input, setInput] = useState("");
// //   const [chatUserData, setChatUserData] = useState(null);
// //   const chatMsgRef = useRef(null);

// //   // ── DELETE STATE ──
// //   const [deleteModal, setDeleteModal] = useState(null); // { msg, index }
// //   const [deleteForBoth, setDeleteForBoth] = useState(false);
// //   const [hoveredIndex, setHoveredIndex] = useState(null);
// //   const [contextMenu, setContextMenu] = useState(null); // { x, y, msg, index }

// //   useEffect(() => {
// //     if (chatMsgRef.current) {
// //       chatMsgRef.current.scrollTop = chatMsgRef.current.scrollHeight;
// //     }
// //   }, [messages]);

// //   useEffect(() => {
// //     if (!chatUser?.rId) { setChatUserData(null); return; }
// //     const userRef = doc(db, "users", chatUser.rId);
// //     const unSub = onSnapshot(userRef, (snap) => {
// //       if (snap.exists()) setChatUserData(snap.data());
// //     });
// //     return () => unSub();
// //   }, [chatUser?.rId]);

// //   const [, setTick] = useState(0);
// //   useEffect(() => {
// //     const interval = setInterval(() => setTick((t) => t + 1), 30000);
// //     return () => clearInterval(interval);
// //   }, []);

// //   // Close context menu on outside click
// //   useEffect(() => {
// //     const handleClick = () => setContextMenu(null);
// //     window.addEventListener("click", handleClick);
// //     return () => window.removeEventListener("click", handleClick);
// //   }, []);

// //   const sendMessage = async () => {
// //     try {
// //       if (!input.trim() || !messagesId) return;
// //       await updateDoc(doc(db, "messages", messagesId), {
// //         messages: arrayUnion({
// //           text: input,
// //           sId: userData.id,
// //           createdAt: Date.now(),
// //         }),
// //       });
// //       const userIds = [chatUser.rId, userData.id];
// //       for (let id of userIds) {
// //         const userChatsRef = doc(db, "chats", id);
// //         const snap = await getDoc(userChatsRef);
// //         if (snap.exists()) {
// //           const data = snap.data();
// //           const index = data.chatsData.findIndex((c) => c.messageId === messagesId);
// //           if (index >= 0) {
// //             data.chatsData[index].lastMessage = input.slice(0, 30);
// //             data.chatsData[index].updatedAt = Date.now();
// //             if (data.chatsData[index].rId === userData.id) {
// //               data.chatsData[index].messageSeen = false;
// //             }
// //             await updateDoc(userChatsRef, { chatsData: data.chatsData });
// //           }
// //         }
// //       }
// //       setInput("");
// //     } catch (error) {
// //       toast.error(error.message);
// //     }
// //   };

// //   // ── DELETE HANDLER ──
// //   const handleDeleteConfirm = async () => {
// //     if (!deleteModal || !messagesId) return;
// //     const { msg } = deleteModal;
// //     const isMe = msg.sId === userData.id;

// //     try {
// //       const msgRef = doc(db, "messages", messagesId);
// //       const snap = await getDoc(msgRef);
// //       if (!snap.exists()) return;

// //       let allMessages = snap.data().messages || [];

// //       if (deleteForBoth && isMe) {
// //         // Delete for everyone — remove the message entirely
// //         allMessages = allMessages.filter((m) => m.createdAt !== msg.createdAt);
// //       } else {
// //         // Delete only for me — mark as deleted for this user
// //         allMessages = allMessages.map((m) =>
// //           m.createdAt === msg.createdAt
// //             ? { ...m, deletedFor: [...(m.deletedFor || []), userData.id] }
// //             : m
// //         );
// //       }

// //       await updateDoc(msgRef, { messages: allMessages });
// //       toast.success("Message deleted");
// //     } catch (err) {
// //       toast.error("Failed to delete message");
// //     } finally {
// //       setDeleteModal(null);
// //       setDeleteForBoth(false);
// //     }
// //   };

// //   const openDeleteModal = (msg) => {
// //     setDeleteModal({ msg });
// //     setDeleteForBoth(false);
// //     setContextMenu(null);
// //   };

// //   const handleRightClick = (e, msg, index) => {
// //     e.preventDefault();
// //     setContextMenu({ x: e.clientX, y: e.clientY, msg, index });
// //   };

// //   if (!chatUser) {
// //     return (
// //       <div className='chat-welcome'>
// //         <img src={assets.logo_icon} alt="" />
// //         <p>Chat anytime, anywhere</p>
// //       </div>
// //     );
// //   }

// //   const statusText = formatLastSeen(chatUserData?.lastSeen);
// //   const isOnline = statusText === "online";
// //   const sortedMessages = [...messages]
// //     .sort((a, b) => a.createdAt - b.createdAt)
// //     .filter((m) => !(m.deletedFor || []).includes(userData.id));

// //   const isMe = (msg) => msg.sId === userData.id;

// //   return (
// //     <div className='chat-box'>

// //       {/* HEADER */}
// //       <div className="chat-user">
// //         <div className="chat-user-avatar-wrap">
// //           <img
// //             src={getAvatar(chatUserData || chatUser.userData)}
// //             alt={chatUser.userData?.username}
// //             className="chat-user-avatar"
// //           />
// //           {isOnline && <span className="online-ring" />}
// //         </div>
// //         <div className="chat-user-info">
// //           <p className="chat-user-name">{chatUser.userData?.username}</p>
// //           <span className={`chat-user-status ${isOnline ? "status-online" : "status-offline"}`}>
// //             {isOnline ? "● online" : statusText}
// //           </span>
// //         </div>
// //         <img src={assets.help_icon} alt="" className='help-icon' />
// //       </div>

// //       {/* MESSAGES */}
// //       <div className="chat-msg" ref={chatMsgRef}>
// //         {sortedMessages.map((msg, i) => {
// //           const mine = isMe(msg);
// //           const nextMsg = sortedMessages[i + 1];
// //           const isLastInGroup = !nextMsg || nextMsg.sId !== msg.sId;
// //           const isHovered = hoveredIndex === i;

// //           return (
// //             <div
// //               key={i}
// //               className={`msg-row ${mine ? "msg-row-me" : "msg-row-them"}`}
// //               style={{ marginBottom: isLastInGroup ? "10px" : "2px", position: "relative" }}
// //               onMouseEnter={() => setHoveredIndex(i)}
// //               onMouseLeave={() => setHoveredIndex(null)}
// //               onContextMenu={(e) => handleRightClick(e, msg, i)}
// //             >
// //               {isLastInGroup ? (
// //                 <img
// //                   src={mine ? getAvatar(userData) : getAvatar(chatUserData || chatUser.userData)}
// //                   alt=""
// //                   className="msg-avatar"
// //                 />
// //               ) : (
// //                 <div className="msg-avatar-spacer" />
// //               )}

// //               <div className={`msg-bubble-wrap ${mine ? "msg-bubble-wrap-me" : "msg-bubble-wrap-them"}`}>
// //                 <p className={`msg ${mine ? "msg-me" : "msg-them"}`}>
// //                   {msg.text}
// //                 </p>
// //                 {isLastInGroup && (
// //                   <span className="msg-time">
// //                     {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
// //                   </span>
// //                 )}
// //               </div>

// //               {/* Hover delete button */}
// //               {isHovered && (
// //                 <button
// //                   onClick={() => openDeleteModal(msg)}
// //                   style={{
// //                     position: "absolute",
// //                     top: "50%",
// //                     transform: "translateY(-50%)",
// //                     [mine ? "left" : "right"]: "48px",
// //                     background: "var(--color-background-secondary)",
// //                     border: "0.5px solid var(--color-border-secondary)",
// //                     borderRadius: "6px",
// //                     padding: "2px 8px",
// //                     fontSize: "12px",
// //                     color: "var(--color-text-secondary)",
// //                     cursor: "pointer",
// //                     zIndex: 10,
// //                   }}
// //                 >
// //                   Delete
// //                 </button>
// //               )}
// //             </div>
// //           );
// //         })}
// //       </div>

// //       {/* RIGHT-CLICK CONTEXT MENU */}
// //       {contextMenu && (
// //         <div
// //           style={{
// //             position: "fixed",
// //             top: contextMenu.y,
// //             left: contextMenu.x,
// //             background: "var(--color-background-primary)",
// //             border: "0.5px solid var(--color-border-secondary)",
// //             borderRadius: "8px",
// //             padding: "4px 0",
// //             zIndex: 1000,
// //             minWidth: "140px",
// //             boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
// //           }}
// //           onClick={(e) => e.stopPropagation()}
// //         >
// //           <div
// //             onClick={() => openDeleteModal(contextMenu.msg)}
// //             style={{
// //               padding: "8px 16px",
// //               fontSize: "14px",
// //               color: "var(--color-text-danger)",
// //               cursor: "pointer",
// //             }}
// //             onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-background-secondary)"}
// //             onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
// //           >
// //             Delete message
// //           </div>
// //         </div>
// //       )}

// //       {/* DELETE CONFIRMATION MODAL */}
// //       {deleteModal && (
// //         <div
// //           style={{
// //             position: "fixed", inset: 0,
// //             background: "rgba(0,0,0,0.45)",
// //             display: "flex", alignItems: "center", justifyContent: "center",
// //             zIndex: 2000,
// //           }}
// //           onClick={() => setDeleteModal(null)}
// //         >
// //           <div
// //             style={{
// //               background: "white",
// //               borderRadius: "12px",
// //               padding: "24px",
// //               width: "320px",
// //               border: "0.5px solid var(--color-border-tertiary)",
// //             }}
// //             onClick={(e) => e.stopPropagation()}
// //           >
// //             <p style={{ fontWeight: 500, fontSize: "16px", marginBottom: "16px", color: "var(--color-text-primary)" }}>
// //               Do you want to delete this message?
// //             </p>

// //             {/* Only show "delete for both" if it's my message */}
// //             {isMe(deleteModal.msg) && (
// //               <label style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", cursor: "pointer" }}>
// //                 <input
// //                   type="checkbox"
// //                   checked={deleteForBoth}
// //                   onChange={(e) => setDeleteForBoth(e.target.checked)}
// //                   style={{ width: "16px", height: "16px", accentColor: "#4f8ef7" }}
// //                 />
// //                 <span style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
// //                   Also delete for {chatUser.userData?.username}
// //                 </span>
// //               </label>
// //             )}

// //             <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
// //               <button
// //                 onClick={() => setDeleteModal(null)}
// //                 style={{
// //                   background: "none", border: "none",
// //                   color: "var(--color-text-secondary)",
// //                   fontSize: "15px", cursor: "pointer", fontWeight: 500,
// //                 }}
// //               >
// //                 Cancel
// //               </button>
// //               <button
// //                 onClick={handleDeleteConfirm}
// //                 style={{
// //                   background: "none", border: "none",
// //                   color: "#4f8ef7",
// //                   fontSize: "15px", cursor: "pointer", fontWeight: 500,
// //                 }}
// //               >
// //                 Delete
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* INPUT */}
// //       <div className="chat-input">
// //         <input
// //           onChange={(e) => setInput(e.target.value)}
// //           value={input}
// //           type='text'
// //           placeholder='Send a message'
// //           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
// //         />
// //         <img onClick={sendMessage} src={assets.send_button} alt='' style={{ cursor: "pointer" }} />
// //       </div>

// //     </div>
// //   );
// // };

// // export default ChatBox;


// import React, { useState, useContext, useEffect, useRef } from 'react'
// import "./ChatBox.css"
// import assets from "../../assets/assets.js";
// import { AppContext } from '../../context/AppContext.jsx';
// import { doc, updateDoc, arrayUnion, getDoc, onSnapshot } from 'firebase/firestore';
// import { db } from '../../config/firebase.js';
// import { toast } from 'react-toastify';

// const getAvatar = (user) =>
//   user?.avatar && user.avatar !== ""
//     ? user.avatar
//     : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "U")}&background=random&color=fff`;

// const formatLastSeen = (lastSeen) => {
//   if (!lastSeen) return "Offline";
//   const now = Date.now();
//   const diff = now - lastSeen;
//   const minutes = Math.floor(diff / 60000);
//   if (diff < 2 * 60 * 1000) return "online";
//   if (minutes < 60) return `last seen ${minutes} min ago`;
//   const lastSeenDate = new Date(lastSeen);
//   const today = new Date();
//   const yesterday = new Date();
//   yesterday.setDate(today.getDate() - 1);
//   const time = lastSeenDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   const isSameDay = (d1, d2) =>
//     d1.getFullYear() === d2.getFullYear() &&
//     d1.getMonth() === d2.getMonth() &&
//     d1.getDate() === d2.getDate();
//   if (isSameDay(lastSeenDate, today)) return `last seen today at ${time}`;
//   if (isSameDay(lastSeenDate, yesterday)) return `last seen yesterday at ${time}`;
//   return `last seen ${lastSeenDate.toLocaleDateString([], { day: "numeric", month: "short" })}`;
// };

// const ChatBox = ({ isMobile, onBack }) => {
//   const { userData, messagesId, chatUser, messages } = useContext(AppContext);
//   const [input, setInput] = useState("");
//   const [chatUserData, setChatUserData] = useState(null);
//   const chatMsgRef = useRef(null);

//   useEffect(() => {
//     if (chatMsgRef.current) {
//       chatMsgRef.current.scrollTop = chatMsgRef.current.scrollHeight;
//     }
//   }, [messages]);

//   useEffect(() => {
//     if (!chatUser?.rId) { setChatUserData(null); return; }
//     const userRef = doc(db, "users", chatUser.rId);
//     const unSub = onSnapshot(userRef, (snap) => {
//       if (snap.exists()) setChatUserData(snap.data());
//     });
//     return () => unSub();
//   }, [chatUser?.rId]);

//   const [, setTick] = useState(0);
//   useEffect(() => {
//     const interval = setInterval(() => setTick((t) => t + 1), 30000);
//     return () => clearInterval(interval);
//   }, []);

//   const sendMessage = async () => {
//     try {
//       if (!input.trim() || !messagesId) return;
//       await updateDoc(doc(db, "messages", messagesId), {
//         messages: arrayUnion({ text: input, sId: userData.id, createdAt: Date.now() }),
//       });
//       const userIds = [chatUser.rId, userData.id];
//       for (let id of userIds) {
//         const userChatsRef = doc(db, "chats", id);
//         const snap = await getDoc(userChatsRef);
//         if (snap.exists()) {
//           const data = snap.data();
//           const index = data.chatsData.findIndex((c) => c.messageId === messagesId);
//           if (index >= 0) {
//             data.chatsData[index].lastMessage = input.slice(0, 30);
//             data.chatsData[index].updatedAt = Date.now();
//             if (data.chatsData[index].rId === userData.id) {
//               data.chatsData[index].messageSeen = false;
//             }
//             await updateDoc(userChatsRef, { chatsData: data.chatsData });
//           }
//         }
//       }
//       setInput("");
//     } catch (error) {
//       console.error("Error sending message:", error);
//       toast.error(error.message);
//     }
//   };

//   if (!chatUser) {
//     return (
//       <div className='chat-welcome'>
//         <img src={assets.logo_icon} alt="" />
//         <p>Chat anytime, anywhere</p>
//       </div>
//     );
//   }

//   const statusText = formatLastSeen(chatUserData?.lastSeen);
//   const isOnline = statusText === "online";
//   const sortedMessages = [...messages].sort((a, b) => a.createdAt - b.createdAt);

//   return (
//     <div className='chat-box'>

//       {/* HEADER */}
//       <div className="chat-user">
//         {/* ✅ Back arrow — only visible on mobile via CSS */}
//         <button className="chat-back-btn" onClick={onBack} aria-label="Back">
//           &#8592;
//         </button>

//         <div className="chat-user-avatar-wrap">
//           <img
//             src={getAvatar(chatUserData || chatUser.userData)}
//             alt={chatUser.userData?.username}
//             className="chat-user-avatar"
//           />
//           {isOnline && <span className="online-ring" />}
//         </div>

//         <div className="chat-user-info">
//           <p className="chat-user-name">{chatUser.userData?.username}</p>
//           <span className={`chat-user-status ${isOnline ? "status-online" : "status-offline"}`}>
//             {isOnline ? "● online" : statusText}
//           </span>
//         </div>

//         <img src={assets.help_icon} alt="" className='help-icon' />
//       </div>

//       {/* MESSAGES */}
//       <div className="chat-msg" ref={chatMsgRef}>
//         {sortedMessages.map((msg, i) => {
//           const isMe = msg.sId === userData.id;
//           const nextMsg = sortedMessages[i + 1];
//           const isLastInGroup = !nextMsg || nextMsg.sId !== msg.sId;

//           return (
//             <div
//               key={i}
//               className={`msg-row ${isMe ? "msg-row-me" : "msg-row-them"}`}
//               style={{ marginBottom: isLastInGroup ? "10px" : "2px" }}
//             >
//               {isLastInGroup ? (
//                 <img
//                   src={isMe ? getAvatar(userData) : getAvatar(chatUserData || chatUser.userData)}
//                   alt=""
//                   className="msg-avatar"
//                 />
//               ) : (
//                 <div className="msg-avatar-spacer" />
//               )}

//               <div className={`msg-bubble-wrap ${isMe ? "msg-bubble-wrap-me" : "msg-bubble-wrap-them"}`}>
//                 <p className={`msg ${isMe ? "msg-me" : "msg-them"}`}>{msg.text}</p>
//                 {isLastInGroup && (
//                   <span className="msg-time">
//                     {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
//                   </span>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* INPUT */}
//       <div className="chat-input">
//         <input
//           onChange={(e) => setInput(e.target.value)}
//           value={input}
//           type='text'
//           placeholder='Send a message'
//           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//         />
//         <img onClick={sendMessage} src={assets.send_button} alt='' />
//       </div>

//     </div>
//   );
// };

// export default ChatBox;

import React, { useState, useContext, useEffect, useRef } from 'react'
import "./ChatBox.css"
import assets from "../../assets/assets.js";
import { AppContext } from '../../context/AppContext.jsx';
import { doc, updateDoc, arrayUnion, getDoc, onSnapshot } from 'firebase/firestore';
import { db, logout } from '../../config/firebase.js';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const getAvatar = (user) =>
  user?.avatar && user.avatar !== ""
    ? user.avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "U")}&background=random&color=fff`;

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
  const time = lastSeenDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
  if (isSameDay(lastSeenDate, today)) return `last seen today at ${time}`;
  if (isSameDay(lastSeenDate, yesterday)) return `last seen yesterday at ${time}`;
  return `last seen ${lastSeenDate.toLocaleDateString([], { day: "numeric", month: "short" })}`;
};

const ChatBox = ({ isMobile, onBack }) => {
  const { userData, messagesId, chatUser, setChatUser, setMessagesId, setUserData, setChatData, messages } = useContext(AppContext);
  const [input, setInput] = useState("");
  const [chatUserData, setChatUserData] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [removing, setRemoving] = useState(false);
  const chatMsgRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (chatMsgRef.current) {
      chatMsgRef.current.scrollTop = chatMsgRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!chatUser?.rId) { setChatUserData(null); return; }
    const userRef = doc(db, "users", chatUser.rId);
    const unSub = onSnapshot(userRef, (snap) => {
      if (snap.exists()) setChatUserData(snap.data());
    });
    return () => unSub();
  }, [chatUser?.rId]);

  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = async () => {
    try {
      if (!input.trim() || !messagesId) return;
      await updateDoc(doc(db, "messages", messagesId), {
        messages: arrayUnion({ text: input, sId: userData.id, createdAt: Date.now() }),
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

  // ✅ Remove friend
  const handleRemoveFriend = async () => {
    if (!chatUser || !userData) return;
    setRemoving(true);
    try {
      const myChatsRef = doc(db, "chats", userData.id);
      const theirChatsRef = doc(db, "chats", chatUser.rId);
      const mySnap = await getDoc(myChatsRef);
      if (mySnap.exists()) {
        const filtered = mySnap.data().chatsData.filter((c) => c.messageId !== chatUser.messageId);
        await updateDoc(myChatsRef, { chatsData: filtered });
      }
      const theirSnap = await getDoc(theirChatsRef);
      if (theirSnap.exists()) {
        const filtered = theirSnap.data().chatsData.filter((c) => c.messageId !== chatUser.messageId);
        await updateDoc(theirChatsRef, { chatsData: filtered });
      }
      setChatUser(null);
      setMessagesId(null);
      setShowDrawer(false);
      setShowConfirm(false);
      toast.success(`${chatUser.userData?.username} removed from friends`);
    } catch (err) {
      toast.error("Failed to remove friend");
    } finally {
      setRemoving(false);
    }
  };

  // ✅ Logout
  const handleLogout = async () => {
    await logout();
    setUserData(null);
    setChatData([]);
    navigate('/');
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
        <button className="chat-back-btn" onClick={onBack}>&#8592;</button>

        <div className="chat-user-avatar-wrap">
          <img src={getAvatar(chatUserData || chatUser.userData)} alt="" className="chat-user-avatar" />
          {isOnline && <span className="online-ring" />}
        </div>

        <div className="chat-user-info">
          <p className="chat-user-name">{chatUser.userData?.username}</p>
          <span className={`chat-user-status ${isOnline ? "status-online" : "status-offline"}`}>
            {isOnline ? "● online" : statusText}
          </span>
        </div>

        {/* ✅ Info icon — opens drawer on mobile, does nothing on desktop (right sidebar visible) */}
        <img
          src={assets.help_icon}
          alt=""
          className='help-icon mobile-info-btn'
          onClick={() => { setShowDrawer(true); setShowConfirm(false); }}
        />
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
                <img src={isMe ? getAvatar(userData) : getAvatar(chatUserData || chatUser.userData)} alt="" className="msg-avatar" />
              ) : (
                <div className="msg-avatar-spacer" />
              )}
              <div className={`msg-bubble-wrap ${isMe ? "msg-bubble-wrap-me" : "msg-bubble-wrap-them"}`}>
                <p className={`msg ${isMe ? "msg-me" : "msg-them"}`}>{msg.text}</p>
                {isLastInGroup && (
                  <span className="msg-time">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
        <img onClick={sendMessage} src={assets.send_button} alt='' />
      </div>

      {/* ✅ MOBILE BOTTOM DRAWER — contact info + account + logout */}
      {showDrawer && (
        <div className="drawer-overlay" onClick={(e) => e.target === e.currentTarget && setShowDrawer(false)}>
          <div className="drawer">

            {/* Drag handle */}
            <div className="drawer-handle" />

            {/* Contact info */}
            <div className="drawer-contact">
              <div className="drawer-avatar-wrap">
                <img src={getAvatar(chatUserData || chatUser.userData)} alt="" className="drawer-avatar" />
                {isOnline && <span className="drawer-online-dot" />}
              </div>
              <h3 className="drawer-name">{chatUser.userData?.username}</h3>
              <p className="drawer-bio">{chatUser.userData?.bio || "Hey there! I am using Chat App."}</p>
              <div className="drawer-email-row">
                <span className="drawer-label">Email</span>
                <span className="drawer-value">{chatUser.userData?.email || "—"}</span>
              </div>

              {/* Remove friend */}
              {!showConfirm ? (
                <button className="drawer-remove-btn" onClick={() => setShowConfirm(true)}>
                  🗑️ Remove Friend
                </button>
              ) : (
                <div className="drawer-confirm">
                  <p>Remove <strong>{chatUser.userData?.username}</strong>? This deletes your chat.</p>
                  <div className="drawer-confirm-btns">
                    <button onClick={() => setShowConfirm(false)} disabled={removing}>Cancel</button>
                    <button className="drawer-confirm-yes" onClick={handleRemoveFriend} disabled={removing}>
                      {removing ? "Removing..." : "Yes, Remove"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="drawer-divider"><span>Your Account</span></div>

            {/* My account */}
            <div className="drawer-me-row">
              <div style={{ position: "relative" }}>
                <img src={getAvatar(userData)} alt="" className="drawer-me-avatar" />
                <span className="drawer-me-dot" />
              </div>
              <div className="drawer-me-info">
                <span className="drawer-me-name">{userData?.username}</span>
                <span className="drawer-me-email">{userData?.email}</span>
              </div>
            </div>

            <div className="drawer-actions">
              <button className="drawer-edit-btn" onClick={() => { setShowDrawer(false); navigate('/profile'); }}>
                ✏️ Edit Profile
              </button>
              <button className="drawer-logout-btn" onClick={handleLogout}>
                ⏻ Logout ({userData?.username})
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ChatBox;