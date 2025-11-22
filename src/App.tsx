import { Routes, Route, useLocation } from 'react-router-dom'
import HostPage from './pages/HostPage'
import JoinPage from './pages/JoinPage'
import NavBar from './components/NavBar'
import HomePage from './pages/HomePage'
import Header from './components/Header'
import { useEffect, useState } from 'react'
import PlayPage from './pages/PlayPage'

function Rules() {
  return <h1>Rules</h1>
}

function App() {
  const [sideBarActive, setSideBarActive] = useState(false);
  const toggleSideBar = () => setSideBarActive(prev => !prev);
  const location = useLocation();

  useEffect(() => {
    setSideBarActive(false);
  }, [location.pathname]);

  return (
    <>
      <Header menuCallback={toggleSideBar} />
      <NavBar isActive={sideBarActive} />

      {sideBarActive && (
        <div className="fixed inset-0 bg-black/40 sm:hidden z-20"
          onClick={() => setSideBarActive(false)}
        />
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="/host" element={<HostPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/rules" element={<Rules />} />
      </Routes>
    </>
  )
}

export default App
