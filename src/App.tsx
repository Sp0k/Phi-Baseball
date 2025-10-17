import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './App.css'

function App() {
  function Home() {
    return <h1>Home Page</h1>
  }

  function Host() {
    return <h1>Host</h1>
  }

  function Join() {
    return <h1>Join</h1>
  }

  function Rules() {
    return <h1>Rules</h1>
  }

  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/host">Host</Link>
        <Link to="/join">Join</Link>
        <Link to="/rules">Rules</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/host" element={<Host />} />
        <Route path="/join" element={<Join />} />
        <Route path="/rules" element={<Rules />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
