import React from 'react'
import { Outlet } from 'react-router-dom'

const NomadLayout = () => {
  return (
    <div>
      <Outlet />
    </div>
  )
}

export default NomadLayout
