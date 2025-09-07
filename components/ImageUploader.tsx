
import React, { useState, useRef } from 'react';

interface ImageUploaderProps {
  onImageUpload: (imageDataUrl: string, mimeType: string) => void;
}

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImagePreview(result);
        onImageUpload(result, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            setImagePreview(result);
            onImageUpload(result, file.type);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg h-full flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-400">1. Upload Character</h2>
        <div 
            className="flex-grow border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center flex-col p-4 cursor-pointer hover:border-purple-400 transition-colors"
            onClick={handleUploadClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />
            {imagePreview ? (
                <img src={imagePreview} alt="Character Preview" className="max-h-full max-w-full object-contain rounded-md" />
            ) : (
                <div className="text-center text-gray-500">
                    <UploadIcon />
                    <p>Click to upload or drag & drop</p>
                    <p className="text-sm">PNG, JPG, etc.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default ImageUploader;
