import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import HostPage from './pages/HostPage'
import JoinPage from './pages/JoinPage'
import LoginPage from './pages/LoginPage'
import NavBar from './components/NavBar'

function App() {
  function Home() {
    return <h1>Home Page</h1>
  }

  function Rules() {
    return <h1>Rules</h1>
  }

  return (
    <BrowserRouter>
      <NavBar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/host" element={<HostPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
