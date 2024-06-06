import "./styles/global.css";
import projects from "./data.json";
import Card from "./Card.js";
import Header from "./Header.js";
import Links from "./Links";

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
      <Links />

      <div className="content-container">
        <h2>About me</h2>
        <div className="about-me-text">
          <p>
            I was born in Tranås, Sweden, in the year 2000. I currently live in
            Norrköping, where I study at Linköpings University. I enjoy coding
            and learning new things. I've tried a lot of programming languages
            and so far I have C++, JavaScript, React, HTML, CSS, and some
            Git/GitHub under my belt. When I'm not coding I also enjoy playing
            video games and working out at the local gym.
          </p>
        </div>

        <h2>Projects</h2>
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
    </div>
  );
}

export default App;
