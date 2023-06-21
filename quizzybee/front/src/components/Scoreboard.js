import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Scoreboard.css";

function Scoreboard() {
  const [scores, setScores] = useState([]);
  const [displayAllScores, setDisplayAllScores] = useState(false);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [audio, setAudio] = useState(null); // Added audio state

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/parties");
        const scores = response.data;

        if (!displayAllScores) {
          const userID = localStorage.getItem("userId");
          setScores(
            scores.filter((score) => score.idjoueur === parseInt(userID))
          );
        } else {
          setScores(scores);
        }
        console.log("Retrieved scores:", scores);
      } catch (error) {
        console.error("Error fetching scores:", error);
      }
    };

    fetchScores();
  }, [displayAllScores]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/users");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/categories"
        );
        const categoriesData = response.data;
        setCategories(categoriesData);
        console.log("Retrieved categories:", categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchUsers();
    fetchCategories();

    // Cleanup function to stop the audio when leaving the page
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, []);

  useEffect(() => {
    const newAudio = new Audio("assets/highscore.mp3"); // Replace with the actual path to your background song

    newAudio.addEventListener("ended", () => {
      newAudio.currentTime = 0;
      newAudio.play();
    });

    newAudio.play();

    // Update the audio state
    setAudio(newAudio);

    // Cleanup function to remove event listener and pause the audio when leaving the page
    return () => {
      newAudio.removeEventListener("ended", () => {});
      newAudio.pause();
    };
  }, []);

  const handleDisplayAllScoresClick = () => {
    setDisplayAllScores(!displayAllScores);
  };

  const getUserName = (userId) => {
    const user = users.find((user) => user.id === userId);
    return user ? user.name : "";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const filterScoresByCategory = () => {
    let filteredScores = scores;

    if (selectedCategory !== "") {
      filteredScores = filteredScores.filter(
        (score) => score.category === selectedCategory
      );
    }

    // Sort scores by the most recent date
    filteredScores.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);

      return dateB - dateA;
    });

    return filteredScores;
  };

  return (
    <div className="scoreboard-container">
      <h1 className="title">Scoreboard</h1>
      <button
        className="display-all-scores-button normal-button"
        onClick={handleDisplayAllScoresClick}
      >
        {displayAllScores ? "Show My Scores" : "Show All Scores"}
      </button>
      <div className="category-filter">
        <label htmlFor="category-select">Choose a category</label>
        <select
          className="category-dropdown custom-dropdown"
          value={selectedCategory}
          onChange={handleCategoryChange}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option
              className="custom-dropdown-result"
              key={category.id}
              value={category.categorie}
            >
              {category.categorie}
            </option>
          ))}
        </select>
      </div>
      {scores.length > 0 ? (
        <div className="score-table-container">
          <table className="score-table">
            <thead>
              <tr>
                <th>Player Name</th>
                <th>Score</th>
                <th>Category</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filterScoresByCategory().map((score) => (
                <tr key={score.id}>
                  <td>{getUserName(score.idjoueur)}</td>
                  <td>{score.score}</td>
                  <td>{score.category}</td>
                  <td>{formatDate(score.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="scoreboardError">🐝 Logged in to see your history.</p>
      )}
      <Link className="normal-button homeLink" to="/">
        Return to Home
      </Link>
    </div>
  );
}

export default Scoreboard;
