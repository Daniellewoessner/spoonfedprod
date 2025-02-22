export interface Recipe {
  savedAt: string;
  matchingIngredients: string;
  sourceUrl: any;
  suggestedPairings: any;
  customPairings: any;
  id: string;
  title: string;
  description?: string;
  summary?: string;
  cookTime?: number;
  readyInMinutes?: number;
  servings?: number;
  ingredients: string[];
  instructions: string[];
  imageUrl?: string;
  image?: string;
  spoonacularId?: number;
  usedIngredients?: string[];
  missedIngredients?: string[];
  usedIngredientCount?: number;
  missedIngredientCount?: number;
  isFavorite?: boolean;
  createdAt?: string;
  updatedAt?: string;
  pairings?: Pairing[];
  searchMode: boolean;
  handleIngredientSearch?: string;
  foodGroup?: string;
  suggestPairings?:string[];
  winePairing?: {
    pairedWines: string[];
    pairedText: string;
    productMatches: any[],
    avaliableIngredients?: string;
    currentUser: string;
    userId: string;
    savedAt?: string;

  },


  
}

export interface Pairing {
  id: string;
  type: 'drink' | 'dessert';
  name: string;
  description?: string;
  imageUrl?: string;
}

export type EnhancedRecipe = Recipe & {
  matchingIngredients: number;
  totalIngredients: any;
 sortedRecipes: string;
 
};

export interface RecipeMatch extends Recipe {
  matchingIngredients: string;
  totalIngredients: string;
  sortedRecipes: string;
  recipe: string;
}

