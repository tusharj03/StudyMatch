// ClassChat.js

import React, { useEffect, useState } from 'react';
import { auth, db, serverTimestamp, collection, addDoc, query, orderBy, onSnapshot } from '../firebase-config';
import '../Styles.css';
import { useParams } from 'react-router-dom';

const ClassChat = ({ onLeaveClass }) => {
  const { className } = useParams();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);

  const handleLeaveClass = () => {
    onLeaveClass(className);
  };

  useEffect(() => {
    // Fetch messages from Firestore
    const chatRef = collection(db, `classChats/${className}/messages`);
    const q = query(chatRef, orderBy('timestamp'));
  
    const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
      const updatedMessages = [];
      querySnapshot.forEach((doc) => {
        updatedMessages.push(doc.data());
      });
      setMessages(updatedMessages);
    });
  
    // Fetch participants from Firestore
    const participantsRef = collection(db, `classChats/${className}/participants`);
    const unsubscribeParticipants = onSnapshot(participantsRef, (querySnapshot) => {
      const updatedParticipants = [];
      querySnapshot.forEach((doc) => {
        updatedParticipants.push(doc.data());
      });
      setParticipants(updatedParticipants);
    });
  
    return () => {
      unsubscribeMessages();
      unsubscribeParticipants();
    };
  }, [className]);
  

  const handleSendMessage = async () => {
    if (newMessage.trim() !== '') {
      try {
        // Add the new message to Firestore
        await addDoc(collection(db, `classChats/${className}/messages`), {
          message: newMessage,
          displayName: auth.currentUser.displayName,
          timestamp: serverTimestamp()
        });
        setNewMessage('');
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleLeaveClassClick = () => {
    onLeaveClass(className);
  };

  return (
    <div className="class-chat-container"> {/* Add class name to the container */}
      <h2>Class Chat: {className}</h2>
      <div>
        <h3>Participants:</h3>
        <ul>
          {participants.map((participant, index) => (
            <li key={index}>{participant.displayName}</li>
          ))}
        </ul>
      </div>
      <div>
        {messages.map((message, index) => (
          <div key={index} className="class-chat-message"> {/* Add class name to messages */}
            <strong>{message.displayName}: </strong>{message.message}
          </div>
        ))}
      </div>
      <div>
        <input
          className="class-chat-input" // Add class name to the input field
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button className="class-chat-button" onClick={handleSendMessage}>Send</button> {/* Add class name to the button */}
        <button className="class-chat-button" onClick={handleLeaveClassClick}>Leave Class</button>
      </div>
    </div>
  );
};

export default ClassChat;
