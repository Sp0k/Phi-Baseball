import { Link } from "react-router-dom";
import { CiBaseball } from "react-icons/ci";
import { RiMenu2Fill } from "react-icons/ri";

interface HeaderProps {
  menuCallback: () => void;
}

const Header = ({ menuCallback }: HeaderProps) => {
  return (
    <header className="fixed z-40 top-0 left-0 w-full bg-phidelt-navy text-phidelt-light-blue">
      <div className="relative flex items-center justify-center py-2 sm:py-3">
        <button className="absolute left-4 sm:hidden" onClick={menuCallback}>
          <RiMenu2Fill size={24} />
        </button>

        <Link to="/">
          <div className="flex items-center justify-center font-bold text-2xl sm:text-3xl">
            <span className="mr-1">Phi</span>
            <CiBaseball size={22} />
            <span className="ml-1">Baseball</span>
          </div>
        </Link>
      </div>
    </header>
  )
}

export default Header;
