import { useState } from 'react'
import "./App.css"
import DashBoard from './components/DashBoard';
import { Route, Routes } from 'react-router-dom';
import { Features } from 'tailwindcss';
import HomePage from './components/HomePage';

const App = () => {
  return (
    <>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<DashBoard />} />
    </Routes>
    </>
  ) 
}

export default App;