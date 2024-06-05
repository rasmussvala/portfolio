import React from "react";
import profileImage from "./assets/profile-pic1.jpg";

export default function Header() {
  return (
    <>
      <header className="header">
        <div className="text-container">
          <h1>Rasmus Svala</h1>
          <p>
            Hi, my name is Rasmus and I'm a fourth-year MSc student in Media
            Technology and Engineering, based in Norrköping, Sweden.
          </p>
        </div>
        <div className="image-container">
          <div className="profile-image">
            <img src={profileImage} alt="Din bild" />
          </div>
        </div>
      </header>
    </>
  );
}
