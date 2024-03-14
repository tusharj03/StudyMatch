import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classOptions from '../utils/class-options'; // Importing class options
import ClassChat from '../utils/ClassChat'; // Import the ClassChat component
import { db, auth, serverTimestamp, storage } from "../firebase-config";
import { addDoc, collection, ref, uploadBytes } from "firebase/firestore";
import '../Styles.css';
import { stylesLight, stylesDark } from '../utils/dropdown-settings';
import Select from 'react-select';

const Chat = ({ isAuth, onJoinClass }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [joinedClasses, setJoinedClasses] = useState([]);

  useEffect(() => {
    if (!isAuth) {
      navigate('/');
    }
  }, [isAuth, navigate]);

  useEffect(() => {
    // Fetch joined classes from local storage
    const storedJoinedClasses = localStorage.getItem("joinedClasses");
    if (storedJoinedClasses) {
      setJoinedClasses(JSON.parse(storedJoinedClasses));
    }
  }, []);

  // State variable to store the list of chats for each class
  const [classChats, setClassChats] = useState({});

  // Function to join a class chat
  const joinClassChat = async (className) => {
    // Check if a chat already exists for the selected class
    if (joinedClasses.includes(className)) {
      console.log(`Joining existing chat for class: ${className}`);
    } else {
      // If no chat exists, create a new one
      setJoinedClasses(prevJoinedClasses => [...prevJoinedClasses, className]);
      console.log(`Created new chat for class: ${className}`);
    }
  
    onJoinClass(className);
  
    try {
      // Add the user to the participants collection
      await addDoc(collection(db, `classChats/${className}/participants`), {
        displayName: auth.currentUser.displayName,
        userId: auth.currentUser.uid,
      });
  
      console.log('Participant added successfully.');
    } catch (error) {
      console.error("Error adding participant:", error);
    }
  };

  

  // Function to send a message to the current chat
  // Update the sendMessage function in Chat.js
  const sendMessage = async (message) => {
    try {
      // Add the message to the respective class chat collection in Firestore
      await addDoc(collection(db, `classChats/${selectedClass}/messages`), {
        message: message,
        displayName: auth.currentUser.displayName, // Get the user's display name from authentication
        timestamp: serverTimestamp() // Add a timestamp for sorting messages
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const selectStyles = darkMode ? stylesDark : stylesLight;

  return (
    <div className="page">
      <h1 className="title">Chat</h1>
      <div className="select-container">
        <h2 className="inputHeaderBig">Join a Class:</h2>
        <Select
          value={{ value: selectedClass, label: selectedClass }}
          onChange={(option) => setSelectedClass(option.value)}
          options={classOptions.map((classItem) => ({ value: classItem.code, label: `${classItem.code} - ${classItem.name}` }))}
          styles={selectStyles}
        />
      </div>
      {selectedClass && (
        <div className="button-container"> {/* Added div container */}
          <button onClick={() => joinClassChat(selectedClass)}>Join {selectedClass} Chat</button>
        </div>
      )}
      <div className="my-group-chats">
  <h2 className="inputHeaderBig">My Group Chats:</h2>
  {joinedClasses.map((className, index) => (
    <p key={index} onClick={() => navigate(`/class/${className}`)} style={{ cursor: 'pointer', color: 'var(--color1)', fontSize: '18px', marginBottom: '5px' }}>{className}</p>
  ))}
</div>
    </div>
  );
};

export default Chat;