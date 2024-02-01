import React from "react";

function Card({ date, title, image, description }) {
  return (
    <article className="card">
      <header className="card-header">
        <p>{date}</p>
        <h2>{title}</h2>
      </header>
      <div className="card-image-container">
        <img src={image} alt={title} />
      </div>
      <p>{description}</p>
    </article>
  );
}

export default Card;
