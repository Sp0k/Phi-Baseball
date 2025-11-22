import { Link } from "react-router-dom";

function HomePage() {
  return (
    <main className="fixed top-12 sm:top-14 w-full h-full sm:left-10 lg:left-18">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[url(/public/baseball-field-bg.jpg)] bg-cover bg-center filter grayscale" />

      <div className="mx-auto max-w-2xl my-36 py-10 sm:py-20 sm:my-48 bg-black/45 sm:rounded-xl backdrop-blur-md">
        <div className="text-center">
          <h1 className="text-5xl font-semibold tracking-tight text-balance text-phidelt-light-blue sm:text-7xl">Welcome to Phi Baseball</h1>
          <p className="mt-8 text-lg font-medium text-pretty text-phidelt-light-blue/70 sm:text-xl/8">Get to know your brothers through a fact-guessing game!</p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link to="/play" 
              className="rounded-md bg-phidelt-blue px-5 py-2.5 text-sm
                         font-semibold text-white shadow-xs hover:bg-phidelt-blue/70
                         transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:bg-phidelt-blue-gray">Play</Link>
            <Link to="/rules" className="text-sm/6 font-semibold text-phidelt-gold hover:text-phidelt-gold/70 transition-all duration-200">Learn to play <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default HomePage;
