import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classOptions from '../utils/class-options'; // Importing class options
import ClassChat from '../utils/ClassChat'; // Import the ClassChat component

const Chat = ({ isAuth }) => {
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
  const joinClassChat = (className) => {
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
  };

  // Function to send a message to the current chat
  const sendMessage = (message) => {
    const updatedChats = { ...classChats };
    updatedChats[selectedClass].push(message);
    setClassChats(updatedChats);
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
      {selectedClass && classChats[selectedClass] && (
        <ClassChat
          className={selectedClass}
          messages={classChats[selectedClass]}
          sendMessage={sendMessage}
        />
      )}
    </div>
  );
};

export default Chat;
