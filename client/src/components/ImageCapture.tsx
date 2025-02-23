import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RotateCw, ChefHat } from 'lucide-react';

const SPOONACULAR_API_KEY = 'd3b3d405a2914387bdbfd0ce59bdaca1';

interface ImageCaptureProps {
  onIngredientsDetected: (ingredients: string[]) => void;
}

const ImageCapture: React.FC<ImageCaptureProps> = ({ onIngredientsDetected }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup function for camera stream
  const cleanupCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      // Clean up any existing stream first
      cleanupCamera();

      const constraints = {
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play(); // Ensure video is playing
        streamRef.current = stream;
        setShowCamera(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Failed to access camera. Please ensure camera permissions are granted.');
    }
  };

  const stopCamera = () => {
    cleanupCamera();
    setShowCamera(false);
  };

  const switchCamera = async () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    cleanupCamera();
    await startCamera();
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !streamRef.current) {
      console.error('Video stream not ready');
      return;
    }

    try {
      // Wait for video to be ready
      await new Promise((resolve) => {
        if (videoRef.current?.readyState === videoRef.current?.HAVE_ENOUGH_DATA) {
          resolve(true);
        } else {
          videoRef.current?.addEventListener('loadeddata', () => resolve(true), { once: true });
        }
      });

      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Could not get canvas context');
      }

      // Capture the frame
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setImageUrl(imageData);
      
      // Stop the camera stream
      stopCamera();

      // Analyze the captured image
      setIsAnalyzing(true);
      try {
        const response = await fetch(
          `https://api.spoonacular.com/food/images/analyze?apiKey=${SPOONACULAR_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageBase64: imageData.split(',')[1]
            })
          }
        );
        
        if (!response.ok) throw new Error('Failed to analyze image');
        
        const data = await response.json();
        const ingredients = data.annotations
          .filter((item: { probability: number; }) => item.probability > 0.5)
          .map((item: { annotation: any; }) => item.annotation);
        
        setDetectedIngredients(ingredients);
        onIngredientsDetected(ingredients);
      } catch (error) {
        console.error('Error analyzing image:', error);
        alert('Failed to analyze image. Please try again.');
      } finally {
        setIsAnalyzing(false);
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      alert('Failed to capture photo. Please try again.');
    }
  };

  const retakePhoto = () => {
    setImageUrl(null);
    setDetectedIngredients([]);
    startCamera();
  };

  const handleClose = () => {
    stopCamera();
    setShowCamera(false);
  };

  const handleGetRecipe = () => {
    if (detectedIngredients.length > 0) {
      onIngredientsDetected(detectedIngredients);
    }
  };

  if (showCamera) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">Take a Photo</h3>
            <button 
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative aspect-[4/3] bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-4 flex justify-center items-center gap-4">
            <button
              onClick={switchCamera}
              className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
            >
              <RotateCw className="w-6 h-6" />
            </button>
            
            <button
              onClick={capturePhoto}
              className="p-4 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Camera className="w-8 h-8 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="w-full max-w-md aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Captured food" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
            <Camera className="w-12 h-12 mb-2" />
            <p>Take a photo of your ingredients</p>
          </div>
        )}
      </div>
      
      <div className="flex flex-col items-center gap-4 w-full max-w-md">
        <button 
          onClick={imageUrl ? retakePhoto : startCamera}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Camera className="w-5 h-5" />
          {imageUrl ? 'Take Another Photo' : 'Take Photo'}
        </button>

        {imageUrl && !isAnalyzing && detectedIngredients.length > 0 && (
          <button 
            onClick={handleGetRecipe}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
          >
            <ChefHat className="w-5 h-5" />
            Get Recipe
          </button>
        )}
      </div>
      
      {isAnalyzing && (
        <div className="text-blue-600 font-medium animate-pulse">
          Analyzing your food...
        </div>
      )}

      {detectedIngredients.length > 0 && (
        <div className="w-full max-w-md p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">Detected Ingredients:</h4>
          <ul className="list-disc pl-5">
            {detectedIngredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImageCapture;