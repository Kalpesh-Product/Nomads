import React from 'react'
import { Outlet } from 'react-router-dom'
import TempHeader from './components/TempHeader'

const TemplateSite = () => {
  return (
    <div className='h-screen relative'>
      <header className='sticky top-0 z-10'>
        <TempHeader />
      </header>
      <Outlet />
      <footer>
        footer
      </footer>
    </div>
  )
}

export default TemplateSite
