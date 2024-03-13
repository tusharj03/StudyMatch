import React, { useEffect, useState } from 'react';
import { auth, db, serverTimestamp, collection, addDoc, query, orderBy, onSnapshot } from '../firebase-config';
import '../Styles.css';
import { useParams } from 'react-router-dom';

const ClassChat = ({ onLeaveClass }) => {
  const { className } = useParams();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false);

  useEffect(() => {
    const chatRef = collection(db, `classChats/${className}/messages`);
    const q = query(chatRef, orderBy('timestamp'));
  
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const updatedMessages = [];
      querySnapshot.forEach((doc) => {
        updatedMessages.push(doc.data());
      });
      setMessages(updatedMessages);
    });
  
    const participantsRef = collection(db, `classChats/${className}/participants`);
    const participantsUnsubscribe = onSnapshot(participantsRef, (querySnapshot) => {
      const updatedParticipants = [];
      querySnapshot.forEach((doc) => {
        updatedParticipants.push(doc.data());
      });
      console.log("Fetched participants:", updatedParticipants); // Log fetched participants
      setParticipants(updatedParticipants);
    });
  
    return () => {
      unsubscribe();
      participantsUnsubscribe();
    };
  }, [className]);
  

  const handleSendMessage = async () => {
    if (newMessage.trim() !== '') {
      try {
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

  const toggleParticipants = () => {
    setShowParticipants(!showParticipants);
  };

  return (
    <div className="class-chat-container">
      <h2>Class Chat: {className}</h2>
      <div>
        <button onClick={toggleParticipants}>
          {showParticipants ? 'Hide Participants' : 'Show Participants'}
        </button>
        {showParticipants && (
          <div>
            <h3>Participants:</h3>
            <ul>
              {participants.map((participant, index) => (
                <li key={index}>{participant.displayName}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div>
        {messages.map((message, index) => (
          <div key={index} className="class-chat-message">
            <strong>{message.displayName}: </strong>{message.message}
          </div>
        ))}
      </div>
      <div>
        <input
          className="class-chat-input"
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button className="class-chat-button" onClick={handleSendMessage}>Send</button>
        <button className="class-chat-button" onClick={handleLeaveClassClick}>Leave Class</button>
      </div>
    </div>
  );
};

export default ClassChat;
