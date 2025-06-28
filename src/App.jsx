import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import InflationPage from './pages/InflationPage';
import GDPPage from './pages/GDPPage';
import InterestRatesPage from './pages/InterestRatesPage';
import ExchangeRatePage from './pages/ExchangeRatePage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar />
        <motion.main 
          className="container mx-auto px-4 py-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inflation" element={<InflationPage />} />
            <Route path="/gdp" element={<GDPPage />} />
            <Route path="/interest-rates" element={<InterestRatesPage />} />
            <Route path="/exchange-rate" element={<ExchangeRatePage />} />
          </Routes>
        </motion.main>
      </div>
    </Router>
  );
}

export default App;