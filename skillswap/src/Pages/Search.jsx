import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase/config";

function Search() {
  const [users, setUsers] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "/login";
        return;
      }

      try {
        // Get my profile
        const mySnapshot = await getDoc(doc(db, "users", user.uid));

        if (mySnapshot.exists()) {
          setMyProfile(mySnapshot.data());
        }

        // Get all users
        const snapshot = await getDocs(collection(db, "users"));

        const allUsers = snapshot.docs
          .map((item) => ({
            id: item.id,
            ...item.data(),
          }))
          .filter((item) => item.id !== user.uid);

        setUsers(allUsers);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  function calculateMatch(user) {
    if (!myProfile) return 0;

    const myOffers = (myProfile.offeredSkills || []).map((skill) =>
      skill.toLowerCase().trim()
    );

    const myWants = (myProfile.wantedSkills || []).map((skill) =>
      skill.toLowerCase().trim()
    );

    const theirOffers = (user.offeredSkills || []).map((skill) =>
      skill.toLowerCase().trim()
    );

    const theirWants = (user.wantedSkills || []).map((skill) =>
      skill.toLowerCase().trim()
    );

    let score = 0;

    // They can teach something I want
    const canTeachMe = myWants.some((skill) =>
      theirOffers.includes(skill)
    );

    // I can teach something they want
    const canTeachThem = theirWants.some((skill) =>
      myOffers.includes(skill)
    );

    if (canTeachMe) score += 50;
    if (canTeachThem) score += 50;

    return score;
  }

  function getMatchText(score) {
    if (score === 100) return "🤝 Mutual Match";
    if (score === 50) return "✨ Potential Match";
    return "No direct match";
  }

  if (loading) {
    return <h2>Finding skill matches...</h2>;
  }

  return (
    <div className="dashboard">

      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-inner">
          <Link to="/" className="logo">
            SkillSwap
          </Link>

          <div className="nav-links">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/search">Find Matches</Link>
            <Link to="/requests">Requests</Link>
            <Link to="/profile">Profile</Link>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="dashboard-container">

        <div className="welcome">
          <div>
            <p className="small-text">Discover 👋</p>

            <h1>
              Find Skill <span>Matches</span>
            </h1>

            <p className="subtitle">
              Find people who can teach what you want to learn.
            </p>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="getting-started">
            <div>
              <h2>No other users found</h2>
              <p>
                Create another account to test SkillSwap matching.
              </p>
            </div>
          </div>
        ) : (
          <div className="action-grid">

            {users.map((user) => {
              const score = calculateMatch(user);

              return (
                <div className="action-card" key={user.id}>

                  <div className="action-icon">👤</div>

                  <h3>{user.name || "SkillSwap User"}</h3>

                  <p>
                    {user.bio || "No bio added yet."}
                  </p>

                  <p>
                    <strong>Offers:</strong>{" "}
                    {user.offeredSkills?.length
                      ? user.offeredSkills.join(", ")
                      : "No skills added"}
                  </p>

                  <p>
                    <strong>Wants:</strong>{" "}
                    {user.wantedSkills?.length
                      ? user.wantedSkills.join(", ")
                      : "No skills added"}
                  </p>

                  <h3>
                    {score}% Match
                  </h3>

                  <p>{getMatchText(score)}</p>

                  <Link
                    to={`/user/${user.id}`}
                    className="secondary-btn"
                  >
                    View Profile →
                  </Link>

                </div>
              );
            })}

          </div>
        )}

      </main>
    </div>
  );
}

export default Search;
