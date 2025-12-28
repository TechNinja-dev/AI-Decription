export default function Navbar({
  setActiveView,
  userMail,
  onLogout,
  onLoginClick,
}) {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section */}
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <svg
                className="h-8 w-8 text-indigo-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>

            <div className="hidden md:block">
              <div className="flex items-baseline space-x-4">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveView("home");
                  }}
                  className="text-gray-700 hover:bg-indigo-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Home
                </a>

                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveView("myStuff");
                  }}
                  className="text-gray-700 hover:bg-indigo-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  My Gallery
                </a>
              </div>
            </div>
          </div>

          {/* Right section */}
          <div className="hidden md:block">
            {userMail ? (
              <div className="ml-4 flex items-center space-x-4">
                <span className="text-sm text-gray-600">{userMail}</span>
                <button
                  onClick={onLogout}
                  className="text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="ml-4 flex items-center md:ml-6 space-x-2">
                <button
                  onClick={onLoginClick}
                  className="text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </button>
                <button
                  onClick={onLoginClick}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
