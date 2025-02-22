import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from 'lucide-react'; // Import icons if you have lucide-react
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
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
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when clicking a link
  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="app-container">
      {/* Mobile Menu Toggle Button */}
      <button 
        className="mobile-menu-toggle"
        onClick={toggleMobileMenu}
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Navigation */}
      <nav className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="logo" onClick={handleNavClick}>
            <span className="logo-emoji">🍽️</span>
            <span className="logo-text">SpoonFed</span>
          </Link>
        </div>

        <div className="nav-links">
          <Link
            to="/"
            className={`nav-item ${currentPage === "/" ? "active" : ""}`}
            onClick={handleNavClick}
          >
            Home
          </Link>
          
          {isLoggedIn && (
            <>
              <Link
                to="/dashboard"
                className={`nav-item ${currentPage === "/dashboard" ? "active" : ""}`}
                onClick={handleNavClick}
              >
                Recipes
              </Link>
              
              <Link
                to="/profile"
                className={`nav-item ${currentPage === "/profile" ? "active" : ""}`}
                onClick={handleNavClick}
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
                  onClick={handleNavClick}
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
            <Link to="/login" className="login-button" onClick={handleNavClick}>
              Login
            </Link>
          )}
        </div>
      </nav>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className={`main-content ${isMobileMenuOpen ? 'blur' : ''}`}>
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