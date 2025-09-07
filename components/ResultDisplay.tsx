
import React from 'react';

interface ResultDisplayProps {
  generatedImage: string | null;
  generatedText: string | null;
  isLoading: boolean;
  error: string | null;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center text-center text-gray-400">
    <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="mt-4 text-lg">Generating your masterpiece...</p>
    <p className="text-sm">This may take a moment.</p>
  </div>
);

const ResultDisplay: React.FC<ResultDisplayProps> = ({ generatedImage, generatedText, isLoading, error }) => {
  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }
    if (error) {
      return (
        <div className="text-center text-red-400">
          <h3 className="font-bold text-lg mb-2">Error</h3>
          <p className="text-sm bg-red-900/50 p-3 rounded-md">{error}</p>
        </div>
      );
    }
    if (generatedImage) {
      return (
        <div className="flex flex-col items-center gap-4">
          <img src={generatedImage} alt="Generated result" className="max-h-full max-w-full object-contain rounded-md" />
          {generatedText && <p className="text-sm text-gray-400 mt-2 p-2 bg-gray-900 rounded-md">{generatedText}</p>}
        </div>
      );
    }
    return (
      <div className="text-center text-gray-500 flex flex-col items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
        <p>Your generated image will appear here.</p>
        <p className="text-sm">Click 'Generate Image' to begin.</p>
      </div>
    );
  };
  
  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg h-full flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-400">3. Result</h2>
        <div className="flex-grow border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center p-4">
            {renderContent()}
        </div>
    </div>
  );
};

export default ResultDisplay;
