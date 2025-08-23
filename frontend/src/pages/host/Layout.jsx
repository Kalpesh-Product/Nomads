import { Outlet } from 'react-router-dom'
import HostHeader from '../../components/HostHeader'
import HostFooter from '../../components/HostFooter'
import Footer from '../../components/Footer'

const HostLayout = () => {
  return (
   <div className="flex flex-col gap-4 h-screen overflow-auto custom-scrollbar-hide">
      <div className="sticky top-0 w-full z-50">
        <HostHeader />
      </div>

      <Outlet />

      <HostFooter />
    </div>
  )
}

export default HostLayout
