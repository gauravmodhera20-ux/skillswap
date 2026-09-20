import { Link } from "react-router-dom";

function Home() {
  return (
    <>
      <nav className="navbar">
        <div className="nav-inner">
          <Link to="/" className="logo">
            SkillSwap
          </Link>

          <div className="nav-links">
            <Link to="/login">Login</Link>

            <Link to="/signup" className="nav-button">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="container">
            <div className="hero-badge">
              Learn • Teach • Grow
            </div>

            <h1>
              Turn your skills into
              <span> new opportunities.</span>
            </h1>

            <p>
              SkillSwap connects people who want to teach
              and learn from each other through skill exchange.
            </p>

            <div className="hero-buttons">
              <Link to="/signup">
                <button className="primary-btn">
                  Start Swapping →
                </button>
              </Link>

              <Link to="/login">
                <button className="secondary-btn">
                  I already have an account
                </button>
              </Link>
            </div>
          </div>
        </section>

        <section className="features">
          <div className="container">
            <div className="features-grid">

              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3>Find the Right Match</h3>
                <p>
                  Discover people whose skills match
                  what you want to learn.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🔄</div>
                <h3>Exchange Skills</h3>
                <p>
                  Teach what you know and learn something
                  valuable in return.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">⭐</div>
                <h3>Build Your Reputation</h3>
                <p>
                  Complete swaps and receive ratings from
                  other learners.
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default Home;