import SpotlightCard from "@/components/spotlight-card";
import type { ReactNode } from "react";
import { TbCloudDataConnection } from "react-icons/tb";
import { MdConnectWithoutContact } from "react-icons/md";
import { Link } from "react-router-dom";

interface GameCardIconProps {
  icon: ReactNode;
  title: string;
  desc: string;
}

const GameCard = ({ icon, title, desc}: GameCardIconProps) => {
  return (
    <div className="max-w-72 cursor-pointer">
      <SpotlightCard spotlightColor="rgba(97, 156, 199, 1)">
        <div className="w-full h-full flex flex-col justify-center items-center">
          <div className="w-26 h-26 rounded-full bg-white inset-shadow-black inset-shadow-xs flex items-center justify-center">
            {icon}
          </div>
          <div className="mx-auto">
            <p className="text-black font-bold text-4xl mt-10 text-center">
              {title}
            </p>
            <p className="text-gray-500 text-xl mt-5 text-center">
              {desc}
            </p>
          </div>
        </div>
      </SpotlightCard>
    </div>
  )
}

function PlayPage() {
  return (
    <main className="sm:fixed top-12 sm:top-14 w-full h-full sm:left-10 lg:left-18 bg-slate-300">
      <div className="mx-auto max-w-2xl my-5 py-10 sm:my-20 flex flex-col justify-center">
        <h2 className="text-7xl text-black mx-auto text-center my-10 sm:mb-20 font-bold">Play</h2>
        <div className="flex mx-auto flex-col sm:flex-row gap-14">
          <Link to="/host"><GameCard icon={<TbCloudDataConnection size="64" />} title="Host Game" desc="Host a new game on your machine" /></Link>
          <Link to="/join"><GameCard icon={<MdConnectWithoutContact size="58" />} title="Join Game" desc="Join a game using a game code" /></Link>
        </div>
      </div>
    </main>
  );
}

export default PlayPage;
