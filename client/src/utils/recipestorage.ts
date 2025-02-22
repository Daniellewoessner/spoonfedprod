// utils/recipeStorage.ts
import { Recipe } from '../interfaces/recipe';

export class RecipeStorage {
  private static readonly STORAGE_PREFIX = 'savedRecipes_';

  // Helper method to generate storage key
  private static getStorageKey(userId: string): string {
    return `${RecipeStorage.STORAGE_PREFIX}${userId}`;
  }

  // Helper method to validate userId
  private static validateUserId(userId: string): void {
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID');
    }
  }

  // Save recipes for a user
  static saveRecipes(userId: string, recipes: Recipe[]): boolean {
    try {
      RecipeStorage.validateUserId(userId);
      
      // Validate recipes array
      if (!Array.isArray(recipes)) {
        throw new Error('Invalid recipes data');
      }

      const storageKey = RecipeStorage.getStorageKey(userId);
      const recipesWithTimestamp = recipes.map(recipe => ({
        ...recipe,
        savedAt: recipe.savedAt || new Date().toISOString()
      }));

      sessionStorage.setItem(storageKey, JSON.stringify(recipesWithTimestamp));
      return true;
    } catch (error) {
      console.error('Error saving recipes:', error);
      return false;
    }
  }

  // Load recipes for a user
  static loadRecipes(userId: string): Recipe[] {
    try {
      RecipeStorage.validateUserId(userId);
      const storageKey = RecipeStorage.getStorageKey(userId);
      const recipesJson = sessionStorage.getItem(storageKey);
      
      if (!recipesJson) {
        return [];
      }

      const recipes = JSON.parse(recipesJson);
      
      // Validate parsed data is an array
      if (!Array.isArray(recipes)) {
        throw new Error('Invalid stored recipes format');
      }

      return recipes;
    } catch (error) {
      console.error('Error loading recipes:', error);
      return [];
    }
  }

  // Add a single recipe
  static addRecipe(userId: string, recipe: Recipe): boolean {
    try {
      RecipeStorage.validateUserId(userId);
      
      if (!recipe || !recipe.id) {
        throw new Error('Invalid recipe data');
      }

      const currentRecipes = RecipeStorage.loadRecipes(userId);
      
      // Check if recipe already exists
      if (currentRecipes.some(r => r.id === recipe.id)) {
        console.warn('Recipe already exists');
        return false;
      }

      const updatedRecipes = [
        ...currentRecipes,
        {
          ...recipe,
          savedAt: new Date().toISOString()
        }
      ];

      return RecipeStorage.saveRecipes(userId, updatedRecipes);
    } catch (error) {
      console.error('Error adding recipe:', error);
      return false;
    }
  }

  // Remove a single recipe
  static removeRecipe(userId: string, recipeId: string): boolean {
    try {
      RecipeStorage.validateUserId(userId);
      
      if (!recipeId) {
        throw new Error('Invalid recipe ID');
      }

      const currentRecipes = RecipeStorage.loadRecipes(userId);
      const updatedRecipes = currentRecipes.filter(r => r.id !== recipeId);
      
      // Check if any recipe was actually removed
      if (currentRecipes.length === updatedRecipes.length) {
        console.warn('Recipe not found');
        return false;
      }

      return RecipeStorage.saveRecipes(userId, updatedRecipes);
    } catch (error) {
      console.error('Error removing recipe:', error);
      return false;
    }
  }

  // Clear all recipes for a user
  static clearRecipes(userId: string): boolean {
    try {
      RecipeStorage.validateUserId(userId);
      const storageKey = RecipeStorage.getStorageKey(userId);
      sessionStorage.removeItem(storageKey);
      return true;
    } catch (error) {
      console.error('Error clearing recipes:', error);
      return false;
    }
  }
}

export default RecipeStorage;