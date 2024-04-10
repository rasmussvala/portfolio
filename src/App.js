import "./styles/card.css";
import projects from "./data.json";
import Card from "./Card.js";
import Header from "./Header.js";

function App() {
  return (
    <>
      <Header />

      <section className="card-list">
        {projects.map((project, index) => (
          <Card
            key={index}
            date={project.date}
            title={project.title}
            image={project.image}
            description={project.description}
          />
        ))}
      </section>
    </>
  );
}

export default App;
