import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const audio = new Audio("/assets/menu.mp3");

  // Play the song when the component mounts
  useEffect(() => {
    audio.play();
  }, []);

  // Pause the song when the component unmounts
  useEffect(() => {
    return () => {
      audio.pause();
    };
  }, []);

  const redirectToCategory = () => {
    navigate("/category");
  };

  const [isPlusPopupOpen, setIsPlusPopupOpen] = useState(false);
  const [isBracketPopupOpen, setIsBracketPopupOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // New state for the edit user modal
  const [users, setUsers] = useState([]);
  const [loginError, setLoginError] = useState(false);
  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState(null); // New state to store user data

  useEffect(() => {
    // Fetch all users when the component mounts
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/users");
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    // Fetch the signed-in user's data when the component mounts or when the user ID changes
    const fetchUser = async () => {
      const userId = localStorage.getItem("userId");

      try {
        const response = await axios.get(
          `http://localhost:8000/api/users/${userId}`
        );
        setUserData(response.data);
        setUsername(response.data.name);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUser();
  }, []);

  const openPlusPopup = () => {
    setIsPlusPopupOpen(true);
  };

  const closePlusPopup = () => {
    setIsPlusPopupOpen(false);
  };

  const openBracketPopup = () => {
    setIsBracketPopupOpen(true);
  };

  const closeBracketPopup = () => {
    setIsBracketPopupOpen(false);
    setLoginError(false);
  };

  const openEditModal = () => {
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleSignUp = async (event) => {
    event.preventDefault();

    const newUsername = event.target.username.value;
    const newEmail = event.target.email.value;
    const newPassword = event.target.password.value;

    try {
      const response = await axios.post("http://localhost:8000/api/users", {
        name: newUsername,
        email: newEmail,
        password: newPassword,
      });

      console.log("Sign-up successful:", response.data);

      // Clear form inputs
      event.target.reset();

      // Close the sign-up popup
      closePlusPopup();

      // Refresh the page to fetch the updated user list
      window.location.reload();
    } catch (error) {
      console.error("Sign-up error:", error);
    }
  };

  const handleSignIn = async (event) => {
    event.preventDefault();

    const username = event.target.username.value;
    const password = event.target.password.value;

    const user = users.find(
      (user) => user.name === username && user.password === password
    );

    if (user) {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/users/${user.id}`
        );
        const userData = response.data;
        localStorage.setItem("userId", user.id);
        console.log("Sign-in successful. User ID:", user.id);
        closeBracketPopup();
        setUsername(userData.name);
        setUserData(userData); // Update the user data
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    } else {
      setLoginError(true);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("userId");
    setUsername("");
    setUserData(null); // Clear the user data
  };

  const handleEditUser = async (event) => {
    event.preventDefault();

    const newUsername = event.target.username.value;
    const newEmail = event.target.email.value;
    const newPassword = event.target.password.value;

    try {
      const url = `http://localhost:8000/api/users/${userData.id}`;
      const response = await axios.put(url, {
        name: newUsername,
        email: newEmail,
        password: newPassword,
      });

      console.log("User edit successful:", response.data);

      // Clear form inputs
      event.target.reset();

      // Close the edit user modal
      closeEditModal();

      // Refresh the page to fetch updated user data
      window.location.reload();
    } catch (error) {
      console.error("User edit error:", error);
    }
  };

  return (
    <div className="home-container">
      <img className="logo" src="/assets/Logo.png" alt="QuizzyBee Logo" />
      <h1 className="title">QuizzyBee</h1>
      <div className="button-container">
        {username ? (
          <>
            <Link to="/scoreboard">
              <div className="hex-button">
                <i className="fa-solid fa-trophy"></i>
              </div>
            </Link>
            <div className="hex-button" onClick={openEditModal}>
              <i className="fa-solid fa-user-edit"></i>
            </div>
            <div className="hex-button" onClick={handleSignOut}>
              <i className="fa-solid fa-sign-out"></i>
            </div>
          </>
        ) : (
          <>
            <div className="hex-button" onClick={openBracketPopup}>
              <i className="fa-solid fa-sign-in"></i>
            </div>
            <div className="hex-button" onClick={openPlusPopup}>
              <i className="fa-solid fa-user-plus"></i>
            </div>
          </>
        )}
      </div>
      <button className="normal-button" onClick={redirectToCategory}>
        START
      </button>

      {isPlusPopupOpen && (
        <div className="popup">
          <div className="popup-header">
            <h4 className="popup-title">Sign Up</h4>
            <button onClick={closePlusPopup} className="popup-close">
              <i className="fa-solid fa-xmark custom-xmark"></i>
            </button>
          </div>
          <form onSubmit={handleSignUp} className="popup-form">
            <label className="popup-label" htmlFor="username">
              Username
            </label>
            <input
              className="popup-input"
              type="text"
              id="username"
              name="username"
              required
            />
            <label className="popup-label" htmlFor="password">
              Password
            </label>
            <input
              className="popup-input"
              type="password"
              id="password"
              name="password"
              required
            />
            <label className="popup-label" htmlFor="email">
              Email
            </label>
            <input
              className="popup-input"
              type="email"
              id="email"
              name="email"
              required
            />
            <button type="submit" className="popup-button">
              Sign Up
            </button>
          </form>
        </div>
      )}

      {isBracketPopupOpen && (
        <div className="popup">
          <div className="popup-header">
            <h4 className="popup-title">Sign In</h4>
            <button onClick={closeBracketPopup} className="popup-close">
              <i className="fa-solid fa-xmark custom-xmark"></i>
            </button>
          </div>
          <form onSubmit={handleSignIn} className="popup-form">
            <label className="popup-label" htmlFor="username">
              Username
            </label>
            <input
              className="popup-input"
              type="text"
              id="username"
              name="username"
              required
            />
            <label className="popup-label" htmlFor="password">
              Password
            </label>
            <input
              className="popup-input"
              type="password"
              id="password"
              name="password"
              required
            />
            {loginError && (
              <p className="login-error">Incorrect username or password.</p>
            )}
            <button type="submit" className="popup-button">
              Sign In
            </button>
          </form>
        </div>
      )}

      {isEditModalOpen && (
        <div className="popup">
          <div className="popup-header">
            <h4 className="popup-title">Edit User</h4>
            <button onClick={closeEditModal} className="popup-close">
              <i className="fa-solid fa-xmark custom-xmark"></i>
            </button>
          </div>
          <form onSubmit={handleEditUser} className="popup-form">
            <label className="popup-label" htmlFor="username">
              Username
            </label>
            <input
              className="popup-input"
              type="text"
              id="username"
              name="username"
              defaultValue={userData.name} // Set default value to current username
              required
            />
            <label className="popup-label" htmlFor="password">
              Password
            </label>
            <input
              className="popup-input"
              type="password"
              id="password"
              name="password"
              defaultValue={userData.password} // Set default value to current password
              required
            />
            <label className="popup-label" htmlFor="email">
              Email
            </label>
            <input
              className="popup-input"
              type="email"
              id="email"
              name="email"
              defaultValue={userData.email} // Set default value to current email
              required
            />
            <button type="submit" className="popup-button">
              Edit
            </button>
          </form>
        </div>
      )}

      {username && <p>Welcome, {username}!</p>}
    </div>
  );
}

export default Home;
