import React, { useState, useEffect } from 'react';
import { storage, db, auth } from "../firebase-config";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { default as ReactSelect } from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil } from '@fortawesome/free-solid-svg-icons';
import { stylesLight, stylesDark } from '../utils/dropdown-settings'
import { majorOptions } from '../utils/major-options'
import '../Styles.css';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { classOptions } from '../utils/class-dropdown';

const Profile = ({ isAuth }) => {
  
  const [profilePicURL, setProfilePicURL] = useState(""); // State to hold profile picture URL
  const navigate = useNavigate();
  const [selectedClasses, setSelectedClasses] = useState([]); 
  const [bio, setBio] = useState(""); // State to hold bio content

  

  // Function to handle profile picture change
  const handleProfilePicChange = async (event) => {
    const file = event.target.files[0];
    const storageRef = ref(storage, `profile_pictures/${auth.currentUser.uid}/${file.name}`);
    
    try {
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
  
      if (downloadURL) {
        setProfilePicURL(downloadURL); // Set the downloaded URL to state
      } else {
        console.error("Failed to retrieve profile picture download URL.");
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  }
  
  let nagivate = useNavigate();
  const userColRef = collection(db, "users");
  const [major, setMajor] = useState("");
  const [editMajor, setEditMajor] = useState(false);
  const [classes, setClasses] = useState([]);


  // If user not authenticated, redirect to login page
  useEffect(() => {
    if (!isAuth) {
      nagivate("/");
    }
  }, []);

  // Retrieve profile info when page loads
  useEffect(() => {
    getDocs(userColRef)
    .then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        if (doc.id == auth.currentUser.uid) {
          document.getElementById("majorInput").textContent = doc.data().major;
          setSelectedClasses(doc.data().classes.map(classItem => ({ value: classItem, label: classItem })));
          setBio(doc.data().bio);
          document.getElementById("bioInput").value = doc.data().bio;
          document.getElementById("instagramInput").value = doc.data().instagram;
          document.getElementById("emailInput").value = doc.data().email;
          document.getElementById("snapchatInput").value = doc.data().snapchat;
          setProfilePicURL(doc.data().profilePicURL); // Set profile picture URL
        }
      });
    })
    .catch(err => {
      console.log(err);
    });
  }, []);

  // Update profile
  const updateProfile = async () => {
    // Prepare major and class data to pass into database
    let majorToUpdate = "";
    
    if (editMajor) {
      major.value == null ? (majorToUpdate = []) : (majorToUpdate = major.value);
    } else {
      majorToUpdate = document.getElementById("majorInput").textContent;
    }
    
    // Check that email is a valid format
    const validateEmail = (email) => {
      const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
      return re.test(email);
    };
    const email = document.getElementById("emailInput").value;
    if (!(validateEmail(email) || email === "")) {
      document.getElementById("saveMessage").style.display = "none";
      document.getElementById("invalidEmailMessage").style.display = "block";
      return;
    }
  
    // Add/update to Cloud Firestore
    await setDoc(doc(db, "users", auth.currentUser.uid), {
      major: majorToUpdate,
      name: auth.currentUser.displayName,
      classes: selectedClasses.map((classItem) => classItem.value),
      bio,
      instagram: document.getElementById("instagramInput").value,
      email,
      snapchat: document.getElementById("snapchatInput").value,
      profilePicURL, // Use the current profile picture URL
    });
    console.log("Profile updated successfully");
  
    // Display "Saved!" Message
    document.getElementById("saveMessage").style.display = "block";
    document.getElementById("invalidEmailMessage").style.display = "none";

    setTimeout(() => {
      document.getElementById("saveMessage").style.display = "none";
    }, 1500);
  };
  
  

  // UI
  return (
    <div className="page">      
      <h1 className='title'>My Profile</h1>
      <h1></h1>
      <h2 className="inputHeaderBig">About</h2>
      <div className="inputSection">
        <b className="inputHeader">My Major</b>

        <div>
          {editMajor ? (
            <ReactSelect id="majorDropdown" className="dropdown"
              options={majorOptions}
              value={major} 
              onChange={(s) => {setMajor(s)}}
              styles={localStorage.getItem("theme") === "theme-light" ? stylesLight : stylesDark}
            />
          ) : (
            <div>
              <div id="majorInput" className="preDropdownText"></div>
              <FontAwesomeIcon icon={faPencil} className="editButton" onClick={() => setEditMajor(true)} />
            </div>
          )}
        </div>
      </div>
      
      <div className="inputSection">
        <b className="inputHeader">My Classes</b>
        <div className="note">Note: Select classes from the dropdown.</div>
        <ReactSelect id="majorDropdown"
          options={classOptions}
          isMulti
          value={selectedClasses}
          onChange={(selectedOptions) => setSelectedClasses(selectedOptions)}
          styles={localStorage.getItem("theme") === "theme-light" ? stylesLight : stylesDark}
        />
      </div>

      <div className="inputSection">
        <b className="inputHeader">About Me</b>
        <br/>
        <textarea id="bioInput" className="inputLarge" value={bio} onChange={(e) => setBio(e.target.value)}></textarea>
      </div>
      
      <div className="inputSection">
  <b className="inputHeader">Profile Picture</b>
  <br />
  <label htmlFor="profilePicInput" className="profilePicButton">
    Choose Profile Picture
  </label>
  <input id="profilePicInput" type="file" accept="image/*" onChange={handleProfilePicChange} style={{ display: 'none' }} />
</div>


      <div id="contact">
      <h2 className="inputHeaderBig" >Contact</h2>
      
      <div className="inputSection">
        <b className="inputHeader">Email</b>
        <br/>
        <input id="emailInput" className="inputSmall" placeholder="netid@illinois.edu"></input>
      </div>
      <div className="inputSection">
        <b className="inputHeader">Instagram</b>
        <br/>
        <input id="instagramInput" className="inputSmall" placeholder="username"></input>
      </div>
      <div className="inputSection">
        <b className="inputHeader">Snapchat</b>
        <br/>
        <input id="snapchatInput" className="inputSmall" placeholder="username"></input>
      </div>
      </div>
      
      <div id="matchUser">
      <div className="matchesUserBox">
        <h2 id='userDisplayName'>My Profile</h2>
        {profilePicURL && <img src={profilePicURL} alt="Profile" className="profile-pic" />}
        
        <br />

        <b className="userProfileHeader">Classes</b>
        <br/>
        <div className="userProfileClasses">{selectedClasses.map((classItem) => classItem.label).join(", ")}</div>
        <br/>
        <b className="userProfileHeader">About</b>
        <br/>
        <div id="userProfileBio" className="userProfileContent">{bio}</div>
        <br/>
        </div>
      </div>

      <br/>
      <button className="button1" id='savebutton' onClick={() => updateProfile()}>Save Profile</button> 
      <div id="saveMessage" className="message">Saved!</div>
      <div id="invalidEmailMessage" className="message">Email address is not valid.</div>
    </div>

  )
}

export default Profile;
