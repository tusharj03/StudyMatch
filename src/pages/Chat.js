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

  useEffect(() => {
    if (!isAuth) {
      navigate('/');
    }
  }, [isAuth, navigate]);

  // State variable to store the list of chats for each class
  const [classChats, setClassChats] = useState({});

  // Function to join a class chat
  const joinClassChat = async (className) => {
    // Check if a chat already exists for the selected class
    if (classChats[className]) {
      console.log(`Joining existing chat for class: ${className}`);
    } else {
      // If no chat exists, create a new one
      const newClassChats = { ...classChats };
      newClassChats[className] = []; // Initialize an empty array for messages
      setClassChats(newClassChats);
      console.log(`Created new chat for class: ${className}`);
    }
  
    // Set the selected class as the current chat
    setSelectedClass(className);
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
        <h2 className="inputHeaderBig">Select a Class:</h2>
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
    </div>
  );
  
};

export default Chat;