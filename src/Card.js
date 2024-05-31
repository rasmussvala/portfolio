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
      <div className="card-image-container">
        {image && <img src={image} alt={title} />}
      </div>
      <header className="card-header">
        <p style={{ fontWeight: "bold" }}>{title}</p>
        <p>{date}</p>
      </header>
      <p dangerouslySetInnerHTML={{ __html: description }} />
    </article>
  );
}

export default Card;
