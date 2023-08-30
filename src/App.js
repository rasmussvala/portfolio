import "./styles/card.css";
import profileImage from "./assets/Memoji.png";

function App() {
  return (
    <>
      <header className="header">
        <div className="text-container">
          <h1>Rasmus Svala</h1>
          <p>
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean
            commodo ligula eget dolor. Aenean massa. Cum sociis natoque
            penatibus et magnis dis parturient montes, nascetur ridiculus mus.
            Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem.
            Nulla consequat massa quis enim. Donec pede justo, fringilla vel,
            aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut,
            imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede
            mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum
            semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula,
            porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem
            ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra
            nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet.{" "}
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
