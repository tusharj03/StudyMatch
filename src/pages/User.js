import React, { useEffect, useState } from 'react';
import { db, storage } from "../firebase-config";
import { useNavigate, useParams } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faDiscord, faSnapchat } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import '../Styles.css';
import Footer from '../utils/Footer';

const User = ({ isAuth }) => {
  // If user not authenticated, redirect to login page
  let nagivate = useNavigate();
  const [profilePicURL, setProfilePicURL] = useState(""); // State to hold profile picture URL
  useEffect(() => {
    if (!isAuth) {
      nagivate("/");
    }
  }, []);

  const userColRef = collection(db, "users");
  const user = useParams();
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [snapchat, setSnapchat] = useState("");

  useEffect(() => {
    getDocs(userColRef)
    .then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        if (doc.id === user.id) {
          document.getElementById("userProfileDisplayName").textContent = doc.data().name;
          document.getElementById("userProfileMajor").textContent = doc.data().major;
          document.getElementById("userProfileClasses").textContent = doc.data().classes.join(", ");
          document.getElementById("userProfileBio").textContent = doc.data().bio;
          setEmail(doc.data().email);
          setInstagram(doc.data().instagram);
          setSnapchat(doc.data().snapchat);
          setProfilePicURL(doc.data().profilePicURL); // Set the profile picture URL from Firestore
        }
      });
    })
    .catch(err => {
      console.log(err);
    });
  }, []);

  const renderProfilePic = () => {
    if (profilePicURL) {
      return <img src={profilePicURL} alt="Profile Picture" className="profile-pic" />;
    } else {
      return <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" alt="Default Profile Picture" className="profile-pic" />; // Alternatively, you could display a default profile picture here
    }
  };

  return (
    <div className="page">
      <h1 id="userProfileDisplayName" className="title">Name</h1>
      <div id="userProfileMajor" className="userProfileContent"></div>
      <br/>
      {renderProfilePic()} {/* Display profile picture here */}
      <br/>
      <br/>
      <b className="userProfileHeader">Classes</b>
      <br/>
      <div id="userProfileClasses" className="userProfileContent"></div>
      <br/>
      <b className="userProfileHeader">About</b>
      <br/>
      <div id="userProfileBio" className="userProfileContent"></div>
      <br/>
    
      {email !== "" &&
        <div className="userProfileSocial">
          <FontAwesomeIcon id="emailIcon" className="contactIcon" icon={faEnvelope}/>
          <a id="userProfileEmail" className="userProfileLink" href={`mailto:${email}`} target="_blank">{email}</a>
        </div>
      }

      {instagram !== "" &&
        <div className="userProfileSocial">
          <FontAwesomeIcon className="contactIcon" icon={faInstagram}/>
          <a id="userProfileInstagram" className="userProfileLink" href={`https://www.instagram.com/${instagram}`} target="_blank">{instagram}</a>
        </div>
      }

      {snapchat !== "" &&
        <div className="userProfileSocial">
          <FontAwesomeIcon id="snapchatIcon" className="contactIcon" icon={faSnapchat}/>
          <span id="userProfileSnapchat" className="userProfileContactText"> {snapchat}</span>
        </div>
      }

    </div>
  )
}

export default User;