import React from 'react'
import { Outlet } from 'react-router-dom'
import TempHeader from './components/TempHeader'

const TemplateSite = () => {
  return (
    <div>
      <header>
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
