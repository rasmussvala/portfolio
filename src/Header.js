import React from "react";
import profileImage from "./assets/profile-pic.png";
import Links from "./Links";

export default function Header() {
  return (
    <>
      <header className="header">
        <div className="text-container">
          <h1>Rasmus Svala</h1>
          <p>
            Hey there! 👋 I'm Rasmus, a 4th year Master of Science student in
            Media Technology and Engineering, based in Sweden. I've got a
            passion for computer graphics and web development and when I'm not
            coding, you might just find me at 'Pub Vattentornet', appreciating a
            good beer and catching up with friends. 🍻 My aim here is to keep
            things simple and showcase a glimpse of some of the work I've done.
            Feel free to contact me anytime via my social networks. 😊{" "}
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
