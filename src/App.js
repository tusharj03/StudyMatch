import './Styles.css';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { db, auth } from "./firebase-config"
import { signOut } from 'firebase/auth';
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import User from "./pages/User";
import Chat from './pages/Chat'; 
import ClassChat from './utils/ClassChat';
import Toggle, { keepTheme } from "./utils/Toggle";
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const App = () =>  {
  

  const [isAuth, setIsAuth] = useState(localStorage.getItem("isAuth"));
  const [joinedClasses, setJoinedClasses] = useState([]);

  const signUserOut = () => {
    signOut(auth).then(() => {
      localStorage.clear();
      setIsAuth(false);
      window.location.pathname = "/";
    });
  };

  useEffect(() => {
    keepTheme();
  })

  useEffect(() => {
    // Fetch joined classes from local storage
    const storedJoinedClasses = localStorage.getItem("joinedClasses");
    if (storedJoinedClasses) {
      setJoinedClasses(JSON.parse(storedJoinedClasses));
    }
  
    // Fetch joined classes from Firestore when user is authenticated
    if (isAuth) {
      const fetchJoinedClasses = async () => {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setJoinedClasses(userData.joinedClasses || []);
          // Store joined classes in local storage
          localStorage.setItem("joinedClasses", JSON.stringify(userData.joinedClasses || []));
        }
      };
  
      fetchJoinedClasses();
    }
  }, [isAuth]);

  const handleJoinClass = (className) => {
    if (!joinedClasses.includes(className)) {
      // Update joinedClasses state
      setJoinedClasses(prevJoinedClasses => [...prevJoinedClasses, className]);
  
      // Update local storage with the updated joined classes
      const updatedJoinedClasses = [...joinedClasses, className];
      localStorage.setItem("joinedClasses", JSON.stringify(updatedJoinedClasses));
      
      // Update Firestore with joined class
      const userRef = doc(db, 'users', auth.currentUser.uid);
      updateDoc(userRef, {
        joinedClasses: updatedJoinedClasses
      });
    }
  };
  
  const handleLeaveClass = (className) => {
    if (joinedClasses.includes(className)) {
      // Filter out the class to leave
      const updatedJoinedClasses = joinedClasses.filter(c => c !== className);
      
      // Update joinedClasses state
      setJoinedClasses(updatedJoinedClasses);
  
      // Update local storage with the updated joined classes
      localStorage.setItem("joinedClasses", JSON.stringify(updatedJoinedClasses));
      
      // Update Firestore to remove the class
      const userRef = doc(db, 'users', auth.currentUser.uid);
      updateDoc(userRef, {
        joinedClasses: updatedJoinedClasses
      });
    }
  };

  return (
    <Router>
      <nav>
        {!isAuth ? (
          <div></div>
        ) : (
          <div className='sidebar'>
            <Link to="/home">Matches</Link>
            <Link to="/profile">Profile</Link>
            <Link to="/chat">Chat</Link>
            <Toggle id="themeToggleButton"></Toggle>
            <button id="logoutButton" className="button2" onClick={signUserOut}> Log Out </button>
            {/* Render joined classes in the sidebar */}
            {joinedClasses.map((className, index) => (
              <Link key={index} to={`/class/${className}`}>{className}</Link>
            ))}
          </div>
        )}
      </nav>
      
      <Routes>
        <Route path="/" element={<Login setIsAuth={setIsAuth}/>} />
        <Route path="/profile" element={<Profile isAuth={isAuth}/>} />
        <Route path="/home" element={<Home isAuth={isAuth}/>} />
        <Route path="/user/:id" element={<User isAuth={isAuth}/>} />
         {/* Render the Chat component with onJoinClass prop */}
         <Route path="/chat" element={<Chat isAuth={isAuth} onJoinClass={handleJoinClass} onLeaveClass={handleLeaveClass} />} />
        {/* Route to render class chat */}
        <Route path="/class/:className" element={<ClassChat onLeaveClass={handleLeaveClass} />} />
      </Routes>
    </Router>
  );
}

export default App;