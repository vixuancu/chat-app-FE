
import { useState } from 'react';
import { AuthPage } from './pages/AuthPage';
import { MainApp } from './components/MainApp';
import type { User } from './services/types';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      {!currentUser ? (
        <AuthPage onLogin={handleLogin} />
      ) : (
        <MainApp currentUser={currentUser} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
