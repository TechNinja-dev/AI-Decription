import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import AuthModal from "./components/AuthModal";
import HomePage from "./pages/HomePage";
import MyStuffPage from "./pages/MyStuffPage";
import PleaseLoginPage from "./pages/PleaseLoginPage";

export default function App() {
  const [activeView, setActiveView] = useState("home");
  const [userMail, setUserMail] = useState(localStorage.getItem("userMail"));
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (userMail && userId) {
      localStorage.setItem("userMail", userMail);
      localStorage.setItem("userId", userId);
    } else {
      localStorage.removeItem("userMail");
      localStorage.removeItem("userId");
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
    setActiveView("home");
  };

  const renderView = () => {
    if (activeView === "myStuff") {
      return userId ? <MyStuffPage userId={userId} /> : <PleaseLoginPage />;
    }
    return <HomePage userId={userId} />;
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar
        setActiveView={setActiveView}
        userMail={userMail}
        onLogout={handleLogout}
        onLoginClick={() => setShowAuthModal(true)}
      />

      <main className="p-4 md:p-8">{renderView()}</main>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
