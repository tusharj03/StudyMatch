// ClassChat.js

import React, { useEffect, useState } from 'react';
import { auth, db, serverTimestamp, collection, addDoc, query, orderBy, onSnapshot, storage } from '../firebase-config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import '../Styles.css';
import { useParams, useNavigate } from 'react-router-dom';
import { getDocs, deleteDoc } from 'firebase/firestore';

const ClassChat = ({ onLeaveClass }) => {
  const navigate = useNavigate();
  const { className } = useParams();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

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

  const handleLeaveClassClick = async () => {
    onLeaveClass(className);
    try {
      // Remove the participant from Firestore
      const participantRef = collection(db, `classChats/${className}/participants`);
      const querySnapshot = await getDocs(participantRef);
      querySnapshot.forEach(async (doc) => {
        if (doc.data().userId === auth.currentUser.uid) {
          await deleteDoc(doc.ref);
        }
      });
      // Trigger a re-render by updating state or using onSnapshot()
      // Optionally, you can also navigate the user back to the chat selection page or perform any other desired actions.
      navigate('/chat');
    } catch (error) {
      console.error("Error leaving class:", error);
    }
  };

  const handleFileUpload = async () => {
    if (selectedFile) {
      try {
        const fileName = selectedFile.name;
        const fileRef = ref(storage, `classChats/${className}/${fileName}`);
        await uploadBytes(fileRef, selectedFile);
        const fileUrl = await getDownloadURL(fileRef);
  
        // Determine the file type based on its extension
        const fileType = fileName.split('.').pop().toLowerCase();
  
        let messageContent;
  
        // Handle different file types accordingly
        switch (fileType) {
          case 'txt':
          case 'md':
            // For text files, read the content
            const textResponse = await fetch(fileUrl);
            messageContent = await textResponse.text();
            break;
          case 'jpg':
          case 'jpeg':
          case 'png':
          case 'gif':
            // For image files, display the image directly
            messageContent = `<img src="${fileUrl}" alt="${fileName}" style="max-width: 100%;"/>`;
            break;
          default:
            // For other file types (e.g., PDF, DOCX), display a download link
            messageContent = `<a href="${fileUrl}" target="_blank" rel="noopener noreferrer">${fileName}</a>`;
            break;
        }
  
        // Construct a message object with the file content
        const messageObject = {
          message: messageContent,
          displayName: auth.currentUser.displayName,
          timestamp: serverTimestamp(),
          fileUrl: fileUrl,
          fileName: fileName
        };
  
        // Add the message object to Firestore
        await addDoc(collection(db, `classChats/${className}/messages`), messageObject);
  
        // Clear selected file after upload
        setSelectedFile(null);
  
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    } else {
      console.error("No file selected.");
    }
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
        <div key={index} className="class-chat-message">
          <strong>{message.displayName}: </strong>
          <div dangerouslySetInnerHTML={{ __html: message.message }}></div>
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
        <div>
  <input
    type="file"
    onChange={(e) => setSelectedFile(e.target.files[0])}
  />
  <button className="class-chat-button" onClick={handleFileUpload}>Upload File</button>
</div>
      </div>
    </div>
  );
};

export default ClassChat;
