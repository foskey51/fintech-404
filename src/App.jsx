import { useState } from 'react'
import "./App.css"
import Hero from './components/Hero';

const App = () => {
  return (
    <>
      <div className='flex h-full w-full'>
        <Hero />
      </div>
    </>
  ) 
}

export default App;