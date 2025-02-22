import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import { Recipe } from '../interfaces/recipe';
import Auth, { StorageKeys } from '../utils/auth';
import '../styles/userprofile.css';

interface UserPreferences {
  dietaryRestrictions: string[];
  favoritesCuisines: string[];
  cookingSkillLevel: string;
}

interface UserProfile {
  name: string;
  email: string;
  bio: string;
  profilePicture?: string;
  preferences: UserPreferences;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  dietaryRestrictions: [],
  favoritesCuisines: [],
  cookingSkillLevel: 'intermediate'
};

const SKILL_LEVELS = [
  { value: 'beginner', label: 'Beginner Chef' },
  { value: 'intermediate', label: 'Home Cook' },
  { value: 'advanced', label: 'Professional Chef' }
];

const DIETARY_RESTRICTIONS = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free'
];

const CUISINE_TYPES = [
  'Italian', 'Mexican', 'Chinese', 'Indian', 'Mediterranean', 
  'Japanese', 'Thai', 'French', 'American', 'Greek'
];

const UserProfilePage: React.FC = () => {
  const username = (Auth.getUsername() as string) || '';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    name: username || '',
    email: '',
    bio: '',
    profilePicture: '',
    preferences: DEFAULT_PREFERENCES
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (username) {
      // Load profile
      const savedProfile = Auth.loadFromStorage(StorageKeys.userProfile(username));
      if (savedProfile) {
        setProfile(savedProfile);
      }

      // Load saved recipes
      const storedRecipesKey = `savedRecipes_${username}`;
      const recipesJson = localStorage.getItem(storedRecipesKey);
      
      if (recipesJson) {
        try {
          const parsedRecipes = JSON.parse(recipesJson);
          if (Array.isArray(parsedRecipes)) {
            setSavedRecipes(parsedRecipes);
          }
        } catch (error) {
          console.error('Error parsing saved recipes:', error);
          setSavedRecipes([]);
        }
      }
    }
  }, [username]);

  const saveProfileToStorage = (updatedProfile: UserProfile) => {
    if (username) {
      return Auth.saveToStorage(StorageKeys.userProfile(username), updatedProfile);
    }
    return false;
  };

  const handleProfilePictureChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        setErrorMessage('Invalid file type. Please upload a JPEG, PNG, or GIF.');
        return;
      }

      if (file.size > maxSize) {
        setErrorMessage('File is too large. Maximum size is 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        
        const updatedProfile = {
          ...profile,
          profilePicture: base64String
        };
        
        if (saveProfileToStorage(updatedProfile)) {
          setProfile(updatedProfile);
          setSuccessMessage('Profile picture updated successfully!');
          setTimeout(() => setSuccessMessage(null), 3000);
        } else {
          setErrorMessage('Failed to save profile picture');
          setTimeout(() => setErrorMessage(null), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSaveProfile = () => {
    if (!username) {
      setErrorMessage('Please log in to save profile');
      return;
    }

    try {
      if (saveProfileToStorage(profile)) {
        setIsEditing(false);
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error('Failed to save profile');
      }
    } catch (error) {
      setErrorMessage('Failed to save profile');
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };


  const handleRemoveSavedRecipe = (recipeId: string) => {
    if (!username) return;

    try {
      const updatedRecipes = savedRecipes.filter(recipe => recipe.id !== recipeId);
      const storedRecipesKey = `savedRecipes_${username}`;
      
      localStorage.setItem(storedRecipesKey, JSON.stringify(updatedRecipes));
      setSavedRecipes(updatedRecipes);
      setSuccessMessage('Recipe removed successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error removing recipe:', error);
      setErrorMessage('Failed to remove recipe');
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const handlePreferenceChange = (
    category: keyof UserPreferences,
    value: string | string[]
  ) => {
    const updatedProfile = {
      ...profile,
      preferences: {
        ...profile.preferences,
        [category]: value
      }
    };
    setProfile(updatedProfile);
    saveProfileToStorage(updatedProfile);
  };

  const toggleDietaryRestriction = (restriction: string) => {
    const currentRestrictions = profile.preferences.dietaryRestrictions;
    const updatedRestrictions = currentRestrictions.includes(restriction)
      ? currentRestrictions.filter(r => r !== restriction)
      : [...currentRestrictions, restriction];
    
    handlePreferenceChange('dietaryRestrictions', updatedRestrictions);
  };

  const toggleFavoriteCuisine = (cuisine: string) => {
    const currentCuisines = profile.preferences.favoritesCuisines;
    const updatedCuisines = currentCuisines.includes(cuisine)
      ? currentCuisines.filter(c => c !== cuisine)
      : [...currentCuisines, cuisine];
    
    handlePreferenceChange('favoritesCuisines', updatedCuisines);
  };

  if (!username) {
    return (
      <div className="profile-container">
        <div className="message error">Please log in to view your profile</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div 
          className="profile-avatar"
          onClick={triggerFileInput}
          style={{ cursor: 'pointer', position: 'relative' }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleProfilePictureChange}
            accept="image/jpeg,image/png,image/gif"
            style={{ display: 'none' }}
          />

          <div 
            className="profile-avatar-icon"
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              backgroundColor: profile.profilePicture ? 'transparent' : "#4A5568",
              backgroundImage: profile.profilePicture ? `url(${profile.profilePicture})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {!profile.profilePicture && (profile.name ? profile.name[0].toUpperCase() : username[0].toUpperCase())}
            
            <div 
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                width: '100%',
                textAlign: 'center',
                color: 'white',
                padding: '5px 0'
              }}
            >
              Edit
            </div>
          </div>
        </div>

        <h1 className="profile-title">Your Culinary Profile</h1>
        <p className="profile-subtitle">Customize your cooking preferences and saved recipes</p>
      </div>

      {(successMessage || errorMessage) && (
        <div className={`message ${successMessage ? 'success' : 'error'}`}>
          {successMessage || errorMessage}
        </div>
      )}

      <div className="profile-grid">
        <div className="profile-left">
          {/* Profile Details Section */}
          <div className="profile-section">
            <div className="section-header">
              <h2 className="section-title">Profile Details</h2>
              <button
                className="profile-button secondary"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>
            <div className="section-content">
              {isEditing ? (
                <div className="profile-form">
                  <div className="profile-form-group">
                    <label className="profile-label">Name</label>
                    <input
                      type="text"
                      className="profile-input"
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="profile-form-group">
                    <label className="profile-label">Email</label>
                    <input
                      type="email"
                      className="profile-input"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="profile-form-group">
                    <label className="profile-label">Bio</label>
                    <textarea
                      className="profile-input profile-textarea"
                      value={profile.bio}
                      onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about your cooking journey..."
                    />
                  </div>
                  <button
                    className="profile-button primary"
                    onClick={handleSaveProfile}
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <div className="profile-info">
                  <div className="profile-form-group">
                    <label className="profile-label">Name</label>
                    <p className="profile-value">{profile.name || username}</p>
                  </div>
                  <div className="profile-form-group">
                    <label className="profile-label">Email</label>
                    <p className="profile-value">{profile.email || 'Not set'}</p>
                  </div>
                  <div className="profile-form-group">
                    <label className="profile-label">Bio</label>
                    <p className="profile-value">{profile.bio || 'No bio yet'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cooking Preferences Section */}
          <div className="profile-section">
            <div className="section-header">
              <h2 className="section-title">Cooking Preferences</h2>
            </div>
            <div className="section-content">
              <div className="profile-form-group">
                <label className="profile-label">Cooking Skill Level</label>
                <select
                  className="profile-input"
                  value={profile.preferences.cookingSkillLevel}
                  onChange={(e) => handlePreferenceChange('cookingSkillLevel', e.target.value)}
                >
                  {SKILL_LEVELS.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="profile-form-group">
                <label className="profile-label">Dietary Restrictions</label>
                <div className="preferences-grid">
                  {DIETARY_RESTRICTIONS.map(restriction => (
                    <label key={restriction} className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={profile.preferences.dietaryRestrictions.includes(restriction)}
                        onChange={() => toggleDietaryRestriction(restriction)}
                      />
                      <span className="checkmark"></span>
                      {restriction}
                    </label>
                  ))}
                </div>
              </div>

              <div className="profile-form-group">
                <label className="profile-label">Favorite Cuisines</label>
                <div className="preferences-grid">
                  {CUISINE_TYPES.map(cuisine => (
                    <label key={cuisine} className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={profile.preferences.favoritesCuisines.includes(cuisine)}
                        onChange={() => toggleFavoriteCuisine(cuisine)}
                      />
                      <span className="checkmark"></span>
                      {cuisine}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Saved Recipes Section */}
        <div className="profile-section saved-recipes-section">
          <div className="section-header">
            <h2 className="section-title">My Personal Cookbook!</h2>
          </div>
          <div className="section-content">
            {savedRecipes.length > 0 ? (
              <div className="saved-recipes-grid">
                {savedRecipes.map((recipe) => (
                  <div key={recipe.id} className="saved-recipe-card">
                    <img 
                      src={recipe.imageUrl || recipe.image} 
                      alt={recipe.title} 
                      className="saved-recipe-image"
                    />
                    <div className="saved-recipe-details">
                      <h3 className="saved-recipe-title">{recipe.title}</h3>
                      <p className="saved-recipe-date">
                        Saved on: {new Date(recipe.savedAt || Date.now()).toLocaleDateString()}
                      </p>
                      <div className="saved-recipe-actions">
                        <a 
                          href={recipe.sourceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="view-recipe-link"
                        >
                          View Recipe
                        </a>
                        <button 
                          className="remove-saved-recipe"
                          onClick={() => handleRemoveSavedRecipe(recipe.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-saved-recipes">You haven't saved any recipes yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;