import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import ChatBox from "../components/chatbox";
import AuthService, { StorageKeys } from "../utils/auth";
import '../styles/navtabs.css';

interface Recipe {
  id: string;
  title: string;
  savedAt: string;
  imageUrl?: string;
  sourceUrl?: string;
}

const Navtabs = () => {
  const currentPage = window.location.pathname;
  const [username, setUsername] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);

  const SPOONACULAR_API_KEY = process.env.REACT_APP_SPOONACULAR_API_KEY || "";

  useEffect(() => {
    const checkAuthAndLoadData = () => {
      const loggedIn = AuthService.loggedIn();
      setIsLoggedIn(loggedIn);
      
      if (loggedIn) {
        const currentUsername = AuthService.getUsername();
        setUsername(currentUsername);
        
        const userId = AuthService.getUserId();
        if (userId) {
          const recipes = AuthService.loadFromStorage(StorageKeys.savedRecipes(userId));
          if (recipes) {
            setSavedRecipes(recipes);
          }
        }
      }
    };

    checkAuthAndLoadData();
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    setIsLoggedIn(false);
    setUsername("");
    setSavedRecipes([]);
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <div className="sidebar-header">
          <Link to="/" className="logo">
            <span className="logo-emoji">🍽️</span>
            <span className="logo-text">SpoonFed</span>
          </Link>
        </div>

        <div className="nav-links">
          <Link
            to="/"
            className={`nav-item ${currentPage === "/" ? "active" : ""}`}
          >
            Home
          </Link>
          
          {isLoggedIn && (
            <>
              <Link
                to="/dashboard"
                className={`nav-item ${currentPage === "/dashboard" ? "active" : ""}`}
              >
                Recipes
              </Link>
              
              <Link
                to="/profile"
                className={`nav-item ${currentPage === "/profile" ? "active" : ""}`}
              >
                Profile
              </Link>
            </>
          )}
        </div>

        {isLoggedIn && savedRecipes.length > 0 && (
          <div className="saved-recipes">
            <h3 className="section-title">Recent Saved Recipes</h3>
            <div className="saved-recipes-list">
              {savedRecipes.slice(0, 3).map(recipe => (
                <Link
                  key={recipe.id}
                  to={`/recipe/${recipe.id}`}
                  className="saved-recipe-item"
                >
                  {recipe.title}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="auth-section">
          {isLoggedIn ? (
            <div className="user-info">
              <span className="username">Welcome, {username}</span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-button">
              Login
            </Link>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* Your page content will be rendered here */}
      </main>

      {/* ChatBox */}
      {isLoggedIn && (
        <div className="chat-box-container">
          <ChatBox spoonacularApiKey={SPOONACULAR_API_KEY} />
        </div>
      )}
    </div>
  );
};

export default Navtabs;