import "./styles/card.css";
import profileImage from "./assets/profile-pic.png";
import rayTracingImage from "./assets/raytracing-crop.png";

function App() {
  return (
    <>
      <header className="header">
        <div className="text-container">
          <h1>Rasmus Svala</h1>
          <p>
            Hey there! 👋 I'm Rasmus, a 4th year Master of Science student in
            Media Technology and Engineering, based in Sweden. I've got a
            passion for computer graphics and web development. When I'm not
            diving into pixels and code, you might just find me at 'Pub
            Vattentornet', appreciating a good beer and catching up with
            friends. 🍻 My aim here is to keep things simple and showcase a
            glimpse of some of the work I've done. Feel free to contact me
            anytime via my social networks. 😊{" "}
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
            <p>October 2023</p>
            <h2>Global Illumination in C++</h2>
          </header>
          <div className="card-image-container">
            <img src={rayTracingImage} alt="rayTracingImage" />
          </div>
          <p>
            C++ crafted ray tracer. Simulates light, shadows and reflections.
          </p>
        </article>

        <article className="card">
          <header className="card-header">
            <p>21 juni 2023</p>
            <h2>Detta är en text som är i h2</h2>
          </header>
          <div className="card-image-container">
            <img src={rayTracingImage} alt="temp" />
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
