import React, { useState, useRef } from 'react';
import { Camera, RefreshCcw, X, RotateCw } from 'lucide-react';
import '../styles/ImageCapture.css'



const SPOONACULAR_API_KEY = 'd3b3d405a2914387bdbfd0ce59bdaca1';

interface ImageCaptureProps {
  onIngredientsDetected: (ingredients: string[]) => void;
}

const ImageCapture: React.FC<ImageCaptureProps> = ({ onIngredientsDetected }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setShowCamera(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      // Fallback to file input if camera access fails
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const switchCamera = () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    startCamera();
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg');
      setImageUrl(imageData);
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
        const detectedIngredients = data.annotations
          .filter((item: { probability: number; }) => item.probability > 0.5)
          .map((item: { annotation: any; }) => item.annotation);
        
        onIngredientsDetected(detectedIngredients);
      } catch (error) {
        console.error('Error analyzing image:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file) return;
    
    setIsAnalyzing(true);
    
    try {
      const previewUrl = URL.createObjectURL(file);
      setImageUrl(previewUrl);
      
      const base64Image = await convertToBase64(file) as string;
      
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
      const detectedIngredients = data.annotations
        .filter((item: { probability: number; }) => item.probability > 0.5)
        .map((item: { annotation: any; }) => item.annotation);
      
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

  if (showCamera) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">Take a Photo</h3>
            <button 
              onClick={() => setShowCamera(false)}
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
    <div className="image-capture-container">
      <div className="preview-container">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Captured food" 
            className="preview-image"
          />
        ) : (
          <div className="preview-placeholder">
            <Camera className="w-6 h-6" />
            <p>Take a photo of your ingredients</p>
          </div>
        )}
      </div>
      
      <div className="button-container">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          id="file-input"
        />
        
        <button 
          onClick={startCamera}
          className="camera-button"
        >
          <Camera className="w-4 h-4" />
          {imageUrl ? 'Take Another' : 'Take Photo'}
        </button>
  
        <label 
          htmlFor="file-input"
          className="upload-button"
        >
          Upload Image
        </label>
        
        {imageUrl && (
          <button
            onClick={retakePhoto}
            className="reset-button"
          >
            <RefreshCcw className="w-4 h-4" />
            Reset
          </button>
        )}
      </div>
      
      {isAnalyzing && (
        <div className="analyzing-text">
          Analyzing your food...
        </div>
      )}
    </div>
  );
};

export default ImageCapture;