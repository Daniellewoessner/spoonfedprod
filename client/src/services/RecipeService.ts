import { Recipe, Pairing } from '../interfaces/recipe';
import { Drink, Dessert } from '../interfaces/Baseitem';

const SPOONACULAR_API_KEY = 'e2537b3be41447b78c479963501a884b';
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com/recipes';
const RAPIDAPI_KEY = 'your_rapidapi_key_here';
const COCKTAIL_API_URL = 'https://the-cocktail-db.p.rapidapi.com';
const DESSERT_API_URL = 'your_dessert_api_endpoint';

// RecipeService.ts
export const getRecipeDetails = async (recipeId: string): Promise<Recipe> => {
  try {
    const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${SPOONACULAR_API_KEY}`);
    
    if (!response.ok) {
      throw new Error('API call failed: ${response.status}');

    }
    const data = await response.json();
    console.log('Recipe Details Response:', data);

    const recipe: Recipe = {
      id: data.id.toString(),
      title: data.title,
      description: data.summary || undefined,
      summary: data.summary || undefined,
      cookTime: data.cookTime || undefined,
      readyInMinutes: data.readyInMinutes || undefined,
      servings: data.servings || undefined,
      ingredients: data.extendedIngredients?.map((ing: any) => ing.original) || [],
      instructions: data.instructions?.split('\n').filter(Boolean) || [],
      imageUrl: data.image || undefined,
      image: data.image || undefined,
      spoonacularId: data.id || undefined,
      usedIngredients: [],
      missedIngredients: [],
      usedIngredientCount: 0,
      missedIngredientCount: 0,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      suggestedPairings: [], // Will be populated by searchCocktailPairings and searchDessertPairings
      customPairings: [], // Can be populated by user input or other sources
      pairings: [] // Will be populated with combined pairings
      ,


      searchMode: false,
      handleIngredientSearch: undefined,
      sourceUrl: undefined,
      matchingIngredients: data,
      savedAt: ''
    };

    // Fetch pairings asynchronously
    const [drinks, desserts] = await Promise.all([
      searchCocktailPairings(recipeId),
      searchDessertPairings(recipeId)
    ]);

    // Convert drinks and desserts to Pairing type
    const drinkPairings: Pairing[] = drinks.map(drink => ({
      id: drink.id,
      type: 'drink',
      name: drink.name,
      description: drink.description,
      imageUrl: drink.imageUrl
    }));

    const dessertPairings: Pairing[] = desserts.map(dessert => ({
      id: dessert.id,
      type: 'dessert',
      name: dessert.name,
      description: dessert.description,
      imageUrl: dessert.imageUrl
    }));

    // Add pairings to recipe
    recipe.pairings = [...drinkPairings, ...dessertPairings];
    recipe.suggestedPairings = recipe.pairings; // If you want to separate them
    
    return recipe;

  } catch (error) {
    console.error('Error fetching recipe details:', error);
    throw error;
  }
};

export const searchRecipes = async (ingredients: string[]): Promise<Recipe[]> => {
  try {
    const ingredientsString = ingredients.join(',');
    const response = await fetch(
      `${SPOONACULAR_BASE_URL}/findByIngredients?apiKey=${SPOONACULAR_API_KEY}&ingredients=${ingredientsString}&number=10`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Recipe Search Response:', data);

    return data.map((item: any): Recipe => ({
      id: item.id.toString(),
      title: item.title,
      ingredients: [], // This endpoint doesn't return full ingredients
      instructions: [], // This endpoint doesn't return instructions
      image: item.image,
      imageUrl: item.image,
      missedIngredientCount: item.missedIngredientCount,
      missedIngredients: item.missedIngredients.map((ing: any) => ing.name),
      usedIngredientCount: item.usedIngredientCount,
      usedIngredients: item.usedIngredients.map((ing: any) => ing.name),
      suggestedPairings: [],
      customPairings: [],
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      searchMode: true,
      sourceUrl: undefined,
      matchingIngredients: '',
      savedAt: ''
    }));

  } catch (error) {
    console.error('Error searching recipes:', error);
    throw error;
  }
};

// Get cocktail pairings
export const searchCocktailPairings = async (_recipeId: string): Promise<Drink[]> => {
  try {
    // Using TheCocktailDB API through RapidAPI
    const response = await fetch(`${COCKTAIL_API_URL}/filter.php?c=Cocktail`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'the-cocktail-db.p.rapidapi.com',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Cocktail Pairings Response:', data);

    // Return only first 3 drinks as pairings
    return (data.drinks || []).slice(0, 3).map((drink: any) => ({
      id: drink.idDrink,
      name: drink.strDrink,
      description: 'A perfectly paired cocktail for your meal',
      type: 'drink',
      imageUrl: drink.strDrinkThumb
    }));
  } catch (error) {
    console.error('Error fetching cocktail pairings:', error);
    throw error;
  }
};

// Get dessert pairings
export const searchDessertPairings = async (_recipeId: string): Promise<Dessert[]> => {
  try {
    const response = await fetch(DESSERT_API_URL, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': new URL(DESSERT_API_URL).hostname,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Dessert Pairings Response:', data);

    // Return only first 3 desserts as pairings
    return data.slice(0, 3).map((dessert: any) => ({
      id: dessert.id.toString(),
      name: dessert.name,
      description: dessert.description || 'A delightful dessert pairing',
      type: 'dessert',
      imageUrl: dessert.image
    }));
  } catch (error) {
    console.error('Error fetching dessert pairings:', error);
    throw error;
  }
};

// Save a recipe to favorites
export const saveRecipe = async (recipe: Recipe): Promise<void> => {
  try {
    const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    if (!savedRecipes.some((saved: Recipe) => saved.id === recipe.id)) {
      savedRecipes.push(recipe);
      localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
    }
  } catch (error) {
    console.error('Error saving recipe:', error);
    throw error;
  }
};

// Get saved recipes
export const getSavedRecipes = (): Recipe[] => {
  try {
    return JSON.parse(localStorage.getItem('savedRecipes') || '[]');
  } catch (error) {
    console.error('Error getting saved recipes:', error);
    return [];
  }
};

// Remove a recipe from saved recipes
export const removeSavedRecipe = (recipeId: string): void => {
  try {
    const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    const updatedRecipes = savedRecipes.filter((recipe: Recipe) => recipe.id !== recipeId);
    localStorage.setItem('savedRecipes', JSON.stringify(updatedRecipes));
  } catch (error) {
    console.error('Error removing saved recipe:', error);
    throw error;
  }
};
