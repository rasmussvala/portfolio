import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

export default function Links() {
  return (
    <div className="social-links">
      <a
        href="https://github.com/rasmussvala"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FontAwesomeIcon icon={faGithub} /> GitHub
      </a>
      <a
        href="https://www.linkedin.com/in/rasmus-svala/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FontAwesomeIcon icon={faLinkedin} /> LinkedIn
      </a>
      <a href="mailto:rasmus.svala@hotmail.com">
        <FontAwesomeIcon icon={faEnvelope} /> Email
      </a>
    </div>
  );
}
