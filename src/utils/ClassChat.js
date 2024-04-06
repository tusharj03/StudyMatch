import React, { useEffect, useState, useRef } from 'react';
import { auth, db, serverTimestamp, collection, addDoc, query, orderBy, onSnapshot, storage } from '../firebase-config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import '../Styles.css';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faUsers, faFileUpload, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const ClassChat = ({ onLeaveClass }) => {
  const navigate = useNavigate();
  const { className } = useParams();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);

  const messagesEndRef = useRef(null);
  const [lastMessage, setLastMessage] = useState('');

  const handleLeaveClass = () => {
    onLeaveClass(className);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Fetch messages from Firestore
    const chatRef = collection(db, `classChats/${className}/messages`);
    const q = query(chatRef, orderBy('timestamp'));
  
    const unsubscribeLastMessage = onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        setLastMessage(doc.data().message);
      });
    });

    const unsubscribeMessages = onSnapshot(q, async (querySnapshot) => {
      const updatedMessages = [];
      for (const doc of querySnapshot.docs) {
        const messageData = doc.data();
        // Fetch profile picture URL for each message
        const profilePicURL = await fetchProfilePic(messageData.userId);
        updatedMessages.push({ ...messageData, profilePicURL }); // Include profilePicURL in the message object
      }
      setMessages(updatedMessages);
      scrollToBottom();

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
      unsubscribeLastMessage();
    };
  }, [className]);
  
  const fetchProfilePic = async (userId) => {
    try {
      const docSnapshot = await getDoc(doc(db, 'users', userId)); // Get the document for the specific user
      if (docSnapshot.exists()) {
        return docSnapshot.data().profilePicURL; // Return the profilePicURL if the user exists
      } else {
        console.log("User document does not exist");
        return null;
      }
    } catch (error) {
      console.error("Error fetching profile picture:", error);
      return null;
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() !== '' || selectedFile) {
      try {
        const timestamp = serverTimestamp();
        const profilePicURL = await fetchProfilePic(auth.currentUser.uid);
        if (selectedFile) {
          await handleFileUpload(timestamp);
        } else {
          // Add the new text message to Firestore
          await addDoc(collection(db, `classChats/${className}/messages`), {
            message: newMessage,
            displayName: auth.currentUser.displayName,
            userId: auth.currentUser.uid,
            timestamp: timestamp,
          });
        }
        setNewMessage('');
        setSelectedFile(null);
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

  const handleFileUpload = async (timestamp) => {
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
            messageContent = `<img src="${fileUrl}" alt="${fileName}" class="chat-image"/>`;
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
          timestamp: timestamp,
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
  
  const toggleParticipantsList = () => {
    setShowParticipants(!showParticipants);
  };

  const handleFileInputChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setNewMessage(e.target.files[0].name); // Display file name in the input
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="background-container">
    <div className={`class-chat-container ${showParticipants ? 'show-participants' : ''}`}>
      <div className="class-chat-main">
      <h2 style={{ fontFamily: '' /* other styles */ }}>
  {window.innerWidth > 760 ? (
    <>Class Chat: {className}</>
  ) : (
    className
  )}
</h2>
      <hr style={{ border: '1px solid #ccc', margin: '20px 0' }} />
      <button className="leave-class-button" onClick={handleLeaveClassClick}>
  {window.innerWidth > 760 ? (
    <>
      <FontAwesomeIcon icon={faSignOutAlt} /> Leave
    </>
  ) : (
    <FontAwesomeIcon icon={faSignOutAlt} />
  )}
</button>
<button className="participants-toggle-button" onClick={toggleParticipantsList}>
  {window.innerWidth > 760 ? (
    <>
      <FontAwesomeIcon icon={faUsers} /> &nbsp; {showParticipants ? "  Hide Participants" : "  View Participants"}
    </>
  ) : (
    <FontAwesomeIcon icon={faUsers} />
  )}
</button>
        
        <div className="messages-section">
          <div className="class-chat-messages">
            {messages.map((message, index) => (
              <div key={index} className="class-chat-message">
              <div className="message-info">
                <div className="profile-pic-container">
                  {message.profilePicURL ? (
                    <img src={message.profilePicURL} alt="Profile" className="profile-pic-small" />
                  ) : (
                    <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" alt="Default Profile" className="profile-pic-small" />
                  )}
                </div>
                <div className="user-message-container">
                  <strong>
                    {/* Wrap username with Link */}
                    <Link to={`/user/${message.userId}`} style={{ textDecoration: 'none' }}>
                      <p id="userDisplayNameChat">{message.displayName}:</p>
                    </Link>
                  </strong>
                  <div dangerouslySetInnerHTML= {{ __html: message.message }}></div>
                </div>
              </div>
            </div>
                               
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="send-message-section">
            <input
             className="class-chat-input"
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress} // Call handleKeyPress on key press
              placeholder="Type your message..."
            />
            <div className="file-upload-section">
            <label htmlFor="file-upload" className="upload-chat-button"> <FontAwesomeIcon icon={faFileUpload} /></label>
            <input
              id="file-upload"
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileInputChange}
            />
          </div>
            <button className="class-chat-button" onClick={handleSendMessage}> <FontAwesomeIcon icon={faPaperPlane} /> </button>
            
          
            
          </div>
        </div>
      </div>
      {showParticipants && (
        <div className="participants-section">
          <h3>Participants:</h3>
          <ul className="participants-list">
          {participants.map((participant, index) => (
  <li key={index}>
    <Link to={`/user/${participant.userId}`} style={{ textDecoration: 'none' }}>
    <p id="userDisplayNameChat">{participant.displayName}</p>
    </Link>
  </li>
))}
          </ul>
        </div>
      )}
    </div>
    </div>
  );
};  

export default ClassChat;