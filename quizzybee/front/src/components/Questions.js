import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Questions.css";

function Questions() {
  const [questions, setQuestions] = useState([]);
  const selectedCategory = JSON.parse(localStorage.getItem("selectedCategory"));
  const [resultMessage, setResultMessage] = useState("");
  const [disableButtons, setDisableButtons] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(20);
  const [responses, setResponses] = useState([]);
  const [score, setScore] = useState(0);
  const [audio, setAudio] = useState(null);
  const [correctAudio, setCorrectAudio] = useState(null);
  const [wrongAudio, setWrongAudio] = useState(null);
  const [timeoutAudio, setTimeoutAudio] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/questions");
        const filteredQuestions = response.data.filter(
          (question) => question.categorie === selectedCategory
        );
        setQuestions(filteredQuestions);
        localStorage.setItem(
          "filteredQuestions",
          JSON.stringify(filteredQuestions)
        );
        console.log("Retrieved questions:", filteredQuestions);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    if (selectedCategory) {
      fetchQuestions();
    }
  }, [selectedCategory]);

  useEffect(() => {
    let interval;

    if (!disableButtons && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setDisableButtons(true);
      setResultMessage("Timed Out");
    }

    return () => clearInterval(interval);
  }, [disableButtons, timer]);

  useEffect(() => {
    if (currentQuestionIndex < questions.length) {
      const question = questions[currentQuestionIndex];
      const availableResponses = Object.keys(question)
        .filter((key) => key.startsWith("reponse") && key !== "reponse1")
        .map((key) => question[key]);

      const randomFalseResponses = generateRandomFalseResponses(
        availableResponses,
        3
      ); // Set the number of false responses required
      const shuffledResponses = shuffleArray([
        question.reponse1,
        ...randomFalseResponses,
      ]);
      setResponses(shuffledResponses);
    }
  }, [currentQuestionIndex, questions]);

  useEffect(() => {
    if (currentQuestionIndex > 0) {
      resetAnswerButtons();
    }
  }, [currentQuestionIndex]);

  useEffect(() => {
    // Load the audio files
    const loadAudio = async () => {
      try {
        const audioElement = new Audio("assets/think.mp3");
        const correctAudioElement = new Audio("assets/good.mp3");
        const wrongAudioElement = new Audio("assets/wrong.mp3");
        const timeoutAudioElement = new Audio("assets/wrong.mp3");

        setAudio(audioElement);
        setCorrectAudio(correctAudioElement);
        setWrongAudio(wrongAudioElement);
        setTimeoutAudio(timeoutAudioElement);

        // Reset the audio elements when they finish playing
        audioElement.addEventListener("ended", () => {
          audioElement.currentTime = 0;
        });
        correctAudioElement.addEventListener("ended", () => {
          correctAudioElement.currentTime = 0;
        });
        wrongAudioElement.addEventListener("ended", () => {
          wrongAudioElement.currentTime = 0;
        });
        timeoutAudioElement.addEventListener("ended", () => {
          timeoutAudioElement.currentTime = 0;
        });
      } catch (error) {
        console.error("Error loading audio:", error);
      }
    };

    loadAudio();

    return () => {
      // Clean up the audio elements
      if (audio) {
        audio.removeEventListener("ended", () => {});
      }
      if (correctAudio) {
        correctAudio.removeEventListener("ended", () => {});
      }
      if (wrongAudio) {
        wrongAudio.removeEventListener("ended", () => {});
      }
      if (timeoutAudio) {
        timeoutAudio.removeEventListener("ended", () => {});
      }
    };
  }, []);

  useEffect(() => {
    // Play the sound when currentQuestionIndex changes
    if (audio && currentQuestionIndex < questions.length) {
      audio.play();
    }
  }, [audio, currentQuestionIndex, questions]);

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const generateRandomFalseResponses = (availableResponses, count) => {
    const falseResponses = [];
    while (falseResponses.length < count) {
      const randomIndex = Math.floor(Math.random() * availableResponses.length);
      const randomResponse = availableResponses[randomIndex];
      if (!falseResponses.includes(randomResponse)) {
        falseResponses.push(randomResponse);
      }
    }
    return falseResponses;
  };

  const resetAnswerButtons = () => {
    const buttons = document.querySelectorAll(".questions-button");
    buttons.forEach((button) => {
      button.style.backgroundColor = "";
    });
  };

  const handleResponseClick = (response, question) => {
    if (disableButtons) {
      return;
    }

    setDisableButtons(true);
    audio.pause(); // Pause the audio

    if (response === question.reponse1) {
      setResultMessage("Correct answer!");
      setScore((prevScore) => prevScore + 1);
      const selectedButton = document.querySelector(
        `button.questions-button[value="${response}"]`
      );
      selectedButton.style.backgroundColor = "#2ab839";
      selectedButton.style.color = "#ffffff"; // Set text color to white for correct answer
      correctAudio.play(); // Play the correct answer sound
    } else {
      setResultMessage("Wrong answer!");
      const selectedButton = document.querySelector(
        `button.questions-button[value="${response}"]`
      );
      selectedButton.style.backgroundColor = "#b03636";
      selectedButton.style.color = "#ffffff"; // Set text color to white for wrong answer
      const correctButton = document.querySelector(
        `button.questions-button[value="${question.reponse1}"]`
      );
      correctButton.style.backgroundColor = "#2ab839";
      correctButton.style.color = "#ffffff"; // Set text color to white for correct answer
      const falseButtons = document.querySelectorAll(
        ".questions-button:not([value='" + question.reponse1 + "'])"
      );
      falseButtons.forEach((button) => {
        button.style.backgroundColor = "#b03636";
        button.style.color = "#ffffff"; // Set text color to white for wrong answer
      });
      wrongAudio.play(); // Play the wrong answer sound
    }
  };

  const handleNextQuestionClick = () => {
    setDisableButtons(false);
    setResultMessage("");
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    setTimer(20);

    if (currentQuestionIndex === questions.length - 1) {
      const userID = localStorage.getItem("userId");
      const scoreToPost = score;
      const selectedCategory = JSON.parse(
        localStorage.getItem("selectedCategory")
      );

      // Send the score, player ID, and category to the database
      axios
        .post(
          `http://localhost:8000/api/parties?idjoueur=${userID}&score=${scoreToPost}&category=${selectedCategory}`
        )
        .then((response) => {
          console.log("Score posted successfully:", response.data);
        })
        .catch((error) => {
          console.error("Error posting score:", error);
        });
    }
  };

  return (
    <div className="questions-container">
      <h1 className="title">Questions</h1>
      {currentQuestionIndex < questions.length && (
        <h1 className="question-timer">{timer}</h1>
      )}
      {currentQuestionIndex < questions.length ? (
        <div className="questions-hero">
          <h3 className="subtitle">
            {questions[currentQuestionIndex].question}
          </h3>
          <ul className="questions-box">
            {responses.map((response, index) => (
              <li className="questions-list" key={index}>
                <button
                  className="questions-button"
                  onClick={() =>
                    handleResponseClick(
                      response,
                      questions[currentQuestionIndex]
                    )
                  }
                  disabled={disableButtons}
                  value={response}
                >
                  {response}
                </button>
              </li>
            ))}
          </ul>
          {resultMessage && <p className="question-result">{resultMessage}</p>}
          <button
            className="next-question"
            onClick={handleNextQuestionClick}
            disabled={!disableButtons}
          >
            Next Question
          </button>
          <p className="current-question">
            Question {currentQuestionIndex + 1}/{questions.length}
          </p>
          <p className="score-text">
            Score <span className="score-number">{score}</span>
          </p>
        </div>
      ) : (
        <div className="resultBox">
          <p className="finalText">Your score is</p>
          <span className="finalScore">{score} </span>
          <Link className="normal-button scoreboardLink" to="/scoreboard">
            🐝 View Scoreboard 🐝
          </Link>
        </div>
      )}
    </div>
  );
}

export default Questions;
