import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import RecipeCard from '../components/Recipecard';
import { Recipe, Pairing } from '../interfaces/recipe';
import '../styles/dashboard.css';
import { useNavigate } from 'react-router-dom';
import Auth from '../utils/auth';
import ImageCapture from '../components/ImageCapture';



const SPOONACULAR_API_KEY = 'd3b3d405a2914387bdbfd0ce59bdaca1';
const COCKTAIL_API_KEY = 'ed394f7afdmshbb5c5a3c0efb5e2p109c0ajsn5aa3588aa1e5';
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com/recipes';

const availableIngredients = [
  'Chicken', 'Rice', 'Tomatoes', 'Onions', 'Garlic',
  'Bell Peppers', 'Pasta', 'Ground Beef', 'Potatoes',
  'Carrots', 'Apples',
];

const Dashboard: React.FC = () => {
  const [currentIngredient, setCurrentIngredient] = useState<string>('');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const navigate = useNavigate();

  // Load saved recipes when component mounts
  useEffect(() => {
    const username = Auth.getUsername();
    if (username) {
      const storedRecipesKey = `savedRecipes_${(username as string).toLowerCase()}`;
      const existingRecipesJson = localStorage.getItem(storedRecipesKey);
      
      if (existingRecipesJson) {
        try {
          const parsedRecipes = JSON.parse(existingRecipesJson);
          if (Array.isArray(parsedRecipes)) {
            setSavedRecipes(parsedRecipes);
          }
        } catch (error) {
          console.error('Error parsing saved recipes:', error);
        }
      }
    }
  }, []);

  const handleIngredientChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentIngredient(e.target.value);
  };

  const handleAddIngredient = (e: FormEvent) => {
    e.preventDefault();
    if (currentIngredient.trim() && !selectedIngredients.includes(currentIngredient.trim())) {
      setSelectedIngredients([...selectedIngredients, currentIngredient.trim()]);
      setCurrentIngredient('');
    }
  };

  const handleRemoveIngredient = (ingredientToRemove: string) => {
    setSelectedIngredients(selectedIngredients.filter(ing => ing !== ingredientToRemove));
  };

  const handleIngredientsDetected = (detectedIngredients: string[]) => {
    // Filter out any duplicates and add to selected ingredients
    const newIngredients = detectedIngredients.filter(
      ingredient => !selectedIngredients.includes(ingredient)
    );
    setSelectedIngredients([...selectedIngredients, ...newIngredients]);
  };

  const searchRecipes = async (ingredients: string[]): Promise<Recipe[]> => {
    try {
      const ingredientsString = ingredients.join(',');
      const response = await fetch(
        `${SPOONACULAR_BASE_URL}/findByIngredients?apiKey=${SPOONACULAR_API_KEY}&ingredients=${ingredientsString}&number=10`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return await Promise.all(data.map(async (item: any) => {
        const detailedRecipe = await getRecipeDetails(item.id.toString());
        const pairings = await getRecipePairings(item.id.toString());
        
        return {
          id: item.id.toString(),
          title: item.title,
          imageUrl: item.image,
          image: item.image,
          ingredients: detailedRecipe.ingredients,
          instructions: detailedRecipe.instructions,
          usedIngredients: item.usedIngredients.map((ing: any) => ing.name),
          missedIngredients: item.missedIngredients.map((ing: any) => ing.name),
          usedIngredientCount: item.usedIngredientCount,
          missedIngredientCount: item.missedIngredientCount,
          pairings: pairings,
          isFavorite: false,
          searchMode: true,
          foodGroup: determineFoodGroup(detailedRecipe.ingredients),
          sourceUrl: detailedRecipe.sourceUrl,
          matchingIngredients: '',
          name: item.title,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }));
    } catch (error) {
      console.error('Error searching recipes:', error);
      throw error;
    }
  };

  const getRecipeDetails = async (recipeId: string): Promise<any> => {
    try {
      const response = await fetch(
        `${SPOONACULAR_BASE_URL}/${recipeId}/information?apiKey=${SPOONACULAR_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch recipe details');
      }

      const data = await response.json();
      return {
        ingredients: data.extendedIngredients?.map((ing: any) => ing.original) || [],
        instructions: data.instructions?.split('\n').filter(Boolean) || [],
        sourceUrl: data.sourceUrl
      };
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      return { ingredients: [], instructions: [], sourceUrl: null };
    }
  };

  const getRecipePairings = async (_recipeId: string): Promise<Pairing[]> => {
    try {
      let pairings: Pairing[] = [];

      const cocktailResponse = await fetch('https://the-cocktail-db.p.rapidapi.com/random.php', {
        headers: {
          'X-RapidAPI-Key': COCKTAIL_API_KEY,
          'X-RapidAPI-Host': 'the-cocktail-db.p.rapidapi.com'
        }
      });

      if (cocktailResponse.ok) {
        const cocktailData = await cocktailResponse.json();
        const drink = cocktailData.drinks?.[0];
        if (drink) {
          pairings.push({
            id: drink.idDrink,
            type: 'drink',
            name: drink.strDrink,
            description: drink.strInstructions,
            imageUrl: drink.strDrinkThumb
          });
        }
      }

      const dessertResponse = await fetch('https://themealdb.p.rapidapi.com/filter.php?c=Dessert', {
        headers: {
          'X-RapidAPI-Key': COCKTAIL_API_KEY,
          'X-RapidAPI-Host': 'themealdb.p.rapidapi.com'
        }
      });

      if (dessertResponse.ok) {
        const dessertData = await dessertResponse.json();
        if (dessertData.meals && dessertData.meals.length > 0) {
          const randomIndex = Math.floor(Math.random() * dessertData.meals.length);
          const dessert = dessertData.meals[randomIndex];

          const dessertDetailsResponse = await fetch(`https://themealdb.p.rapidapi.com/lookup.php?i=${dessert.idMeal}`, {
            headers: {
              'X-RapidAPI-Key': COCKTAIL_API_KEY,
              'X-RapidAPI-Host': 'themealdb.p.rapidapi.com'
            }
          });

          if (dessertDetailsResponse.ok) {
            const dessertDetails = await dessertDetailsResponse.json();
            const detailedDessert = dessertDetails.meals?.[0];
            
            if (detailedDessert) {
              pairings.push({
                id: detailedDessert.idMeal,
                type: 'dessert',
                name: detailedDessert.strMeal,
                description: detailedDessert.strInstructions,
                imageUrl: detailedDessert.strMealThumb
              });
            }
          }
        }
      }

      return pairings;
    } catch (error) {
      console.error('Error fetching pairings:', error);
      return [];
    }
  };

  const handleSearch = async () => {
    if (selectedIngredients.length === 0) {
      setError('Please select at least one ingredient');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const recipesData = await searchRecipes(selectedIngredients);
      setRecipes(recipesData);
      
      if (recipesData.length === 0) {
        setError('No recipes found with selected ingredients');
      }
    } catch (error) {
      console.error('Failed to search recipes:', error);
      setError('Failed to search recipes');
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRecipe = (recipe: Recipe) => {
    try {
      const username = Auth.getUsername();
      if (!username) {
        setError('Please log in to save recipes');
        return;
      }
  
      // Use consistent key format with username from Auth
      const storedRecipesKey = `savedRecipes_${username}`; // Remove toLowerCase()
      let existingRecipes: Recipe[] = [];
      
      try {
        const existingRecipesJson = localStorage.getItem(storedRecipesKey);
        if (existingRecipesJson) {
          existingRecipes = JSON.parse(existingRecipesJson);
          if (!Array.isArray(existingRecipes)) {
            existingRecipes = [];
          }
        }
      } catch (parseError) {
        console.error('Error parsing stored recipes:', parseError);
        existingRecipes = [];
      }

      // Check if recipe already exists
      const isAlreadySaved = existingRecipes.some(savedRecipe => 
        savedRecipe.id === recipe.id
      );
      
      if (isAlreadySaved) {
        setError('Recipe is already saved');
        return;
      }

      const savedRecipe = {
        ...recipe,
        savedAt: new Date().toISOString()
      };

      const updatedRecipes = [...existingRecipes, savedRecipe];
      localStorage.setItem(storedRecipesKey, JSON.stringify(updatedRecipes));
      setSavedRecipes(updatedRecipes);
      setError('Recipe saved successfully!');
      setTimeout(() => setError(null), 2000);

      // Navigate after a short delay
      setTimeout(() => {
        navigate('/profile', { replace: false });
      }, 500);

    } catch (error) {
      console.error('Error in handleSaveRecipe:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const determineFoodGroup = (ingredients: string[]): string => {
    const lowerIngredients = ingredients.map(i => i.toLowerCase());
    
    if (lowerIngredients.some(i => ['chicken', 'beef', 'fish', 'pork', 'meat'].some(meat => i.includes(meat)))) {
      return 'Protein';
    }
    if (lowerIngredients.some(i => ['milk', 'cheese', 'yogurt', 'cream'].some(dairy => i.includes(dairy)))) {
      return 'Dairy';
    }
    if (lowerIngredients.some(i => ['apple', 'banana', 'orange', 'berry', 'fruit'].some(fruit => i.includes(fruit)))) {
      return 'Fruits';
    }
    if (lowerIngredients.some(i => ['carrot', 'broccoli', 'spinach', 'vegetable'].some(veg => i.includes(veg)))) {
      return 'Vegetables';
    }
    if (lowerIngredients.some(i => ['rice', 'pasta', 'bread', 'wheat', 'grain'].some(grain => i.includes(grain)))) {
      return 'Grains';
    }
    return 'Other';
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Recipe Explorer</h1>
        <p className="text-description">Your personalized Cookbook</p>
      </div>
      
      {error && (
        <div className={`message ${error.includes('successfully') ? 'success' : 'error'}`}>
          <p>{error}</p>
        </div>
      )}
      <div className="image-capture-container">
  <h2 className="section-title">Take a Photo of Your Food</h2>
  <ImageCapture onIngredientsDetected={handleIngredientsDetected} />
</div>
<div className="search-bar-container">
        <form onSubmit={handleAddIngredient}>
          <div className="input-group">
            <input
              type="text"
              value={currentIngredient}
              onChange={handleIngredientChange}
              placeholder="Enter an ingredient"
              list="ingredients-list"
            />
            <datalist id="ingredients-list">
              {availableIngredients.map((ingredient) => (
                <option key={ingredient} value={ingredient} />
              ))}
            </datalist>
            <button type="submit" className="button">
              Add
            </button>
          </div>
        </form>

        {selectedIngredients.length > 0 && (
          <div className="selected-ingredients">
            <h2 className="section-title">Selected Ingredients:</h2>
            <div className="ingredient-tags">
              {selectedIngredients.map((ingredient, index) => (
                <span key={index} className="ingredient-tag">
                  {ingredient}
                  <button
                    onClick={() => handleRemoveIngredient(ingredient)}
                    className="remove-ingredient"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <button onClick={handleSearch} className="button search-button">
              Search Recipes
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <div className="recipe-grid">
          {recipes.slice(0, 6).map((recipe) => {
            const cocktailPairing = recipe.pairings?.find((pairing) => pairing.type === 'drink');
            const isSaved = savedRecipes.some(savedRecipe => savedRecipe.id === recipe.id);

            return (
              <RecipeCard 
                key={recipe.id}
                recipe={recipe}
                recipeId={recipe.id}
                onSave={() => handleSaveRecipe(recipe)}
                onDelete={() => {}} 
                isSaved={isSaved}
                showSaveDelete={true}
                cocktailPairing={cocktailPairing}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;