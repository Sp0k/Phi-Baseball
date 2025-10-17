import { Link } from "react-router-dom"

const NavBar = () => {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/host">Host</Link>
      <Link to="/join">Join</Link>
      <Link to="/rules">Rules</Link>
    </nav>
  )
}

export default NavBar;
