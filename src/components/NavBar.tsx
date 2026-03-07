import { type ReactNode } from "react";
import { Link } from "react-router-dom"
import { LuNotebook } from "react-icons/lu";
import { IoHomeOutline } from "react-icons/io5";
import { FaGamepad, FaGithub } from "react-icons/fa";
import { GrArticle } from "react-icons/gr";

interface SideBarIconProps {
  icon: ReactNode;
  text?: string;
}

interface NavBarProps {
  isActive: boolean
}

const SideBarIcon = ({ icon, text = 'tooltip'}: SideBarIconProps) => {
  return (
    <div className="sidebar-icon group">
      {icon}

      <span className="sidebar-tooltip group-hover:scale-100">
        {text}
      </span>
    </div>
  );
};

const SideBarHeader = ({ icon, text = 'tooltip'}: SideBarIconProps) => {
  return (
    <div className="sidebar-header group">
      {icon}

      <span className="sidebar-tooltip group-hover:scale-100">
        {text}
      </span>
    </div>
  )
}

const NavBar = ({ isActive }: NavBarProps) => {
  return (
    <div className={`fixed top-7 sm:top-10 pt-5 transition-all duration-300 left-0 h-screen
                    ${isActive ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0
                    w-18 m-0 flex flex-col bg-phidelt-navy text-white shadow-lg z-40`}
    >
      <Link to="/"><SideBarHeader icon={<IoHomeOutline size="32"/>} text="Home" /></Link>
      <hr className="mx-2 text-phidelt-light-blue py-1" />
      <Link to="/play"><SideBarIcon icon={<FaGamepad size="24"/>} text="Play"/></Link>
      <Link to="/rules"><SideBarIcon icon={<LuNotebook size="22" />} text="Rules" /></Link>
      <Link to="/devlog"><SideBarIcon icon={<GrArticle size="22" />} text="Updates" /></Link>
      <a href="https://github.com/Sp0k/Phi-Baseball" target="_blank"><SideBarIcon icon={<FaGithub size="24" />} text="GitHub" /></a>
    </div>
  );
};

export default NavBar;
