// // import React, { useEffect, useState } from "react";
// // import "./profile.css";
// // import assets from "../../assets/assets.js";
// // import { onAuthStateChanged } from "firebase/auth";
// // import { auth, db } from "../../config/firebase.js";
// // import { doc, getDoc, updateDoc } from "firebase/firestore";
// // import { useNavigate } from "react-router-dom";
// // import { upload } from "../../config/firebase.js";
// // import { toast } from "react-toastify";


// // const Profile = () => {
// //    const navigate=useNavigate();
// //   const [Img,setImg]=useState(false);
// //   const [name,setName]=useState("");
// //   const [bio,setBio]=useState("");
// //   const [uid,setUid]=useState("");
// //   const [prevImg,setPrevImg]=useState("");

// //   const profileupdate= async(event)=>{
// //     event.preventDefault();

// //     try{
// //       if(!prevImg && !Img){
// //         toast.error("Please upload profile image");
// //       }
// //       const docref=doc(db,"users",uid);
// //       if(Img){
// //         const imgurl=await upload(Img);
// //         setPrevImg(imgurl);
// //         await updateDoc(docref,{
// //           name:name,
// //           bio:bio,
// //           avatar:imgurl
// //         });
// //       }else{
// //         await updateDoc(docref,{
// //           name:name,
// //           bio:bio,
// //           avatar:imgurl
// //         }); 
// //       }
// //     }catch(err){
// //       toast.error(err.message);
// //     }
// //   }

// //   useEffect(() => {
// //     onAuthStateChanged(auth,async(user)=>{
// //       if(user){
// //         setUid(user.uid);
// //         const docRef = doc(db, "users", user.uid);
// //         const docSnap = await getDoc(docRef);
// //         if(docSnap.data().name){
// //           setName(docSnap.data().name);
// //         }
// //         if(docSnap.data().bio){
// //           setBio(docSnap.data().bio);
// //         }
// //       }
// //       else{
// //         navigate("/");
// //       }
// //     })
// //   },[])
// //   return (
// //     <div>
// //       <div className="profile">
// //         <div className="profile-container">
// //           <form onSubmit={profileupdate}>
// //             <h3>Profile details</h3>
// //             <label htmlFor="avatar">

// //               <input onChange={(e) => setImg(e.target.files[0])} type="file" id='avatar' accept=".png,.jpg,jpeg" hidden/>
// //               <img src={Img?URL.createObjectURL(Img):assets.avatar_icon} alt="" />
// //               upload profile image
// //             </label>
// //             <input onChange={(e)=>setName(e.target.value)} value={name} type="text" placeholder="Your name" required />
// //             <textarea onChange={(e)=>setBio(e.target.value)} value={bio} placeholder="Write Profile bio" required></textarea>
// //             <button type="submit">Save</button>
// //           </form>
// //           <img className="profile-pic" src={Img?URL.createObjectURL(Img):assets.logo_icon} alt="" />
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Profile;  
import React, { useContext, useEffect, useState } from "react";
import "./profile.css";
import assets from "../../assets/assets.js";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../config/firebase.js";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext.jsx";

const Profile = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [uid, setUid] = useState("");
  const [avatar, setAvatar] = useState(assets.avatar_icon); 
  const { setUserData } = useContext(AppContext);

  // Avatar options
  const avatarList = [
    assets.avatar_icon,
    assets.avatar_icon2,
    assets.avatar_icon3,
  ];

  // 🔹 Update profile
  const profileupdate = async (event) => {
    event.preventDefault();

    try {
      const docref = doc(db, "users", uid);

      await updateDoc(docref, {
        name: name,
        bio: bio,
        avatar: avatar, // ✅ save avatar
      });

      toast.success("Profile updated!");
      const snap=await getDoc(docref);
      setUserData(snap.data());
      navigate("/chat");
    } catch (err) {
      toast.error(err.message);
    }
  };

  // 🔹 Load user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);

        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setName(docSnap.data().name || "");
          setBio(docSnap.data().bio || "");
          setAvatar(docSnap.data().avatar || assets.avatar_icon); // ✅ load avatar
        }
      } else {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="profile">
      <div className="profile-container">
        <img className="profile-pic" src={assets.logo_icon} alt="" />
        <form onSubmit={profileupdate}>


          <h3>Profile details</h3>

          {/* ✅ Avatar Section */}
          <div className="avatar-section">
            {/* Big Avatar */}
            <img src={avatar} alt="avatar" className="avatar-main" />

            {/* Avatar Options */}
            <div className="avatar-list">
              {avatarList.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt="avatar option"
                  onClick={() => setAvatar(img)}
                  className={`avatar-option ${
                    avatar === img ? "avatar-selected" : ""
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Name */}
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            placeholder="Your name"
            required
          />

          {/* Bio */}
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="Write Profile bio"
            required
          ></textarea>

          {/* Button */}
          <button type="submit">Save</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;

// import React, { useEffect, useState } from "react";
// import "./profile.css";
// import assets from "../../assets/assets.js";
// import { onAuthStateChanged } from "firebase/auth";
// import { auth, db } from "../../config/firebase.js";
// import { doc, getDoc, updateDoc } from "firebase/firestore";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";

// const Profile = () => {
//   const navigate = useNavigate();

//   const [name, setName] = useState("");
//   const [bio, setBio] = useState("");
//   const [uid, setUid] = useState("");
//   const [avatar, setAvatar] = useState(assets.avatar_icon);

//   // Avatar options
//   const avatarList = [
//     assets.avatar_icon,
//     assets.avatar_icon2,
//     assets.avatar_icon3,

//   ];

//   const profileupdate = async (event) => {
//     event.preventDefault();

//     try {
//       const docref = doc(db, "users", uid);

//       await updateDoc(docref, {
//         name: name,
//         bio: bio,
//         avatar: avatar,
//       });

//       toast.success("Profile updated!");
//     } catch (err) {
//       toast.error(err.message);
//     }
//   };

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         setUid(user.uid);

//         const docRef = doc(db, "users", user.uid);
//         const docSnap = await getDoc(docRef);

//         if (docSnap.exists()) {
//           setName(docSnap.data().name || "");
//           setBio(docSnap.data().bio || "");

//           if (docSnap.data().avatar) {
//             setAvatar(docSnap.data().avatar);
//           }
//         }
//       } else {
//         navigate("/");
//       }
//     });

//     return () => unsubscribe();
//   }, []);

//   return (
//     <div>
//       <div className="profile">
//         <div className="profile-container">
//           <form onSubmit={profileupdate}>
//             <h3>Profile details</h3>

//             <div>
//               <img src={avatar} alt="avatar" className="avatar-main"/>

//               <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
//                 {avatarList.map((img, index) => (
//                   <img
//                     key={index}
//                     src={img}
//                     alt="avatar option"
//                     onClick={() => setAvatar(img)}
//                     style={{
//                       width: "40px",
//                       height: "40px",
//                       cursor: "pointer",
//                       border:
//                         avatar === img
//                           ? "2px solid #2563eb"
//                           : "2px solid transparent",
//                       borderRadius: "50%",
//                     }}
//                   />
//                 ))}
//               </div>
//             </div>

//             <input
//               onChange={(e) => setName(e.target.value)}
//               value={name}
//               type="text"
//               placeholder="Your name"
//               required
//             />

//             <textarea
//               onChange={(e) => setBio(e.target.value)}
//               value={bio}
//               placeholder="Write Profile bio"
//               required
//             ></textarea>

//             <button type="submit">Save</button>
//           </form>

//           <img className="profile-pic" src={assets.logo_icon} alt="" />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;