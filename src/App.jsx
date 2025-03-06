import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import { useAuth } from "./context/AuthContext";
import RecipeList from "./components/RecipeList";
import RecipeDetail from "./components/RecipeDetail";
import RecipeForm from "./components/RecipeForm";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import MyFavorites from "./pages/MyFavorites";
import Profile from "./pages/Profile";
import MyRecipes from "./pages/MyRecipes";
import UserAvatar from "./components/UserAvatar";

function App() {
  const { user, logout } = useAuth();

  return (
    <Router>
      <div className="App">
        <nav className="navbar navbar-expand-lg navbar-dark">
          <div className="container">
            <Link className="navbar-brand savora-brand" to="/">
              Savora
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <Link className="nav-link" to="/">
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/recipes">
                    Recipes
                  </Link>
                </li>
                {user && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/add-recipe">
                        Add Recipe
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/my-recipes">
                        My Recipes
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/favorites">
                        My Favorites
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/profile">
                        Profile
                      </Link>
                    </li>
                  </>
                )}
              </ul>
              <ul className="navbar-nav">
                {user ? (
                  <>
                    <li className="nav-item">
                      <span className="nav-link user-welcome">
                        <UserAvatar user={user} />
                        Welcome, {user.username}!
                      </span>
                    </li>
                    <li className="nav-item">
                      <button
                        className="btn btn-link nav-link"
                        onClick={logout}
                      >
                        Logout
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/login">
                        Login
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/register">
                        Register
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </nav>

        <main className="container mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recipes" element={<RecipeList />} />
            <Route path="/recipes/:id" element={<RecipeDetail />} />
            <Route path="/recipes/:id/edit" element={<RecipeForm />} />
            <Route path="/add-recipe" element={<RecipeForm />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/favorites" element={<MyFavorites />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-recipes" element={<MyRecipes />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

const Home = () => (
  <div className="home-container">
    <div className="text-center w-100">
      <h1 className="savora-title">Welcome to Savora</h1>
      <p className="lead">Discover and share amazing recipes with style!</p>
    </div>
  </div>
);

export default App;
