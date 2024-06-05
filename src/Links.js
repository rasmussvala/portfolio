import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

export default function Links() {
  const linkStyle = {
    background: "#121212",
    color: "#fffbf4",
    display: "flex",
    flexDirection: "row",
    padding: "10px 20px",
    borderRadius: "20px",
    alignItems: "center",
  };

  return (
    <div className="social-links">
      <a
        href="https://github.com/rasmussvala"
        className="social-link"
        target="_blank"
        rel="noopener noreferrer"
        style={linkStyle}
      >
        <FontAwesomeIcon icon={faGithub} style={{ marginRight: "10px" }} />
        GitHub
      </a>
      <a
        href="https://www.linkedin.com/in/rasmus-svala/"
        target="_blank"
        rel="noopener noreferrer"
        style={linkStyle}
      >
        <FontAwesomeIcon icon={faLinkedin} style={{ marginRight: "10px" }} />
        LinkedIn
      </a>
      <a href="mailto:rasmus.svala@hotmail.com" style={linkStyle}>
        <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: "10px" }} />
        Email
      </a>
    </div>
  );
}
