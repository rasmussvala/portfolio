import "./styles/card.css";
import profileImage from "./assets/Memoji.png";

function App() {
  return (
    <>
      <header className="header">
        <div className="text-container">
          <h1>Rasmus Svala</h1>
          <p>
            text text text text text text text text text text text text text
            text text text text text text text text text text text text text
            text text text text text text text{" "}
          </p>
        </div>
        <div className="image-container">
          <div className="profile-image">
            <img src={profileImage} alt="Din bild" />
          </div>
        </div>
      </header>

      <section className="card-list">
        <article className="card">
          <header className="card-header">
            <p>21 juni 2023</p>
            <h2>Detta är en text som är i h2</h2>
          </header>
        </article>

        <article className="card">
          <header className="card-header">
            <p>21 juni 2023</p>
            <h2>Detta är en text som är i h2</h2>
          </header>
          <div className="card-image-container">
            <img src={profileImage} alt="temp" />
          </div>
          <p>Detta är brödtext som är i p</p>
        </article>

        <article className="card">
          <header className="card-header">
            <p>21 juni 2023</p>
            <h2>Detta är en text som är i h2</h2>
          </header>
        </article>

        <article className="card">
          <header className="card-header">
            <p>21 juni 2023</p>
            <h2>Detta är en text som är i h2</h2>
          </header>
        </article>

        <article className="card">
          <header className="card-header">
            <p>21 juni 2023</p>
            <h2>Detta är en text som är i h2</h2>
          </header>
        </article>

        <article className="card">
          <header className="card-header">
            <p>21 juni 2023</p>
            <h2>Detta är en text som är i h2</h2>
          </header>
        </article>
      </section>
    </>
  );
}

export default App;
