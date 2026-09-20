import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import UserProfile from "./pages/UserProfile";
import Requests from "./pages/Requests";
import Rating from "./pages/Rating";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/search"
          element={<Search />}
        />

        <Route
          path="/user/:id"
          element={<UserProfile />}
        />

        <Route
          path="/requests"
          element={<Requests />}
        />

        <Route
          path="/rating"
          element={<Rating />}
        />

      </Routes>

    </BrowserRouter>

  );
}

export default App;
