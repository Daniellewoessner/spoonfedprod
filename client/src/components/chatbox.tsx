'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, ChefHat, ExternalLink } from 'lucide-react';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
  isRecipe?: boolean;
  recipeData?: Recipe[];
};

type Recipe = {
  id: number;
  title: string;
  image: string;
  sourceUrl: string;
  readyInMinutes: number;
  servings: number;
  healthScore?: number;
};

type ChatBoxProps = {
  spoonacularApiKey: string;
  maxMessages?: number;
  theme?: 'light' | 'dark';
};

type RecipeCardProps = {
  recipe: Recipe;
};

const RecipeCard = ({ recipe }: RecipeCardProps): JSX.Element => (
  <div className="border rounded-lg p-3 mb-2 bg-gray-50 hover:bg-gray-100 transition-colors">
    <h4 className="font-semibold text-gray-800 line-clamp-2">{recipe.title}</h4>
    {recipe.image && (
      <div className="relative group">
        <img 
          src={recipe.image} 
          alt={recipe.title} 
          className="w-full h-32 object-cover rounded my-2"
          loading="lazy"
        />
        <a 
          href={recipe.sourceUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all"
        >
          <ExternalLink className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      </div>
    )}
    <div className="text-sm text-gray-600 space-y-1">
      <p><span className="font-medium">Ready in:</span> {recipe.readyInMinutes} minutes</p>
      <p><span className="font-medium">Servings:</span> {recipe.servings}</p>
      {recipe.healthScore && (
        <div className="flex items-center gap-2">
          <span className="font-medium">Health Score:</span>
          <div className="flex-1 h-2 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${recipe.healthScore}%` }}
            />
          </div>
          <span>{recipe.healthScore}/100</span>
        </div>
      )}
    </div>
    <a
      href={recipe.sourceUrl}
      target="_blank" 
      rel="noopener noreferrer"
      className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
    >
      View Recipe <ExternalLink className="w-4 h-4" />
    </a>
  </div>
);

const ChatBox = ({ 
  spoonacularApiKey, 
  maxMessages = 50,
}: ChatBoxProps): JSX.Element => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        text: "Hello! I'm ChefSpoonie! 👨‍🍳 Ask me about any recipes or cooking tips!",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  }, []);

  const makeSpoonacularRequest = async (text: string): Promise<{
    text: string;
    isRecipe: boolean;
    recipeData?: Recipe[];
  }> => {
    try {
      const recipeKeywords = ['recipe', 'cook', 'make', 'prepare', 'how to'];
      const isRecipeQuery = recipeKeywords.some(keyword => 
        text.toLowerCase().includes(keyword)
      );

      let endpoint = 'https://api.spoonacular.com/';
      const params: Record<string, string | number | boolean> = { 
        apiKey: spoonacularApiKey 
      };

      if (isRecipeQuery) {
        endpoint += 'recipes/complexSearch';
        Object.assign(params, {
          query: text,
          addRecipeInformation: true,
          number: 3,
          instructionsRequired: true,
          fillIngredients: true
        });
      } else {
        endpoint += 'food/converse';
        Object.assign(params, {
          text: text,
          contextId: 'cooking-chat'
        });
      }

      const queryParams = new URLSearchParams(
        Object.entries(params).map(([key, value]) => [key, String(value)])
      );
      
      const response = await fetch(`${endpoint}?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (isRecipeQuery) {
        if (!data.results?.length) {
          return {
            text: "I couldn't find any recipes matching your request. Could you try rephrasing or being more specific?",
            isRecipe: false
          };
        }
        return {
          text: `Here are some recipes I found for you:`,
          isRecipe: true,
          recipeData: data.results
        };
      }

      return {
        text: data.answerText || "I'm not sure about that. Try asking about specific recipes!",
        isRecipe: false
      };
    } catch (error) {
      console.error('API Request failed:', error);
      throw new Error('Sorry, I had trouble accessing my cookbook. Please try again in a moment.');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputMessage.trim() || !spoonacularApiKey || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setError(null);
    setMessages(prev => [...prev.slice(-maxMessages), userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await makeSpoonacularRequest(inputMessage);
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        text: response.text,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString(),
        isRecipe: response.isRecipe,
        recipeData: response.recipeData
      };
      setMessages(prev => [...prev.slice(-maxMessages), aiMessage]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-12 h-12 bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center text-white"
        aria-label="Open chat"
      >
        <ChefHat className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="w-80 h-[450px] rounded-lg shadow-xl bg-white overflow-hidden flex flex-col z-50 border border-gray-200">
      <div className="bg-white border-b border-gray-200 p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ChefHat className="w-6 h-6 text-blue-600" />
          <h1 className="text-base font-semibold text-gray-800">ChefSpoonie</h1>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-2.5 ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white shadow-sm border border-gray-200 text-gray-800'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {message.text}
              </p>
              {message.isRecipe && message.recipeData && (
                <div className="mt-2 space-y-2">
                  {message.recipeData.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              )}
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-2 rounded-lg text-sm">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask ChefSpoonie..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400"
            disabled={!spoonacularApiKey || isLoading}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            disabled={!spoonacularApiKey || isLoading || !inputMessage.trim()}
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;