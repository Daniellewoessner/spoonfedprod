import React, { useState, useRef } from 'react';
import { Camera, RefreshCcw } from 'lucide-react';


const SPOONACULAR_API_KEY = 'd3b3d405a2914387bdbfd0ce59bdaca1';


interface ImageCaptureProps {
  onIngredientsDetected: (ingredients: string[]) => void;
}

const ImageCapture: React.FC<ImageCaptureProps> = ({ onIngredientsDetected }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file) return;
    
    setIsAnalyzing(true);
    
    try {
      // Create a preview URL for the captured image
      const previewUrl = URL.createObjectURL(file);
      setImageUrl(previewUrl);
      
      // Convert image to base64 for API
      const base64Image = await convertToBase64(file) as string;
      
      // Call Spoonacular API to analyze the image
      const response = await fetch(
        `https://api.spoonacular.com/food/images/analyze?apiKey=${SPOONACULAR_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageBase64: base64Image.split(',')[1]
          })
        }
      );
      
      if (!response.ok) throw new Error('Failed to analyze image');
      
      const data = await response.json();
      
      // Extract detected ingredients from the response
      const detectedIngredients = data.annotations
        .filter((item: { probability: number; }) => item.probability > 0.5)
        .map((item: { annotation: any; }) => item.annotation);
      
      // Pass detected ingredients to parent component
      onIngredientsDetected(detectedIngredients);
      
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const convertToBase64 = (file: Blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  const retakePhoto = () => {
    setImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-white">
      <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Captured food" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Camera className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCapture}
          className="hidden"
          id="camera-input"
        />
        
        <label 
          htmlFor="camera-input"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          {imageUrl ? 'Take Another' : 'Take Photo'}
        </label>
        
        {imageUrl && (
          <button
            onClick={retakePhoto}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Reset
          </button>
        )}
      </div>
      
      {isAnalyzing && (
        <div className="text-sm text-gray-600">
          Analyzing your food...
        </div>
      )}
    </div>
  );
};

export default ImageCapture;