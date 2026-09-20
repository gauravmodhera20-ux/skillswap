import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);

      // Login successful
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      console.log("FIREBASE ERROR CODE:",error.code);
      console.log("FIREBASE ERROR MESSAGE:",error.message);
       alert(error.code + "-" + ErrorEvent.message);
      setError("Invalid email or password.");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h1>Welcome Back 👋</h1>
        <p>Login to continue your SkillSwap journey.</p>

        <form onSubmit={handleLogin}>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="error">{error}</p>}

          <button type="submit">
            Login
          </button>

        </form>

        <p>
          Don't have an account?{" "}
          <Link to="/signup">Create Account</Link>
        </p>

      </div>
    </div>
  );
}

export default Login;
