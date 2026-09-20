import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

import { auth, db } from "../firebase/config";

function Profile() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [offeredSkills, setOfferedSkills] = useState("");
  const [wantedSkills, setWantedSkills] = useState("");
  const [availability, setAvailability] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [skillSwapLocation, setSkillSwapLocation] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {
          const data = snapshot.data();

          setName(data.name || "");
          setBio(data.bio || "");

          setOfferedSkills(
            (data.offeredSkills || []).join(", ")
          );

          setWantedSkills(
            (data.wantedSkills || []).join(", ")
          );

          setAvailability(data.availability || "");
          setContactNumber(data.contactNumber || "");
          setSkillSwapLocation(
            data.skillSwapLocation || ""
          );

          const hasProfileData =
            (data.bio || "").trim() !== "" ||
            (data.offeredSkills || []).length > 0 ||
            (data.wantedSkills || []).length > 0 ||
            (data.availability || "").trim() !== "" ||
            (data.contactNumber || "").trim() !== "" ||
            (data.skillSwapLocation || "").trim() !== "";

          setIsEditing(!hasProfileData);
        } else {
          setIsEditing(true);
        }

      } catch (error) {
        console.error("Profile load error:", error);
        alert("Could not load profile.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);


  async function handleSave(e) {
    e.preventDefault();

    const user = auth.currentUser;

    if (!user) {
      alert("Please login first.");
      return;
    }

    if (
      contactNumber &&
      !/^[0-9+\-\s()]{7,20}$/.test(contactNumber)
    ) {
      alert("Please enter a valid contact number.");
      return;
    }

    if (!skillSwapLocation.trim()) {
      alert(
        "Please enter a SkillSwap meeting location."
      );
      return;
    }

    try {
      setSaving(true);

      const offered = offeredSkills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      const wanted = wantedSkills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      await updateDoc(
        doc(db, "users", user.uid),
        {
          name: name.trim(),
          bio: bio.trim(),
          offeredSkills: offered,
          wantedSkills: wanted,
          availability,
          contactNumber: contactNumber.trim(),
          skillSwapLocation:
            skillSwapLocation.trim()
        }
      );

      setOfferedSkills(offered.join(", "));
      setWantedSkills(wanted.join(", "));

      setIsEditing(false);

      alert("Profile saved successfully! ✅");

    } catch (error) {
      console.error("Profile save error:", error);

      alert(
        "Profile save failed: " +
        error.message
      );
    } finally {
      setSaving(false);
    }
  }


  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="getting-started">
            <div>
              <p className="small-text">
                SkillSwap
              </p>

              <h2>
                Loading profile...
              </h2>

              <p>
                Getting your profile ready.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }


  // =========================================
  // PROFILE VIEW
  // =========================================

  if (!isEditing) {
    const offered =
      offeredSkills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

    const wanted =
      wantedSkills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

    return (
      <div className="profile-page">

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


        <main className="profile-container">

          <div className="profile-header">

            <p className="small-text">
              Your SkillSwap Profile 👤
            </p>

            <h1>
              My Profile
            </h1>

            <p>
              Your skills and SkillSwap details.
            </p>

          </div>


          <div className="profile-card">

            <div
              style={{
                textAlign: "center",
                marginBottom: "30px"
              }}
            >

              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background: "#eef2ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "45px",
                  margin: "auto"
                }}
              >
                👤
              </div>

              <h2
                style={{
                  marginTop: "15px"
                }}
              >
                {name || "SkillSwap User"}
              </h2>

            </div>


            <div style={{ marginBottom: "24px" }}>
              <h3>📝 About Me</h3>

              <p
                style={{
                  color: "#6b7280",
                  marginTop: "8px",
                  lineHeight: "1.6"
                }}
              >
                {bio || "No bio added yet."}
              </p>
            </div>


            <div style={{ marginBottom: "24px" }}>
              <h3>🎓 Skills I Offer</h3>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginTop: "10px"
                }}
              >
                {offered.length > 0 ? (
                  offered.map((skill, index) => (
                    <span
                      key={index}
                      style={{
                        background: "#eef2ff",
                        color: "#4f46e5",
                        padding: "7px 12px",
                        borderRadius: "20px",
                        fontSize: "14px",
                        fontWeight: "600"
                      }}
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p style={{ color: "#9ca3af" }}>
                    No skills added.
                  </p>
                )}
              </div>
            </div>


            <div style={{ marginBottom: "24px" }}>
              <h3>📚 Skills I Want</h3>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginTop: "10px"
                }}
              >
                {wanted.length > 0 ? (
                  wanted.map((skill, index) => (
                    <span
                      key={index}
                      style={{
                        background: "#f3f4f6",
                        color: "#374151",
                        padding: "7px 12px",
                        borderRadius: "20px",
                        fontSize: "14px",
                        fontWeight: "600"
                      }}
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p style={{ color: "#9ca3af" }}>
                    No skills added.
                  </p>
                )}
              </div>
            </div>


            <div style={{ marginBottom: "24px" }}>
              <h3>🕒 Availability</h3>

              <p
                style={{
                  color: "#6b7280",
                  marginTop: "8px"
                }}
              >
                {availability || "Not specified"}
              </p>
            </div>


            <div style={{ marginBottom: "24px" }}>
              <h3>📍 SkillSwap Meeting Location</h3>

              <p
                style={{
                  color: "#6b7280",
                  marginTop: "8px"
                }}
              >
                {skillSwapLocation || "Not specified"}
              </p>

              <p className="hint">
                This is your preferred meeting location,
                not your home address.
              </p>
            </div>


            <div style={{ marginBottom: "28px" }}>
              <h3>📞 Contact Number</h3>

              <p
                style={{
                  color: "#6b7280",
                  marginTop: "8px"
                }}
              >
                {contactNumber || "Not specified"}
              </p>
            </div>


            <button
              className="primary-btn"
              onClick={() => setIsEditing(true)}
              style={{
                width: "100%"
              }}
            >
              ✏️ Edit Profile
            </button>

          </div>

        </main>

      </div>
    );
  }


  // =========================================
  // EDIT / COMPLETE PROFILE
  // =========================================

  return (
    <div className="profile-page">

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


      <main className="profile-container">

        <div className="profile-header">

          <p className="small-text">
            {offeredSkills ||
            wantedSkills ||
            bio
              ? "Edit Your Profile ✏️"
              : "Your SkillSwap Profile"}
          </p>

          <h1>
            {offeredSkills ||
            wantedSkills ||
            bio
              ? "Edit Profile"
              : "Complete Your Profile"}
          </h1>

          <p>
            Add your skills and SkillSwap details.
          </p>

        </div>


        <div className="profile-card">

          <form onSubmit={handleSave}>

            <label>
              Your Name
            </label>

            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />


            <label>
              About You
            </label>

            <textarea
              rows="5"
              placeholder="Tell people about yourself"
              value={bio}
              onChange={(e) =>
                setBio(e.target.value)
              }
            />


            <label>
              🎓 Skills I Offer
            </label>

            <input
              type="text"
              placeholder="e.g. C++, Photoshop"
              value={offeredSkills}
              onChange={(e) =>
                setOfferedSkills(e.target.value)
              }
            />

            <p className="hint">
              Separate multiple skills with commas.
            </p>


            <label>
              📚 Skills I Want
            </label>

            <input
              type="text"
              placeholder="e.g. Python, Video Editing"
              value={wantedSkills}
              onChange={(e) =>
                setWantedSkills(e.target.value)
              }
            />

            <p className="hint">
              Separate multiple skills with commas.
            </p>


            <label>
              🕒 Availability
            </label>

            <select
              value={availability}
              onChange={(e) =>
                setAvailability(e.target.value)
              }
            >

              <option value="">
                Select availability
              </option>

              <option value="Flexible">
                Flexible
              </option>

              <option value="Weekdays">
                Weekdays
              </option>

              <option value="Weekends">
                Weekends
              </option>

              <option value="Evenings">
                Evenings
              </option>

              <option value="Mornings">
                Mornings
              </option>

            </select>


            <label>
              📍 SkillSwap Meeting Location
            </label>

            <input
              type="text"
              placeholder="e.g. College Library / Metro Station"
              value={skillSwapLocation}
              onChange={(e) =>
                setSkillSwapLocation(e.target.value)
              }
            />

            <p className="hint">
              Enter a public place where you want
              to meet/work for the skill exchange.
              Do not enter your home address.
            </p>


            <label>
              📞 Contact Number
            </label>

            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={contactNumber}
              onChange={(e) =>
                setContactNumber(e.target.value)
              }
            />

            <p className="hint">
              Your contact number is for
              SkillSwap communication.
            </p>


            <button
              type="submit"
              className="save-btn"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Profile"}
            </button>


            {(offeredSkills ||
              wantedSkills ||
              bio ||
              contactNumber ||
              skillSwapLocation) && (

              <button
                type="button"
                className="secondary-btn"
                onClick={() => setIsEditing(false)}
                style={{
                  width: "100%",
                  marginTop: "12px",
                  marginLeft: "0"
                }}
              >
                ← Cancel
              </button>

            )}

          </form>

        </div>

      </main>

    </div>
  );
}

export default Profile;
