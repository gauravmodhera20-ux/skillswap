import { useState } from "react";
import {
  createUserWithEmailAndPassword
} from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

import { auth, db } from "../firebase/config";
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSignup(e) {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      // 1. Create Firebase Auth account
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = result.user;

      // 2. Create Firestore user profile
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        bio: "",
        offeredSkills: [],
        wantedSkills: [],
        availability: "",
        rating: 0,
        createdAt: serverTimestamp()
      });

      // 3. Go to profile
      navigate("/profile");

    } catch (error) {
      console.error(error);

      if (error.code === "auth/email-already-in-use") {
        alert("This email is already registered. Try Login.");
      } else if (error.code === "auth/invalid-email") {
        alert("Please enter a valid email.");
      } else if (error.code === "auth/weak-password") {
        alert("Password must be at least 6 characters.");
      } else if (error.code === "permission-denied") {
        alert("Firestore permission denied. Check Firebase Rules.");
      } else {
        alert(error.message);
      }

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">

      <h1>Create Account</h1>

      <form onSubmit={handleSignup}>

        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>

      </form>

    </div>
  );
}

export default Signup;
