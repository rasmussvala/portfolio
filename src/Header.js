import React from "react";
import profileImage from "./assets/profile-pic2.jpg";
import Links from "./Links";

export default function Header() {
  return (
    <>
      <header className="header">
        <div className="text-container">
          <h1>Rasmus Svala</h1>
          <p>
            Hi. My name is Rasmus and I am a fourt year MSc student in Media
            Technology and Engineering, based in Sweden. My aim here is to keep
            things simple and showcase some of the work I've done alone or in
            group. Feel free to contact me anytime via my social networks. 😊{" "}
          </p>
          <br></br>
          <Links />
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
