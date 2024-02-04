import React, { useState, useEffect } from "react";

function Card({ date, title, image: imagePath, description }) {
  const [image, setImage] = useState(null);

  useEffect(() => {
    const importImage = async () => {
      try {
        const imgModule = await import(`${imagePath}`);
        setImage(imgModule.default);
      } catch (error) {
        console.error("Error loading image:", error);
      }
    };

    importImage();
  }, [imagePath]);

  return (
    <article className="card">
      <header className="card-header">
        <p>{date}</p>
        <h2>{title}</h2>
      </header>
      <div className="card-image-container">
        {image && <img src={image} alt={title} />}
      </div>
      <p dangerouslySetInnerHTML={{ __html: description }} />
    </article>
  );
}

export default Card;
