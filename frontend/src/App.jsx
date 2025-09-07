import React, { useState, useEffect } from 'react';

// Main App Component
export default function App() {
  const [activeView, setActiveView] = useState('home');
  // State for both user's email and their unique ID
  const [userMail, setUserMail] = useState(localStorage.getItem('userMail')); 
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Effect to keep localStorage in sync with the user's state
  useEffect(() => {
    if (userMail && userId) {
      localStorage.setItem('userMail', userMail);
      localStorage.setItem('userId', userId);
    } else {
      localStorage.removeItem('userMail');
      localStorage.removeItem('userId');
    }
  }, [userMail, userId]);

  // Handle successful authentication by storing email and ID
  const handleAuthSuccess = ({ email, userId }) => {
    setUserMail(email);
    setUserId(userId);
    setShowAuthModal(false);
  };

  // Clear user state on logout
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

    const endpoint = isRegister ? 'http://127.0.0.1:8000/register' : 'http://127.0.0.1:8000/login';
    const payload = { email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (response.ok) {
        // Pass both email and user_id on success
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
                <a href="#" onClick={(e) => {e.preventDefault(); setActiveView('myStuff')}} className="text-gray-700 hover:bg-indigo-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium">My Stuff</a>
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
const HomePage = ({ userId, onLoginClick }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus('');
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!userId) {
      setUploadStatus('Please log in to upload photos.');
      return;
    }
    if (!selectedFile) {
        setUploadStatus('Please select a file first.');
        return;
    }
    setUploadStatus('Uploading...');
    const formData = new FormData();
    formData.append('file', selectedFile);
    // Send user_id with the upload
    formData.append('user_id', userId);

    try {
      const response = await fetch('http://127.0.0.1:8000/load', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const result = await response.json();
        setUploadStatus(`Success! File ID: ${result.document_id}`);
        setSelectedFile(null);
        setPreview('');
      } else {
        const errorResult = await response.json();
        setUploadStatus(`Upload failed: ${errorResult.detail || 'Server error'}`);
      }
    } catch (error) {
      setUploadStatus('Upload failed. Is the server running?');
    }
  };

  const handleUploadAreaClick = (e) => {
    if (!userId) {
      e.preventDefault(); 
      setUploadStatus('Please log in first to upload a photo.');
    } else {
      setUploadStatus(''); 
    }
  };

  return (
     <div className="flex flex-col items-center justify-center py-12">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Share Your Moments</h1>
        <p className="mt-4 text-lg leading-8 text-gray-600">
          Upload a photo and let the world see your perspective. It's simple and fast.
        </p>
      </div>
      <div className="mt-8 w-full max-w-lg">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white rounded-lg p-6">
            <label htmlFor="file-upload" className="cursor-pointer" onClick={handleUploadAreaClick}>
              <div className="flex justify-center items-center flex-col space-y-4 border-2 border-dashed border-gray-300 rounded-lg p-10 hover:border-indigo-500 transition duration-300">
                {preview ? (
                  <img src={preview} alt="Preview" className="max-h-48 rounded-lg object-contain" />
                ) : (
                  <>
                    <svg className="w-16 h-16 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <div className="text-center">
                      <p className="text-indigo-600 font-semibold">Click to upload a file</p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </>
                )}
              </div>
            </label>
            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
          </div>
        </div>
        <div className="mt-6 flex flex-col items-center justify-center space-y-4">
            {uploadStatus && !selectedFile && <p className="text-sm text-red-500">{uploadStatus}</p>}
            
            {selectedFile && (
                <>
                    <button onClick={handleUpload} className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300">
                        Upload Photo
                    </button>
                    {uploadStatus && <p className="text-sm text-gray-600">{uploadStatus}</p>}
                </>
            )}
        </div>
      </div>
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
      const response = await fetch(`http://127.0.0.1:8000/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send user_id for verification
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
        console.error('Failed to delete image from backend.');
      }
    } catch (err) {
      setError('An error occurred while deleting the image.');
      console.error('Error deleting image:', err);
    }
  };

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch images using user_id
        const response = await fetch(`http://127.0.0.1:8000/images?user_id=${userId}`);
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
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">My Stuff</h1>
        <p className="mt-4 text-lg leading-8 text-gray-600">A gallery of your uploaded moments, organized by date.</p>
      </div>
      {loading && <p className="text-center text-gray-500">Loading your images...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {!loading && !error && Object.keys(groupedImages).length === 0 && (
        <div className="p-8 text-center bg-white rounded-lg shadow-md border border-gray-200">
          <p className="text-gray-500">You haven't uploaded anything yet!</p>
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
      <p className="mt-4 text-lg text-gray-600">You need to be logged in to view this page.</p>
    </div>
  );
};

