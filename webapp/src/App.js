import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons"; // Correct import for Github icon
import {
  faComment,
  faRetweet,
  faHeart,
  faShareSquare,
} from "@fortawesome/free-solid-svg-icons";
import ReactGA from "react-ga";
import logo from './default.png';

import "./App.css";

function App() {
  // Initialize Google Analytics
  useEffect(() => {
    ReactGA.initialize("G-SZEJEE5GGC");
    ReactGA.pageview(window.location.pathname);
  }, []);

  const [generatedTweets, setGeneratedTweets] = useState([]); // List for feed
  const [darkMode, setDarkMode] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

  // Utility function to format timestamps
  const formatTimestamp = (createdAt) => {
    const now = new Date();
    const diffInMs = now - new Date(createdAt);
    const diffInMinutes = Math.floor(diffInMs / 60000);
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  };

  // Fetch a new tweet at regular intervals
  useEffect(() => {
    const intervalId = setInterval(() => {
      generateTweet();
    }, 5000); // Fetch a new tweet every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  const generateTweet = () => {
    axios
      .post(`${API_URL}/generate-banger`, {
        originalText: "This is a simulated tweet idea", // Can be made dynamic
      })
      .then((response) => {
        if (response.status !== 200) {
          throw new Error(`Request failed with status code ${response.status}`);
        }
        return response.data;
      })
      .then((data) => {
        if (data && typeof data.banger === "string") {
          setGeneratedTweets((prevTweets) => [
            {
              id: Date.now(),
              avatar: "/default.png",
              username: "anon",
              handle: "@anon",
              createdAt: new Date(), // Store the timestamp
              text: data.banger,
              comments: Math.floor(Math.random() * 100),
              reposts: Math.floor(Math.random() * 50),
              likes: Math.floor(Math.random() * 200),
            }, // New tweet at the top
            ...prevTweets,
          ]);
        } else {
          setGeneratedTweets((prevTweets) => [
            {
              id: Date.now(),
              avatar: "https://via.placeholder.com/50",
              username: "error_user",
              handle: "@error_handle",
              createdAt: new Date(),
              text: "Error generating banger tweet.",
              comments: 0,
              reposts: 0,
              likes: 0,
            },
            ...prevTweets,
          ]);
        }
      })
      .catch((error) => {
        console.error("An error occurred:", error);
        setGeneratedTweets((prevTweets) => [
          {
            id: Date.now(),
            avatar: "https://via.placeholder.com/50",
            username: "error_user",
            handle: "@error_handle",
            createdAt: new Date(),
            text: "Error generating banger tweet.",
            comments: 0,
            reposts: 0,
            likes: 0,
          },
          ...prevTweets,
        ]);
      });
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (darkMode) {
      document.documentElement.style.setProperty(
        "--background-color",
        "var(--light-background-color)"
      );
      document.documentElement.style.setProperty(
        "--text-color",
        "var(--light-text-color)"
      );
      document.documentElement.style.setProperty(
        "--panel-background",
        "var(--light-panel-background)"
      );
      document.documentElement.style.setProperty(
        "--button-background",
        "var(--light-button-background)"
      );
      document.documentElement.style.setProperty(
        "--button-text",
        "var(--light-button-text)"
      );
      document.documentElement.style.setProperty(
        "--border-color",
        "var(--light-border-color)"
      );
      document.documentElement.style.setProperty(
        "--logo-text-color",
        "var(--light-logo-text-color)"
      );
    } else {
      document.documentElement.style.setProperty(
        "--background-color",
        "var(--dark-background-color)"
      );
      document.documentElement.style.setProperty(
        "--text-color",
        "var(--dark-text-color)"
      );
      document.documentElement.style.setProperty(
        "--panel-background",
        "var(--dark-panel-background)"
      );
      document.documentElement.style.setProperty(
        "--button-background",
        "var(--dark-button-background)"
      );
      document.documentElement.style.setProperty(
        "--button-text",
        "var(--dark-button-text)"
      );
      document.documentElement.style.setProperty(
        "--border-color",
        "var(--dark-border-color)"
      );
      document.documentElement.style.setProperty(
        "--logo-text-color",
        "var(--dark-logo-text-color)"
      );
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} alt="Logo" className="App-logo" />
        <div className="logo-container">
          <h1 className="text-logo">intern.gg</h1>
        </div>
        <div className="content-container">
          {/* Display the feed of generated tweets */}
          <div className="generated-tweet-container">
            {generatedTweets.length > 0 ? (
              <div className="tweet-feed">
                {generatedTweets.map((tweet) => (
                  <div key={tweet.id} className="tweet-item">
                    <div className="tweet-header">
                      <img
                        src={tweet.avatar}
                        alt="avatar"
                        className="tweet-avatar"
                      />
                      <div className="tweet-user-info">
                        <span className="tweet-username">{tweet.username}</span>
                        <div className="tweet-handle-container">
                        <span className="tweet-handle">{tweet.handle} ·</span>
                        <span className="tweet-timestamp">{formatTimestamp(tweet.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <p
                      className="tweet-text"
                      style={{
                        color:
                          tweet.text.startsWith("Error") ? "darkred" : "inherit",
                      }}
                    >
                      {tweet.text}
                    </p>

                    <div className="tweet-actions">
                      {/* Comments */}
                      <div className="tweet-action-item">
                        <FontAwesomeIcon icon={faComment} />
                        <span>{tweet.comments}</span>
                      </div>

                      {/* Reposts */}
                      <div className="tweet-action-item">
                        <FontAwesomeIcon icon={faRetweet} />
                        <span>{tweet.reposts}</span>
                      </div>

                      {/* Likes */}
                      <div className="tweet-action-item">
                        <FontAwesomeIcon icon={faHeart} />
                        <span>{tweet.likes}</span>
                      </div>

                      {/* Share */}
                      {!tweet.text.startsWith("Error") && (
                        <div className="tweet-action-item">
                          <FontAwesomeIcon
                            icon={faShareSquare}
                            onClick={() =>
                              ReactGA.event({
                                category: "Button",
                                action: "Clicked Share Banger Tweet",
                              })
                            }
                          />
                          <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                              tweet.text
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ marginLeft: "5px" }}
                          >
                            Share
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No bangers generated yet.</p>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
