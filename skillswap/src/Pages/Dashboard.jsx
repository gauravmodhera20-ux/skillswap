import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "../firebase/config";

function Dashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [activeSwaps, setActiveSwaps] = useState(0);
  const [rating, setRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        // =========================
        // USER PROFILE
        // =========================

        const profileRef = doc(db, "users", user.uid);
        const profileSnapshot = await getDoc(profileRef);

        if (profileSnapshot.exists()) {
          setProfile(profileSnapshot.data());
        }

        // =========================
        // ACTIVE SWAPS
        // =========================

        const sentQuery = query(
          collection(db, "swapRequests"),
          where("senderId", "==", user.uid),
          where("status", "==", "accepted")
        );

        const receivedQuery = query(
          collection(db, "swapRequests"),
          where("receiverId", "==", user.uid),
          where("status", "==", "accepted")
        );

        const [sentSnapshot, receivedSnapshot] = await Promise.all([
          getDocs(sentQuery),
          getDocs(receivedQuery),
        ]);

        const swapIds = new Set();

        sentSnapshot.forEach((item) => {
          swapIds.add(item.id);
        });

        receivedSnapshot.forEach((item) => {
          swapIds.add(item.id);
        });

        setActiveSwaps(swapIds.size);

        // =========================
        // RATINGS
        // =========================

        const ratingsQuery = query(
          collection(db, "ratings"),
          where("toUserId", "==", user.uid)
        );

        const ratingsSnapshot = await getDocs(ratingsQuery);

        let totalRating = 0;
        let count = 0;

        ratingsSnapshot.forEach((item) => {
          const data = item.data();
          const value = Number(data.rating);

          if (!Number.isNaN(value) && value >= 1 && value <= 5) {
            totalRating += value;
            count++;
          }
        });

        const averageRating =
          count > 0 ? totalRating / count : 0;

        setRating(averageRating);
        setRatingCount(count);

      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // =========================
  // LOGOUT
  // =========================

  async function handleLogout() {
    try {
      setLoggingOut(true);

      await signOut(auth);

      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed: " + error.message);
      setLoggingOut(false);
    }
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="dashboard">
        <main className="dashboard-container">
          <div className="getting-started">
            <div>
              <p className="small-text">SkillSwap</p>
              <h2>Loading dashboard...</h2>
              <p>
                Getting your skills, swaps and ratings ready.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const offeredSkills = profile?.offeredSkills || [];
  const wantedSkills = profile?.wantedSkills || [];

  const profileComplete =
    offeredSkills.length > 0 &&
    wantedSkills.length > 0;

  const userName = profile?.name || "SkillSwap User";

  return (
    <div className="dashboard">

      {/* =========================
          NAVBAR
      ========================= */}

      <nav className="navbar">
        <div className="nav-inner">

          <Link to="/" className="logo">
            SkillSwap
          </Link>

          <div className="nav-links">

            <Link to="/dashboard">
              Dashboard
            </Link>

            <Link to="/search">
              Find Matches
            </Link>

            <Link to="/requests">
              Requests
            </Link>

            <Link to="/profile">
              Profile
            </Link>

            <button
              onClick={handleLogout}
              className="logout-btn"
              disabled={loggingOut}
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </button>

          </div>

        </div>
      </nav>

      {/* =========================
          MAIN
      ========================= */}

      <main className="dashboard-container">

        {/* WELCOME */}

        <section className="welcome">

          <div>

            <p className="small-text">
              Welcome back 👋
            </p>

            <h1>
              Ready to <span>SkillSwap?</span>
            </h1>

            <p className="subtitle">
              Teach what you know. Learn what you want.
            </p>

          </div>

          <Link
            to="/search"
            className="primary-btn"
          >
            Find Matches →
          </Link>

        </section>

        {/* =========================
            STATS
        ========================= */}

        <section className="stats">

          {/* SKILLS OFFERED */}

          <div className="stat-card">

            <div className="stat-icon">
              🎓
            </div>

            <div>
              <h3>
                {offeredSkills.length}
              </h3>

              <p>
                Skills Offered
              </p>
            </div>

          </div>

          {/* SKILLS WANTED */}

          <div className="stat-card">

            <div className="stat-icon">
              📚
            </div>

            <div>
              <h3>
                {wantedSkills.length}
              </h3>

              <p>
                Skills Wanted
              </p>
            </div>

          </div>

          {/* ACTIVE SWAPS */}

          <div className="stat-card">

            <div className="stat-icon">
              🤝
            </div>

            <div>
              <h3>
                {activeSwaps}
              </h3>

              <p>
                Active Swaps
              </p>
            </div>

          </div>

          {/* RATING */}

          <Link
            to="/rating"
            className="stat-card"
            style={{
              textDecoration: "none",
              color: "inherit",
              cursor: "pointer",
            }}
          >

            <div className="stat-icon">
              ⭐
            </div>

            <div>

              <h3>
                {rating.toFixed(1)}
              </h3>

              <p>
                Your Rating
              </p>

              <small>
                {ratingCount > 0
                  ? `${ratingCount} rating${
                      ratingCount > 1 ? "s" : ""
                    }`
                  : "No ratings yet"}
              </small>

            </div>

          </Link>

        </section>

        {/* =========================
            QUICK ACTIONS
        ========================= */}

        <h2 className="section-title">
          Quick Actions
        </h2>

        <section className="action-grid">

          {/* PROFILE */}

          <Link
            to="/profile"
            className="action-card"
          >

            <div className="action-icon">
              👤
            </div>

            <h3>
              {profileComplete
                ? "Update Profile"
                : "Complete Profile"}
            </h3>

            <p>
              Add the skills you can teach and
              the skills you want to learn.
            </p>

            <span>
              {profileComplete
                ? "Edit Profile →"
                : "Complete Profile →"}
            </span>

          </Link>

          {/* MATCHES */}

          <Link
            to="/search"
            className="action-card"
          >

            <div className="action-icon">
              🔎
            </div>

            <h3>
              Find Skill Matches
            </h3>

            <p>
              Discover people whose skills
              match what you want to learn.
            </p>

            <span>
              Find Matches →
            </span>

          </Link>

          {/* REQUESTS */}

          <Link
            to="/requests"
            className="action-card"
          >

            <div className="action-icon">
              📩
            </div>

            <h3>
              Swap Requests
            </h3>

            <p>
              View your incoming and outgoing
              skill exchange requests.
            </p>

            <span>
              View Requests →
            </span>

          </Link>

        </section>

        {/* =========================
            GETTING STARTED
        ========================= */}

        <section className="getting-started">

          <div>

            <p className="small-text">
              Getting Started
            </p>

            <h2>
              {profileComplete
                ? `Your profile is ready, ${userName} 🎉`
                : `Build your SkillSwap profile, ${userName}`}
            </h2>

            <p>
              {profileComplete
                ? "Discover people, exchange skills and build your network."
                : "Add your skills so people can discover you and find matches."}
            </p>

          </div>

          <Link
            to="/profile"
            className="secondary-btn"
          >
            {profileComplete
              ? "Edit Profile"
              : "Complete Profile"}
          </Link>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;
