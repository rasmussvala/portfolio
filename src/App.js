import "./styles/global.css";
import projects from "./data.json";
import Card from "./Card.js";
import Header from "./Header.js";

import { useState, useEffect } from "react";

// Convert date strings to a comparable format
const parseDate = (dateString) => {
  const [month, year] = dateString.split(" ");
  return new Date(`${month} 1, ${year}`);
};

function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  // Sort the projects by date
  const sortedProjects = projects
    .slice()
    .sort((a, b) => parseDate(b.date) - parseDate(a.date));

  // Set loaded to true
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={`app ${isLoaded ? "loaded" : ""}`}>
      <Header />

      <section className="card-list">
        {sortedProjects.map((project, index) => (
          <Card
            key={index}
            date={project.date}
            title={project.title}
            image={project.image}
            description={project.description}
          />
        ))}
      </section>
    </div>
  );
}

export default App;
