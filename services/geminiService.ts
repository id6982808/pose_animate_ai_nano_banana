
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

if (!process.env.API_KEY) {
  // This is a placeholder for development. In a real environment,
  // the API key should be set securely. For this tool, it's assumed to be present.
  // In a real build process, you might replace this with a proper check
  // or have a mechanism to inject it.
  console.warn(
    "API_KEY environment variable not set. Using a placeholder. This will fail if you are running the code."
  );
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// Helper to convert data URL to a base64 string
const dataUrlToBase64 = (dataUrl: string): string => {
    return dataUrl.split(',')[1];
}

interface GenerationResult {
    image: string | null;
    text: string | null;
}

export const generateImageFromPose = async (
  characterImageDataUrl: string,
  characterMimeType: string,
  poseImageDataUrl: string
): Promise<GenerationResult> => {
  try {
    const characterImageBase64 = dataUrlToBase64(characterImageDataUrl);
    const poseImageBase64 = dataUrlToBase64(poseImageDataUrl);

    const characterImagePart = {
      inlineData: {
        data: characterImageBase64,
        mimeType: characterMimeType,
      },
    };

    const poseImagePart = {
        inlineData: {
            data: poseImageBase64,
            mimeType: 'image/png',
        },
    };

    const textPart = {
      text: 'Analyze the character in the first image and the pose in the second image. Recreate the character from the first image performing the exact pose from the second image. The background should be simple and not distract from the character.',
    };
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [characterImagePart, poseImagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    let resultImage: string | null = null;
    let resultText: string | null = null;

    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                const mimeType = part.inlineData.mimeType;
                resultImage = `data:${mimeType};base64,${part.inlineData.data}`;
            } else if (part.text) {
                resultText = part.text;
            }
        }
    }
    
    if (!resultImage) {
        throw new Error("API did not return an image. It might have been blocked due to safety policies.");
    }

    return { image: resultImage, text: resultText };

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate image: ${error.message}`);
    }
    throw new Error('An unknown error occurred while communicating with the API.');
  }
};
