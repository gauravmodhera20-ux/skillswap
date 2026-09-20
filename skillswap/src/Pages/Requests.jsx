import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import { auth, db } from "../firebase/config";

function Requests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }

      try {
        // Get only requests involving current user
        const sentQuery = query(
          collection(db, "swapRequests"),
          where("senderId", "==", currentUser.uid)
        );

        const receivedQuery = query(
          collection(db, "swapRequests"),
          where("receiverId", "==", currentUser.uid)
        );

        const [sentSnapshot, receivedSnapshot] = await Promise.all([
          getDocs(sentQuery),
          getDocs(receivedQuery),
        ]);

        const requestMap = new Map();

        sentSnapshot.forEach((item) => {
          requestMap.set(item.id, {
            id: item.id,
            ...item.data(),
          });
        });

        receivedSnapshot.forEach((item) => {
          requestMap.set(item.id, {
            id: item.id,
            ...item.data(),
          });
        });

        const requestList = Array.from(requestMap.values());

        // Load other user's profile
        const requestData = await Promise.all(
          requestList.map(async (request) => {
            const otherUserId =
              request.senderId === currentUser.uid
                ? request.receiverId
                : request.senderId;

            try {
              const userSnapshot = await getDoc(
                doc(db, "users", otherUserId)
              );

              return {
                ...request,
                otherUser: userSnapshot.exists()
                  ? userSnapshot.data()
                  : null,
              };
            } catch (error) {
              console.error("User profile error:", error);

              return {
                ...request,
                otherUser: null,
              };
            }
          })
        );

        setRequests(requestData);

      } catch (error) {
        console.error("Requests error:", error);
        alert("Could not load requests: " + error.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // =========================
  // ACCEPT / REJECT REQUEST
  // =========================

  async function updateRequest(requestId, newStatus) {
    try {
      setUpdatingId(requestId);

      await updateDoc(
        doc(db, "swapRequests", requestId),
        {
          status: newStatus,
        }
      );

      setRequests((previousRequests) =>
        previousRequests.map((request) =>
          request.id === requestId
            ? {
                ...request,
                status: newStatus,
              }
            : request
        )
      );

      if (newStatus === "accepted") {
        alert("Swap request accepted! 🤝");
      } else {
        alert("Swap request rejected.");
      }

    } catch (error) {
      console.error("Update request error:", error);

      alert(
        "Could not update request: " +
        error.message
      );
    } finally {
      setUpdatingId(null);
    }
  }

  // =========================
  // STATUS TEXT
  // =========================

  function getStatusText(status) {
    if (status === "pending") {
      return "⏳ Pending";
    }

    if (status === "accepted") {
      return "✅ Accepted";
    }

    if (status === "rejected") {
      return "❌ Rejected";
    }

    return status;
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
              <p className="small-text">
                SkillSwap
              </p>

              <h2>
                Loading requests...
              </h2>

              <p>
                Checking your skill exchange requests.
              </p>
            </div>
          </div>

        </main>
      </div>
    );
  }

  const currentUserId = auth.currentUser?.uid;

  const incomingRequests = requests.filter(
    (request) =>
      request.receiverId === currentUserId
  );

  const outgoingRequests = requests.filter(
    (request) =>
      request.senderId === currentUserId
  );

  return (
    <div className="dashboard">

      {/* =========================
          NAVBAR
      ========================= */}

      <nav className="navbar">

        <div className="nav-inner">

          <Link
            to="/"
            className="logo"
          >
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

          </div>

        </div>

      </nav>

      {/* =========================
          MAIN
      ========================= */}

      <main className="dashboard-container">

        {/* HEADER */}

        <section className="welcome">

          <div>

            <p className="small-text">
              Connect 🤝
            </p>

            <h1>
              Swap <span>Requests</span>
            </h1>

            <p className="subtitle">
              Manage your incoming and outgoing
              skill exchange requests.
            </p>

          </div>

        </section>

        {/* =========================
            INCOMING REQUESTS
        ========================= */}

        <h2 className="section-title">
          📩 Incoming Requests
        </h2>

        {incomingRequests.length === 0 ? (

          <div className="getting-started">

            <div>

              <h3>
                No incoming requests
              </h3>

              <p>
                When someone wants to exchange
                skills with you, their request
                will appear here.
              </p>

            </div>

          </div>

        ) : (

          <div className="action-grid">

            {incomingRequests.map((request) => (

              <div
                className="action-card"
                key={request.id}
              >

                <div className="action-icon">
                  👤
                </div>

                <h3>
                  {request.otherUser?.name ||
                    "SkillSwap User"}
                </h3>

                <p>
                  {request.otherUser?.bio ||
                    "Wants to exchange skills with you."}
                </p>

                {/* Skills */}

                <p>
                  <strong>
                    Offers:
                  </strong>{" "}

                  {request.otherUser?.offeredSkills?.length
                    ? request.otherUser.offeredSkills.join(", ")
                    : "No skills listed"}
                </p>

                <p>
                  <strong>
                    Wants:
                  </strong>{" "}

                  {request.otherUser?.wantedSkills?.length
                    ? request.otherUser.wantedSkills.join(", ")
                    : "No skills listed"}
                </p>

                {/* Status */}

                <p>
                  <strong>
                    Status:
                  </strong>{" "}
                  {getStatusText(request.status)}
                </p>

                {/* Buttons */}

                {request.status === "pending" && (

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                      marginTop: "15px",
                    }}
                  >

                    <button
                      className="primary-btn"
                      disabled={
                        updatingId === request.id
                      }
                      onClick={() =>
                        updateRequest(
                          request.id,
                          "accepted"
                        )
                      }
                    >
                      {updatingId === request.id
                        ? "Updating..."
                        : "✅ Accept"}
                    </button>

                    <button
                      className="secondary-btn"
                      disabled={
                        updatingId === request.id
                      }
                      onClick={() =>
                        updateRequest(
                          request.id,
                          "rejected"
                        )
                      }
                    >
                      ❌ Reject
                    </button>

                  </div>

                )}

                {request.status === "accepted" && (

                  <p>
                    🤝 You are now SkillSwap partners!
                  </p>

                )}

              </div>

            ))}

          </div>

        )}

        {/* =========================
            OUTGOING REQUESTS
        ========================= */}

        <h2 className="section-title">
          📤 Sent Requests
        </h2>

        {outgoingRequests.length === 0 ? (

          <div className="getting-started">

            <div>

              <h3>
                No sent requests
              </h3>

              <p>
                Requests you send to other users
                will appear here.
              </p>

              <br />

              <Link
                to="/search"
                className="primary-btn"
              >
                Find Matches →
              </Link>

            </div>

          </div>

        ) : (

          <div className="action-grid">

            {outgoingRequests.map((request) => (

              <div
                className="action-card"
                key={request.id}
              >

                <div className="action-icon">
                  🤝
                </div>

                <h3>
                  {request.otherUser?.name ||
                    "SkillSwap User"}
                </h3>

                <p>
                  You sent a skill exchange
                  request to this user.
                </p>

                {/* Skills */}

                <p>
                  <strong>
                    Offers:
                  </strong>{" "}

                  {request.otherUser?.offeredSkills?.length
                    ? request.otherUser.offeredSkills.join(", ")
                    : "No skills listed"}
                </p>

                <p>
                  <strong>
                    Wants:
                  </strong>{" "}

                  {request.otherUser?.wantedSkills?.length
                    ? request.otherUser.wantedSkills.join(", ")
                    : "No skills listed"}
                </p>

                {/* Status */}

                <p>
                  <strong>
                    Status:
                  </strong>{" "}

                  {getStatusText(request.status)}
                </p>

                {request.status === "accepted" && (

                  <p>
                    🤝 Your skill swap is active!
                  </p>

                )}

                {request.status === "rejected" && (

                  <p>
                    This request was rejected.
                  </p>

                )}

              </div>

            ))}

          </div>

        )}

      </main>

    </div>
  );
}

export default Requests;
