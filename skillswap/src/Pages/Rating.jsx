import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase/config";

function Rating() {
  const [partners, setPartners] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        window.location.href = "/login";
        return;
      }

      try {
        // Accepted swaps where I am sender
        const sentQuery = query(
          collection(db, "swapRequests"),
          where("senderId", "==", currentUser.uid),
          where("status", "==", "accepted")
        );

        // Accepted swaps where I am receiver
        const receivedQuery = query(
          collection(db, "swapRequests"),
          where("receiverId", "==", currentUser.uid),
          where("status", "==", "accepted")
        );

        const [sentSnapshot, receivedSnapshot] = await Promise.all([
          getDocs(sentQuery),
          getDocs(receivedQuery)
        ]);

        const partnerIds = new Set();

        sentSnapshot.forEach((item) => {
          partnerIds.add(item.data().receiverId);
        });

        receivedSnapshot.forEach((item) => {
          partnerIds.add(item.data().senderId);
        });

        const partnerList = [];

        for (const partnerId of partnerIds) {
          const userQuery = await getDocs(
            query(
              collection(db, "users"),
              where("__name__", "==", partnerId)
            )
          );

          userQuery.forEach((item) => {
            partnerList.push({
              id: item.id,
              ...item.data()
            });
          });
        }

        setPartners(partnerList);

      } catch (error) {
        console.error("Rating load error:", error);
        alert("Could not load rating partners.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  async function submitRating(e) {
    e.preventDefault();

    const currentUser = auth.currentUser;

    if (!currentUser || !selectedUser) {
      alert("Please select a user.");
      return;
    }

    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }

    try {
      setSending(true);

      await addDoc(collection(db, "ratings"), {
        fromUserId: currentUser.uid,
        toUserId: selectedUser.id,
        rating: rating,
        feedback: feedback.trim(),
        createdAt: serverTimestamp()
      });

      alert("Rating submitted successfully! ⭐");

      setSelectedUser(null);
      setRating(0);
      setFeedback("");

    } catch (error) {
      console.error("Rating error:", error);
      alert("Could not submit rating: " + error.message);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return <h2>Loading rating page...</h2>;
  }

  return (
    <div className="dashboard">

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

      <main className="dashboard-container">

        <div className="welcome">
          <div>
            <p className="small-text">SkillSwap ⭐</p>

            <h1>
              Rate your <span>SkillSwap</span>
            </h1>

            <p className="subtitle">
              Rate people you have completed a skill exchange with.
            </p>
          </div>
        </div>

        {partners.length === 0 ? (

          <div className="getting-started">
            <div>
              <h2>No completed swaps yet 🤝</h2>

              <p>
                Accept a swap request first. Then you can rate your
                SkillSwap partner here.
              </p>
            </div>
          </div>

        ) : (

          <>
            <h2 className="section-title">
              Your SkillSwap Partners
            </h2>

            <div className="action-grid">

              {partners.map((partner) => (

                <div className="action-card" key={partner.id}>

                  <div className="action-icon">👤</div>

                  <h3>
                    {partner.name || "SkillSwap User"}
                  </h3>

                  <p>
                    {partner.bio || "SkillSwap partner"}
                  </p>

                  <button
                    className="primary-btn"
                    onClick={() => {
                      setSelectedUser(partner);
                      setRating(0);
                      setFeedback("");
                    }}
                  >
                    ⭐ Rate User
                  </button>

                </div>

              ))}

            </div>
          </>
        )}

        {/* Rating Form */}

        {selectedUser && (

          <div className="getting-started" style={{ marginTop: "30px" }}>

            <div>

              <p className="small-text">
                Rating {selectedUser.name}
              </p>

              <h2>
                How was your experience?
              </h2>

              <div style={{ margin: "20px 0" }}>

                {[1, 2, 3, 4, 5].map((star) => (

                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "40px",
                      cursor: "pointer",
                      padding: "5px"
                    }}
                  >
                    {star <= rating ? "⭐" : "☆"}
                  </button>

                ))}

              </div>

              <p>
                Rating: <strong>{rating}/5</strong>
              </p>

              <textarea
                placeholder="Write feedback (optional)"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows="5"
                style={{
                  width: "100%",
                  maxWidth: "600px",
                  marginTop: "15px"
                }}
              />

              <br />
              <br />

              <button
                className="primary-btn"
                onClick={submitRating}
                disabled={sending}
              >
                {sending ? "Submitting..." : "Submit Rating ⭐"}
              </button>

            </div>

          </div>

        )}

      </main>

    </div>
  );
}

export default Rating;
