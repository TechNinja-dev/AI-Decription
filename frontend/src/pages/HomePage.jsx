import { useState } from "react";
import API_URL from "../config/api";

export default function HomePage({ userId }) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [generationStatus, setGenerationStatus] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [isDescribing, setIsDescribing] = useState(false);
  const [imageDescription, setImageDescription] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setGenerationStatus("Please enter a prompt.");
      return;
    }

    setIsGenerating(true);
    setGenerationStatus("Generating your image...");
    setGeneratedImageUrl("");

    const url = `${API_URL}/generate?prompt=${encodeURIComponent(prompt)}${
      userId ? `&user_id=${userId}` : ""
    }`;

    try {
      const response = await fetch(url);
      const result = await response.json();

      if (response.ok) {
        setGeneratedImageUrl(
          `data:image/png;base64,${result.image_data}`
        );
        setGenerationStatus(
          result.saved_to_gallery
            ? "Image generated and saved to your gallery!"
            : "Image generated successfully!"
        );
      } else {
        throw new Error(result.detail || "Failed to generate image.");
      }
    } catch (error) {
      setGenerationStatus(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImageDescription("");
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDescribe = async () => {
    if (!selectedFile) {
      setImageDescription("Please select a file first.");
      return;
    }

    setIsDescribing(true);
    setImageDescription("Analyzing your image...");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(`${API_URL}/load`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setImageDescription(result.description);
      } else {
        throw new Error(result.detail || "Failed to get description.");
      }
    } catch (error) {
      setImageDescription(`Error: ${error.message}`);
    } finally {
      setIsDescribing(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          AI Image Studio
        </h1>
        <p className="mt-4 text-lg leading-8 text-gray-600">
          Create stunning visuals from text or get detailed descriptions of your images.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Generate Section */}
        <div className="bg-white rounded-lg shadow-xl p-6 lg:p-8 flex flex-col">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Generate Image from Text
          </h2>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A cinematic shot of a raccoon in a library, wearing a monocle"
            className="w-full flex-grow px-4 py-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition duration-300 min-h-[150px]"
          ></textarea>

          <div className="mt-6 flex flex-col items-center justify-center space-y-4">
            <button
              onClick={handleGenerate}
              className="bg-purple-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-300 disabled:bg-gray-400"
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate Image"}
            </button>

            {generationStatus && (
              <p className="text-sm text-gray-600 text-center">
                {generationStatus}
              </p>
            )}
          </div>
        </div>

        {/* Describe Section */}
        <div className="bg-white rounded-lg shadow-xl p-6 lg:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Get Image Description
          </h2>

          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex justify-center items-center flex-col space-y-4 border-2 border-dashed border-gray-300 rounded-lg p-10 hover:border-indigo-500 transition duration-300 min-h-[150px]">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-32 rounded-lg object-contain"
                />
              ) : (
                <div className="text-center text-gray-500">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  <p className="mt-2 text-indigo-600 font-semibold">
                    Click to upload an image
                  </p>
                </div>
              )}
            </div>
          </label>

          <input
            id="file-upload"
            type="file"
            className="sr-only"
            onChange={handleFileChange}
            accept="image/*"
          />

          <div className="mt-6 flex flex-col items-center justify-center space-y-4">
            <button
              onClick={handleDescribe}
              className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 disabled:bg-gray-400"
              disabled={isDescribing || !selectedFile}
            >
              {isDescribing ? "Analyzing..." : "Get Description"}
            </button>

            {imageDescription && (
              <p className="text-sm text-gray-600 bg-gray-100 p-4 rounded-md">
                {imageDescription}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Generated Image */}
      {generatedImageUrl && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Your Generated Image
          </h2>
          <div className="bg-white rounded-lg shadow-xl p-4 flex justify-center">
            <img
              src={generatedImageUrl}
              alt="Generated by AI"
              className="max-w-full md:max-w-2xl rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
