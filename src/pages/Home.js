// Home.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase-config";
import { Link } from "react-router-dom";
import { getDocs, collection } from 'firebase/firestore';
import '../Styles.css';
import { classOptions } from '../utils/class-options';

const Home = ({ isAuth }) => {
  let navigate = useNavigate();
  const [usersList, setUsersList] = useState([]); 
  const [searchQuery, setSearchQuery] = useState('');
  const usersColRef = collection(db, "users");
  let myClasses = [];
  let myMajor = "";

  useEffect(() => {
    if (!isAuth) {
      navigate("/");
    }
  }, []);

  useEffect(() => {
    getDocs(usersColRef)
    .then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        if (doc.id === auth.currentUser.uid) {
          myClasses = doc.data().classes;
          myMajor = doc.data().major;
        }
      });
    })
    .catch(err => {
      console.log(err);
    });
  }, []);

  const getMatchPoints = (myClasses, theirClasses, myMajor, theirMajor) => {
    if (myMajor === theirMajor) {
      return myClasses.filter(c => theirClasses.includes(c)).length + 1;
    } else {
      return myClasses.filter(c => theirClasses.includes(c)).length;
    }
  }

  useEffect(() => {
    const getUsers = async () => {
      const data = await getDocs(usersColRef);
      const filteredUsers = data.docs
        .filter(doc => doc.id !== auth.currentUser.uid)
        .map((doc) => ({
          ...doc.data(),
          id: doc.id,
          matchPoints: getMatchPoints(myClasses, doc.data().classes, myMajor, doc.data().major)
        }))
        .filter(user => 
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          user.major.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.classes.some(cls => cls.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      setUsersList(filteredUsers);
    } 
    getUsers();
  }, [searchQuery]);

  usersList.sort((a, b) => {
    if (a.matchPoints > b.matchPoints) {
      return -1;
    } else if (a.matchPoints < b.matchPoints) {
      return 1;
    } else {
      return 0;
    }
  })

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className='page'>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for users..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      <h1 className='title'>My Matches</h1>
      {usersList.map((user) => (
        <div className="matchesUserBox" key={user.id}>
          <Link to={`/user/${user.id}`} style={{ textDecoration: 'none' }}>
            <h2 id="userDisplayName" style={{ wordBreak: 'break-word' }}>{user.name}</h2> 
            <img src={user.profilePicURL ? user.profilePicURL : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} alt="Profile Picture" className="profile-pic" />
          </Link>
          <br/>
          <div id="userContentMajor" className="userContent" style={{ wordBreak: 'break-word' }}>
  <b>{user.major}</b>
</div>

          <br/>

          <div id="userClasses" className="userSection">
            <b className="userContentHeader">Classes</b>
            <div id="userContentClasses" className="userContent">{user.classes.join(", ")}</div>
          </div>
          <br/>

          <div id="userBio" className="userSection">
            <b className="userContentHeader">About</b>
            <div id="userContentBio" className="userContent" style={{ wordBreak: 'break-word' }}>{user.bio}</div>
          </div>
          
        </div>
      ))}
    </div>
  )
}

export default Home;