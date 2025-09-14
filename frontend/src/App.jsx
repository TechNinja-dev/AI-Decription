import React, { useState, useEffect } from 'react';

// --- API URL Configuration ---
// IMPORTANT: For deployment, you will need to replace 'http://127.0.0.1:8000' 
// with the live URL of your deployed backend service (e.g., from Render).
const API_URL = 'http://127.0.0.1:8000';

// Main App Component
export default function App() {
  const [activeView, setActiveView] = useState('home');
  const [userMail, setUserMail] = useState(localStorage.getItem('userMail')); 
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (userMail && userId) {
      localStorage.setItem('userMail', userMail);
      localStorage.setItem('userId', userId);
    } else {
      localStorage.removeItem('userMail');
      localStorage.removeItem('userId');
    }
  }, [userMail, userId]);

  const handleAuthSuccess = ({ email, userId }) => {
    setUserMail(email);
    setUserId(userId);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUserMail(null);
    setUserId(null);
    setActiveView('home');
  };

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <HomePage userId={userId} onLoginClick={() => setShowAuthModal(true)} />;
      case 'myStuff':
        return userId ? <MyStuffPage userId={userId} /> : <PleaseLoginPage />;
      default:
        return <HomePage userId={userId} onLoginClick={() => setShowAuthModal(true)} />;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-800">
      <Navbar 
        setActiveView={setActiveView} 
        userMail={userMail} 
        onLogout={handleLogout}
        onLoginClick={() => setShowAuthModal(true)} 
      />
      <main className="p-4 md:p-8">
        {renderView()}
      </main>
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}

// --- Authentication Modal Component ---
const AuthModal = ({ onClose, onAuthSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage('Email and password are required.');
      return;
    }
    if (isRegister && password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    
    setIsLoading(true);
    setMessage('');

    const endpoint = isRegister ? `${API_URL}/register` : `${API_URL}/login`;
    const payload = { email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (response.ok) {
        onAuthSuccess({ email: result.email, userId: result.user_id });
      } else {
        setMessage(result.detail || 'An error occurred.');
      }
    } catch (error) {
      console.error("Failed to connect to the server:", error);
      setMessage('Failed to connect to the server. Check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{isRegister ? 'Create Account' : 'Login'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          )}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-6 bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 transition"
          >
            {isLoading ? 'Processing...' : (isRegister ? 'Register' : 'Login')}
          </button>
          {message && <p className="mt-4 text-center text-red-500 text-sm">{message}</p>}
        </form>
        <p className="mt-6 text-center text-sm">
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <button onClick={() => setIsRegister(!isRegister)} className="font-medium text-indigo-600 hover:text-indigo-500">
            {isRegister ? 'Login' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
};


// --- Navbar ---
const Navbar = ({ setActiveView, userMail, onLogout, onLoginClick }) => {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-4">
                <a href="#" onClick={(e) => {e.preventDefault(); setActiveView('home')}} className="text-gray-700 hover:bg-indigo-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Home</a>
                <a href="#" onClick={(e) => {e.preventDefault(); setActiveView('myStuff')}} className="text-gray-700 hover:bg-indigo-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium">My Gallery</a>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            {userMail ? (
              <div className="ml-4 flex items-center space-x-4">
                <span className="text-sm text-gray-600">{userMail}</span>
                <button onClick={onLogout} className="text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium">Logout</button>
              </div>
            ) : (
              <div className="ml-4 flex items-center md:ml-6 space-x-2">
                <button onClick={onLoginClick} className="text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium">Login</button>
                <button onClick={onLoginClick} className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium">Register</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};


// --- HomePage ---
const HomePage = ({ userId }) => {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImageUrl, setGeneratedImageUrl] = useState('');
    const [generationStatus, setGenerationStatus] = useState('');

    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [isDescribing, setIsDescribing] = useState(false);
    const [imageDescription, setImageDescription] = useState('');
    
    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setGenerationStatus('Please enter a prompt.');
            return;
        }
        setIsGenerating(true);
        setGenerationStatus('Generating your image...');
        setGeneratedImageUrl('');

        const url = `${API_URL}/generate?prompt=${encodeURIComponent(prompt)}${userId ? `&user_id=${userId}` : ''}`;

        try {
            const response = await fetch(url);
            const result = await response.json();
            if (response.ok) {
                setGeneratedImageUrl(`data:image/png;base64,${result.image_data}`);
                setGenerationStatus(result.saved_to_gallery ? 'Image generated and saved to your gallery!' : 'Image generated successfully!');
            } else {
                throw new Error(result.detail || 'Failed to generate image.');
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
            setImageDescription('');
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleDescribe = async () => {
        if (!selectedFile) {
            setImageDescription('Please select a file first.');
            return;
        }
        setIsDescribing(true);
        setImageDescription('Analyzing your image...');
        
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch(`${API_URL}/load`, {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (response.ok) {
                setImageDescription(result.description);
            } else {
                 throw new Error(result.detail || 'Failed to get description.');
            }
        } catch (error) {
            setImageDescription(`Error: ${error.message}`);
        } finally {
            setIsDescribing(false);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">AI Image Studio</h1>
                <p className="mt-4 text-lg leading-8 text-gray-600">
                    Create stunning visuals from text or get detailed descriptions of your images.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Left Section: Generation */}
                <div className="bg-white rounded-lg shadow-xl p-6 lg:p-8 flex flex-col">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Generate Image from Text</h2>
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
                            {isGenerating ? 'Generating...' : 'Generate Image'}
                        </button>
                        {generationStatus && <p className="text-sm text-gray-600 text-center">{generationStatus}</p>}
                    </div>
                </div>

                {/* Right Section: Description */}
                <div className="bg-white rounded-lg shadow-xl p-6 lg:p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Get Image Description</h2>
                    <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="flex justify-center items-center flex-col space-y-4 border-2 border-dashed border-gray-300 rounded-lg p-10 hover:border-indigo-500 transition duration-300 min-h-[150px]">
                            {preview ? (
                                <img src={preview} alt="Preview" className="max-h-32 rounded-lg object-contain" />
                            ) : (
                                <div className="text-center text-gray-500">
                                    <svg className="w-16 h-16 mx-auto text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                    <p className="mt-2 text-indigo-600 font-semibold">Click to upload an image</p>
                                </div>
                            )}
                        </div>
                    </label>
                    <input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                     <div className="mt-6 flex flex-col items-center justify-center space-y-4">
                         <button
                            onClick={handleDescribe}
                            className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 disabled:bg-gray-400"
                            disabled={isDescribing || !selectedFile}
                        >
                            {isDescribing ? 'Analyzing...' : 'Get Description'}
                        </button>
                        {imageDescription && <p className="text-sm text-gray-600 bg-gray-100 p-4 rounded-md">{imageDescription}</p>}
                    </div>
                </div>
            </div>

             {/* Generated Image Display */}
            {generatedImageUrl && (
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Your Generated Image</h2>
                    <div className="bg-white rounded-lg shadow-xl p-4 flex justify-center">
                        <img src={generatedImageUrl} alt="Generated by AI" className="max-w-full md:max-w-2xl rounded-lg" />
                    </div>
                </div>
            )}
        </div>
    );
};


// --- MyStuffPage ---
const MyStuffPage = ({ userId }) => {
  const [groupedImages, setGroupedImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleDelete = async (imageId) => {
    if (!userId) {
      setError("You must be logged in to delete images.");
      return;
    }
  
    try {
      const response = await fetch(`${API_URL}/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }), 
      });
  
      if (response.ok) {
        setGroupedImages(prevGroupedImages => {
          const newGroupedImages = { ...prevGroupedImages };
          for (const date in newGroupedImages) {
            newGroupedImages[date] = newGroupedImages[date].filter(
              img => img._id !== imageId
            );
            if (newGroupedImages[date].length === 0) {
              delete newGroupedImages[date];
            }
          }
          return newGroupedImages;
        });
      } else {
        const result = await response.json();
        setError(result.detail || 'Failed to delete image.');
      }
    } catch (err) {
      setError('An error occurred while deleting the image.');
    }
  };

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_URL}/images?user_id=${userId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const images = await response.json();
        const groups = images.reduce((acc, image) => {
          const date = image.uploaded_at.split('T')[0];
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(image);
          return acc;
        }, {});
        setGroupedImages(groups);
      } catch (err) {
        setError('Failed to load images. Is the server running?');
      } finally {
        setLoading(false);
      }
    };
    if (userId) {
      fetchImages();
    }
  }, [userId]);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">My Gallery</h1>
        <p className="mt-4 text-lg leading-8 text-gray-600">A collection of your AI-generated images, organized by date.</p>
      </div>
      {loading && <p className="text-center text-gray-500">Loading your images...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {!loading && !error && Object.keys(groupedImages).length === 0 && (
        <div className="p-8 text-center bg-white rounded-lg shadow-md border border-gray-200">
          <p className="text-gray-500">You haven't generated any images yet!</p>
        </div>
      )}
      <div className="space-y-12">
        {Object.keys(groupedImages).sort((a, b) => new Date(b) - new Date(a)).map(date => (
          <div key={date}>
            <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-6">
              {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {groupedImages[date].map(image => (
                <div key={image._id} className="bg-white rounded-lg shadow-lg overflow-hidden group">
                  <img 
                    src={`data:${image.content_type};base64,${image.image_data}`} 
                    alt={image.filename} 
                    className="w-full h-56 object-cover group-hover:opacity-75 transition-opacity"
                  />
                  <div className="p-4 flex justify-between items-center">
                    <p className="text-sm text-gray-600 truncate flex-grow mr-2">{image.filename}</p>
                    <button onClick={() => handleDelete(image._id)} className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Component to show when user needs to log in ---
const PleaseLoginPage = () => {
  return (
    <div className="text-center py-12">
      <h1 className="text-3xl font-bold text-gray-800">Please Log In</h1>
      <p className="mt-4 text-lg text-gray-600">You need to be logged in to view your gallery.</p>
    </div>
  );
};

