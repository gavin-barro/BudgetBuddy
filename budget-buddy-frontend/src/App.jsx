import React, { useState, useEffect } from 'react';
import AuthenticationPage from './pages/AuthenticationPage';
import ProfilePage from './pages/ProfilePage';
import './index.css'; // Make sure global styles are imported

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  // On initial load, check for a user session
  useEffect(() => {
    const storedUser = localStorage.getItem('bb_current_user');
    if (storedUser) {
      try { setCurrentUser(JSON.parse(storedUser)); }
      catch (e) { localStorage.removeItem('bb_current_user'); }
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bb_current_user');
  };

  // --- NEW: This function updates the app's state when the profile is changed ---
  const handleUserUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  return (
    <div className="App">
      {currentUser ? (
        <ProfilePage 
          user={currentUser} 
          onLogout={handleLogout} 
          onUserUpdate={handleUserUpdate} 
        />
      ) : (
        <AuthenticationPage onAuthSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
