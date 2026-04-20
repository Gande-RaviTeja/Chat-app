import React, { useContext, useState } from 'react'
import "./RightSidebar.css"
import { AppContext } from '../../context/AppContext.jsx';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase.js';
import { toast } from 'react-toastify';

const getAvatar = (user) =>
  user?.avatar && user.avatar !== ""
    ? user.avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "U")}&background=077eff&color=fff`;

const RightSidebar = () => {
  const { chatUser, setChatUser, userData, logout, setMessagesId } = useContext(AppContext);
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [removing, setRemoving] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const handleRemoveFriend = async () => {
    if (!chatUser || !userData) return;
    setRemoving(true);

    try {
      const myChatsRef = doc(db, "chats", userData.id);
      const theirChatsRef = doc(db, "chats", chatUser.rId);

      const mySnap = await getDoc(myChatsRef);
      if (mySnap.exists()) {
        const filtered = mySnap.data().chatsData.filter(
          (c) => c.messageId !== chatUser.messageId
        );
        await updateDoc(myChatsRef, { chatsData: filtered });
      }

      const theirSnap = await getDoc(theirChatsRef);
      if (theirSnap.exists()) {
        const filtered = theirSnap.data().chatsData.filter(
          (c) => c.messageId !== chatUser.messageId
        );
        await updateDoc(theirChatsRef, { chatsData: filtered });
      }

      setChatUser(null);
      setMessagesId(null);
      setShowConfirm(false);
      toast.success(`${chatUser.userData?.username} removed from friends`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove friend");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="rs">

      <div className="rs-contact">
        {chatUser ? (
          <>
            <div className="rs-avatar-wrap">
              <img src={getAvatar(chatUser.userData)} alt={chatUser.userData?.username} className="rs-avatar" />
              <span className="rs-online-dot" />
            </div>

            <h3 className="rs-contact-name">{chatUser.userData?.username || "Unknown"}</h3>
            <p className="rs-contact-bio">{chatUser.userData?.bio || "Hey there! I am using Chat App."}</p>

            <div className="rs-contact-email">
              <span className="rs-label">Email</span>
              <span className="rs-value">{chatUser.userData?.email || "—"}</span>
            </div>

            {!showConfirm ? (
              <button className="rs-remove-btn" onClick={() => setShowConfirm(true)}>
                Remove Friend
              </button>
            ) : (
              <div className="rs-confirm-box">
                <p className="rs-confirm-text">
                  Remove <strong>{chatUser.userData?.username}</strong> from friends?
                  This will delete your chat.
                </p>
                <div className="rs-confirm-actions">
                  <button
                    className="rs-confirm-cancel"
                    onClick={() => setShowConfirm(false)}
                    disabled={removing}
                  >
                    Cancel
                  </button>
                  <button
                    className="rs-confirm-yes"
                    onClick={handleRemoveFriend}
                    disabled={removing}
                  >
                    {removing ? "Removing..." : "Yes, Remove"}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="rs-empty">
            <span>💬</span>
            <p>Select a chat to view contact info</p>
          </div>
        )}
      </div>

      <hr />

      <div className="rs-account">
        <p className="rs-section-label">Your Account</p>

        <div className="rs-me-card">
          <div className="rs-me-avatar-wrap">
            <img src={getAvatar(userData)} alt={userData?.username} className="rs-me-avatar" />
            <span className="rs-me-dot" />
          </div>
          <div className="rs-me-details">
            <span className="rs-me-name">{userData?.username || "You"}</span>
            <span className="rs-me-email">{userData?.email || ""}</span>
            <span className="rs-me-bio">{userData?.bio || "Hey there! I am using Chat App."}</span>
          </div>
        </div>

        <button className="rs-edit-btn" onClick={() => navigate('/profile')}>
          Edit Profile
        </button>

        <button className="rs-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

    </div>
  );
};

export default RightSidebar;