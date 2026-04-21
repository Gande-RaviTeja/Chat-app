// import React, { useContext, useEffect } from "react";
// import "./chat.css";
// import LeftSidebar from "../../components/LeftSidebar/LeftSidebar";
// import ChatBox from "../../components/ChatBox/ChatBox";
// import RightSidebar from "../../components/RightSidebar/RightSidebar";
// import { AppContext } from "../../context/AppContext";
// import { useState } from "react";
// const Chat = () => {

//   const {chatData, userData} = useContext(AppContext);
//   const [loading, setLoading] = useState(true);


//   useEffect(() => {
//     if(chatData && userData){
//       setLoading(false);
//     }
//   },[chatData,userData])


//   return (
//     <div className="chat">
//       {
//         loading ? <p className="loading">loading....</p>
//           :<div className="chat-container">
//             <LeftSidebar />
//             <ChatBox />
//             <RightSidebar />

//           </div>
//       }
//     </div>
//   );
// };

// export default Chat;

import React, { useContext, useEffect, useState } from "react";
import "./chat.css";
import LeftSidebar from "../../components/LeftSidebar/LeftSidebar";
import ChatBox from "../../components/ChatBox/ChatBox";
import RightSidebar from "../../components/RightSidebar/RightSidebar";
import { AppContext } from "../../context/AppContext";

const Chat = () => {
  const { chatData, userData, chatUser, setChatUser, setMessagesId } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 540);

  useEffect(() => {
    if (chatData && userData) setLoading(false);
  }, [chatData, userData]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 540);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleBack = () => {
    setChatUser(null);
    setMessagesId(null);
  };

  const chatOpen = !!chatUser;

  return (
    <div className="chat">
      {loading ? (
        <p className="loading">loading....</p>
      ) : (
        <div className={`chat-container ${isMobile && chatOpen ? "chat-open" : ""}`}>
          <LeftSidebar />
          <ChatBox isMobile={isMobile} onBack={handleBack} />
          <RightSidebar />
        </div>
      )}
    </div>
  );
};

export default Chat;