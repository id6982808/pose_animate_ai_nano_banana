
import React, { useState, useRef, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import DrawingCanvas from './components/DrawingCanvas';
import ResultDisplay from './components/ResultDisplay';
import { generateImageFromPose } from './services/geminiService';
import type { DrawingCanvasRef } from './components/DrawingCanvas';

const App: React.FC = () => {
  const [characterImage, setCharacterImage] = useState<string | null>(null);
  const [characterMimeType, setCharacterMimeType] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<DrawingCanvasRef>(null);

  const handleImageUpload = (imageDataUrl: string, mimeType: string) => {
    setCharacterImage(imageDataUrl);
    setCharacterMimeType(mimeType);
  };

  const handleGenerate = useCallback(async () => {
    if (!characterImage || !canvasRef.current) {
      setError('Please upload a character image and draw a pose first.');
      return;
    }

    const poseImage = canvasRef.current.getImageDataUrl();
    if (!poseImage) {
      setError('Could not get the pose drawing from the canvas.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setGeneratedText(null);

    try {
      const { image, text } = await generateImageFromPose(characterImage, characterMimeType, poseImage);
      setGeneratedImage(image);
      setGeneratedText(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [characterImage, characterMimeType]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-7xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Pose Animator AI
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Bring your characters to life. Upload an image, draw a pose, and let AI do the magic.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 flex flex-col gap-8">
            <ImageUploader onImageUpload={handleImageUpload} />
          </div>

          <div className="lg:col-span-1 flex flex-col gap-8">
            <DrawingCanvas ref={canvasRef} />
          </div>

          <div className="lg:col-span-1 flex flex-col gap-8">
            <ResultDisplay
              generatedImage={generatedImage}
              generatedText={generatedText}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </main>
        
        <footer className="text-center mt-12 py-4">
           <button
            onClick={handleGenerate}
            disabled={isLoading || !characterImage}
            className="w-full lg:w-1/2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xl rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            {isLoading ? 'Generating...' : '✨ Generate Image'}
          </button>
          <p className="text-gray-500 mt-4 text-sm">
            Powered by Gemini (nano-banana).
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
