import React from "react";
import { Link } from "react-router-dom";
import '../styles/Mainpage.css'

const MainPage: React.FC = () => {
  return (
    <div className="main-page">
      <div className="hero-container">
        {/* Logo */}
        <img
          src="/images/Spoonfed.png"
          alt="Spoon Fed Logo"
          className="logo"
        />

        {/* Main Title */}
        <h1 className="main-title">Spoon Fed</h1>

        {/* Subtitle */}
        <p className="subtitle">
          Your culinary companion for discovering, saving, and sharing delicious recipes tailored to your ingredients
        </p>

        {/* Call to Action Buttons */}
        <div className="cta-container">
          <Link 
            to="/dashboard" 
            className="cta-button cta-primary"
          >
            Find Recipes
          </Link>
          <Link 
            to="/ingredients" 
            className="cta-button cta-secondary"
          >
            Browse Ingredients
          </Link>
        </div>

        {/* Features */}
        <div className="features">
          <Link to="ingredient-page" className="feature-card">
            <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <h3 className="feature-title">Smart Matching</h3>
            <p className="feature-description">Find recipes based on ingredients you have</p>
          </Link>

          <Link to="/profile" className="feature-card">
            <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <h3 className="feature-title">Save & Organize</h3>
            <p className="feature-description">Collect and manage your favorite recipes</p>
          </Link>

          <Link to="/saved-recipes" className="feature-card">
            <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="feature-title">Quick Discovery</h3>
            <p className="feature-description">Find out what other cooking!</p>
          </Link>
        </div>
      </div>
      

      {/* Footer */}
      <footer className="main-footer">
        <p>© {new Date().getFullYear()} Spoon Fed. Cooking made easy.</p>
      </footer>
  </div>

  );
};

export default MainPage;