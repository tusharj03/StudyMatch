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
// import { classOptions } from '../utils/class-options'; // Commented out the import

// Hardcoded class options for testing
const classOptions = [
    { value: 'AAS 100', label: 'Intro Asian American Studies' },
    { value: 'AAS 200', label: 'U.S. Race and Empire' },
    { value: 'AAS 201', label: 'US Racial & Ethnic Politics' },
    { value: 'AAS 275', label: 'The Politics of Fashion' },
    { value: 'AAS 283', label: 'Asian American History' },
    // Add more options as needed
];

const Profile = ({ isAuth }) => {
  
  const [profilePicURL, setProfilePicURL] = useState(""); // State to hold profile picture URL
  const navigate = useNavigate();
  
  // Function to handle profile picture change
  const handleProfilePicChange = async (event) => {
    const file = event.target.files[0];
    const storageRef = ref(storage, `profile_pictures/${auth.currentUser.uid}/${file.name}`);
    
    try {
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
  
      // Set profilePicURL state only if downloadURL is available
      if (downloadURL) {
        setProfilePicURL(downloadURL); // Set the downloaded URL to state

        updateProfile(downloadURL);
      } else {
        console.error("Failed to retrieve profile picture download URL.");
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  }
  

  const userColRef = collection(db, "users");
  const [major, setMajor] = useState("");
  const [editMajor, setEditMajor] = useState(false);

  // If user not authenticated, redirect to login page
  useEffect(() => {
    if (!isAuth) {
      navigate("/");
    }
  }, []);
  // Retrieve profile info when page loads
  useEffect(() => {
    getDocs(userColRef)
    .then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        if (doc.id == auth.currentUser.uid) {
          document.getElementById("majorInput").textContent = doc.data().major;
          document.getElementById("classesInput").value = doc.data().classes.join(", ");
          document.getElementById("bioInput").value = doc.data().bio;
          document.getElementById("instagramInput").value = doc.data().instagram;
          document.getElementById("emailInput").value = doc.data().email;
          document.getElementById("snapchatInput").value = doc.data().snapchat;
        }
      });
    })
    .catch(err => {
      console.log(err);
    });
  }, []);

  // Update profile
  const updateProfile = async (downloadURL) => {
    console.log("Update Profile function called");
    // Prepare major and class data to pass into database
    let majorToUpdate = "";
    
    if (editMajor) {
      major.value == null ? majorToUpdate = [] : majorToUpdate = major.value;
    } else {
      majorToUpdate = document.getElementById("majorInput").textContent;
    }
    
    // Check that email is a valid format
    const validateEmail = (email) => {
      const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
      return re.test(email);
    }
    const email = document.getElementById("emailInput").value;
    if (!(validateEmail(email) || email === "")) {
      document.getElementById("saveMessage").style.display = "none";
      document.getElementById("invalidEmailMessage").style.display = "block";
      return;
    }
  
    // Prepare the profile pic URL
    const profilePicURL = downloadURL || profilePicURL; // Use the new downloadURL if available, otherwise keep the current one
  
    // Add/update to Cloud Firestore
    await setDoc(doc(db, "users", auth.currentUser.uid), {
      major: majorToUpdate,
      name: auth.currentUser.displayName,
      classes: document.getElementById("classesInput").value.split(",").map(x => x.trim()),
      bio: document.getElementById("bioInput").value,
      instagram: document.getElementById("instagramInput").value,
      email,
      snapchat: document.getElementById("snapchatInput").value,
      profilePicURL // Use the prepared profilePicURL
    });
    console.log("Profile updated successfully");
  
    // Retrieve profile info when updated
    getDocs(userColRef)
    .then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        if (doc.id == auth.currentUser.uid) {
          document.getElementById("majorInput").textContent = doc.data().major;
          document.getElementById("classesInput").value = doc.data().classes.join(", ");
          document.getElementById("bioInput").value = doc.data().bio;
          document.getElementById("instagramInput").value = doc.data().instagram;
          document.getElementById("emailInput").value = doc.data().email;
          document.getElementById("snapchatInput").value = doc.data().snapchat;
        }
      });
    })
    .catch(err => {
      console.log(err);
    }); 
  
    setEditMajor(false);
  
    // Display "Saved!" Message
    document.getElementById("saveMessage").style.display = "block";
    document.getElementById("invalidEmailMessage").style.display = "none";
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
        <div className="note">Note: Separate classes using commas.</div>
        {/* Hardcoded options for testing */}
        <ReactSelect id="classesInput" className="dropdown"
          options={classOptions}
          isMulti
        />
      </div>
      <br/>

      <div className="inputSection">
        <b className="inputHeader">About Me</b>
        <br/>
        <textarea id="bioInput" className="inputLarge"></textarea>
      </div>
      
      <div className="inputSection">
        <b className="inputHeader">Profile Picture</b>
        <br />
        <input type="file" accept="image/*" onChange={handleProfilePicChange} />
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


      <br/>
      <button className="button1" id='savebutton' onClick={updateProfile}>Save Profile</button> 
      <div id="saveMessage" className="message">Saved!</div>
      <div id="invalidEmailMessage" className="message">Email address is not valid.</div>
    </div>
  )
}

export default Profile;
