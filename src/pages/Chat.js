import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classOptions from '../utils/class-options'; // Importing class options
import ClassChat from '../utils/ClassChat'; // Import the ClassChat component
import { db, auth, serverTimestamp, storage } from "../firebase-config";
import { addDoc, collection, ref, uploadBytes } from "firebase/firestore";

const Chat = ({ isAuth, onJoinClass }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const navigate = useNavigate();

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


  return (
    <div className="page">
      <h1 className="title">Chat</h1>
      <div>
        <h2>Select a Class:</h2>
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
          <option value="">Select a class...</option>
          {classOptions.map((classItem) => (
            <option key={classItem.code} value={classItem.code}>
              {classItem.code} - {classItem.name}
            </option>
          ))}
        </select>
        {selectedClass && (
          <button onClick={() => joinClassChat(selectedClass)}>Join {selectedClass} Chat</button>
        )}
      </div>

      {/* Render the ClassChat component if a class is selected */}
      
    </div>
  );
};

export default Chat;