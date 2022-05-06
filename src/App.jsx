import { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import { api } from './api';

function App() {
  const [user, setUser] = useState('');

  useEffect(() => {
    api.account.get().then((user) => {
      setUser(user);
    }, () => {});
  }, []);

  return (
    <Routes>
      <Route
        path="dashboard"
        element={
          <div className="app-container">
            <div className="content">
              {/* { user ? <Dashboard user={user} /> : '' } */}
              <Dashboard user={user} />
            </div>
          </div>
        }
      />
      <Route
        path="/"
        element={
          <div className="app-container">
            <div className="content">
              <span className="title">Deepgram + Appwrite</span>
              <span className="subtitle">Audio Archives</span>
              <LoginForm setUser={setUser} />
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
