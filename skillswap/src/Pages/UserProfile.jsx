import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  query,
  where,
  serverTimestamp
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

import { auth, db } from "../firebase/config";

function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState(null);
  const [existingRequest, setExistingRequest] = useState(null);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);


  useEffect(() => {

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {

        if (!currentUser) {
          navigate("/login");
          return;
        }

        if (currentUser.uid === id) {
          navigate("/profile");
          return;
        }


        try {

          const userSnapshot = await getDoc(
            doc(db, "users", id)
          );


          if (!userSnapshot.exists()) {

            setUserProfile(null);
            setLoading(false);

            return;
          }


          setUserProfile(
            userSnapshot.data()
          );


          // SENT REQUEST

          const sentQuery = query(
            collection(db, "swapRequests"),
            where(
              "senderId",
              "==",
              currentUser.uid
            ),
            where(
              "receiverId",
              "==",
              id
            )
          );


          // RECEIVED REQUEST

          const receivedQuery = query(
            collection(db, "swapRequests"),
            where(
              "senderId",
              "==",
              id
            ),
            where(
              "receiverId",
              "==",
              currentUser.uid
            )
          );


          const [
            sentSnapshot,
            receivedSnapshot
          ] = await Promise.all([
            getDocs(sentQuery),
            getDocs(receivedQuery)
          ]);


          let request = null;


          if (!sentSnapshot.empty) {

            const item =
              sentSnapshot.docs[0];

            request = {
              id: item.id,
              ...item.data()
            };
          }


          if (
            !request &&
            !receivedSnapshot.empty
          ) {

            const item =
              receivedSnapshot.docs[0];

            request = {
              id: item.id,
              ...item.data()
            };
          }


          setExistingRequest(request);


        } catch (error) {

          console.error(
            "User profile error:",
            error
          );

          alert(
            "Could not load user profile: " +
            error.message
          );

        } finally {

          setLoading(false);

        }

      }
    );


    return () => unsubscribe();

  }, [id, navigate]);


  async function sendSwapRequest() {

    const currentUser =
      auth.currentUser;


    if (!currentUser) {

      navigate("/login");
      return;

    }


    if (currentUser.uid === id) {

      alert(
        "You cannot send a request to yourself."
      );

      return;
    }


    if (existingRequest) {

      if (
        existingRequest.status ===
        "pending"
      ) {

        alert(
          "You already have a pending request with this user. 📩"
        );

        return;
      }


      if (
        existingRequest.status ===
        "accepted"
      ) {

        alert(
          "You are already SkillSwap partners! 🤝"
        );

        return;
      }


      if (
        existingRequest.status ===
        "rejected"
      ) {

        alert(
          "This request was previously rejected."
        );

        return;
      }

    }


    try {

      setSending(true);


      const requestData = {

        senderId:
          currentUser.uid,

        receiverId:
          id,

        status:
          "pending",

        createdAt:
          serverTimestamp()

      };


      const newRequest =
        await addDoc(
          collection(
            db,
            "swapRequests"
          ),
          requestData
        );


      setExistingRequest({

        id: newRequest.id,

        ...requestData

      });


      alert(
        "Swap request sent successfully! 🤝"
      );


    } catch (error) {

      console.error(
        "Send request error:",
        error
      );

      alert(
        "Could not send request: " +
        error.message
      );

    } finally {

      setSending(false);

    }

  }


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
                Loading profile...
              </h2>

              <p>
                Getting user information ready.
              </p>

            </div>

          </div>

        </main>

      </div>
    );

  }


  if (!userProfile) {

    return (
      <div className="dashboard">

        <main className="dashboard-container">

          <div className="getting-started">

            <div>

              <h2>
                User not found
              </h2>

              <p>
                This SkillSwap profile
                doesn't exist.
              </p>

              <Link
                to="/search"
                className="primary-btn"
              >
                ← Back to Matches
              </Link>

            </div>

          </div>

        </main>

      </div>
    );

  }


  const isAcceptedPartner =
    existingRequest?.status ===
    "accepted";


  let requestButton;


  if (!existingRequest) {

    requestButton = (

      <button
        onClick={sendSwapRequest}
        className="primary-btn"
        disabled={sending}
      >

        {sending
          ? "Sending..."
          : "🤝 Send Swap Request"}

      </button>

    );

  } else if (
    existingRequest.status ===
    "pending"
  ) {

    requestButton = (

      <button
        className="secondary-btn"
        disabled
      >
        ⏳ Request Pending
      </button>

    );

  } else if (
    existingRequest.status ===
    "accepted"
  ) {

    requestButton = (

      <button
        className="secondary-btn"
        disabled
      >
        🤝 SkillSwap Partner
      </button>

    );

  } else {

    requestButton = (

      <button
        className="secondary-btn"
        disabled
      >
        ❌ Request Rejected
      </button>

    );

  }


  return (

    <div className="dashboard">

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


      <main className="dashboard-container">

        <Link
          to="/search"
          className="small-text"
        >
          ← Back to Matches
        </Link>


        <div
          className="getting-started"
          style={{
            marginTop: "20px"
          }}
        >

          <div>

            <div
              style={{
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                background: "#eef2ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "40px",
                marginBottom: "18px"
              }}
            >
              👤
            </div>


            <h1>
              {userProfile.name ||
                "SkillSwap User"}
            </h1>


            <p>
              {userProfile.bio ||
                "No bio added yet."}
            </p>


            <br />


            <h3>
              🎓 Skills I Offer
            </h3>

            <p>
              {userProfile.offeredSkills?.length
                ? userProfile.offeredSkills.join(", ")
                : "No skills added"}
            </p>


            <h3>
              📚 Skills I Want
            </h3>

            <p>
              {userProfile.wantedSkills?.length
                ? userProfile.wantedSkills.join(", ")
                : "No skills added"}
            </p>


            <h3>
              🕒 Availability
            </h3>

            <p>
              {userProfile.availability ||
                "Not specified"}
            </p>


            <h3>
              ⭐ Rating
            </h3>

            <p>
              {Number(
                userProfile.rating || 0
              ).toFixed(1)}{" "}
              / 5
            </p>


            {/* =================================
                PRIVATE SWAP DETAILS
            ================================= */}

            {isAcceptedPartner ? (

              <div
                style={{
                  marginTop: "28px",
                  padding: "20px",
                  background: "#eef2ff",
                  borderRadius: "14px"
                }}
              >

                <h3>
                  🤝 SkillSwap Partner Details
                </h3>

                <p
                  style={{
                    marginTop: "15px"
                  }}
                >
                  📍{" "}
                  <strong>
                    Meeting Location:
                  </strong>
                </p>

                <p>
                  {userProfile.skillSwapLocation ||
                    "Not specified"}
                </p>


                <p
                  style={{
                    marginTop: "15px"
                  }}
                >
                  📞{" "}
                  <strong>
                    Contact:
                  </strong>
                </p>

                <p>
                  {userProfile.contactNumber ||
                    "Not specified"}
                </p>

              </div>

            ) : (

              <div
                style={{
                  marginTop: "28px",
                  padding: "20px",
                  background: "#f3f4f6",
                  borderRadius: "14px"
                }}
              >

                <h3>
                  🔒 Contact Details Locked
                </h3>

                <p
                  style={{
                    color: "#6b7280",
                    marginTop: "8px"
                  }}
                >
                  Accept the SkillSwap request
                  first to exchange meeting and
                  contact details.
                </p>

              </div>

            )}


            <div
              style={{
                marginTop: "25px"
              }}
            >
              {requestButton}
            </div>

          </div>

        </div>

      </main>

    </div>

  );
}

export default UserProfile;
