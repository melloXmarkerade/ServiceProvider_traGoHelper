import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Landing from './webpages/LandingPage';
import LoginRegister from './webpages/LoginRegisterPage';
import Dashboard from './webpages/DashboardPage.tsx';
import { UserProvider } from './webpages/UserContext';

function App() {
  return (
    
    <UserProvider>
      <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/loginRegister" element={<LoginRegister />} />
          <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </UserProvider>
  );
}

export default App;
