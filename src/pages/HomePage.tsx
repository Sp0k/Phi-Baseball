import { Link } from "react-router-dom";

function HomePage() {
  return (
    <main className="fixed top-12 sm:top-14 w-full h-full sm:left-10 lg:left-18">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[url(/baseball-field-bg.jpg)] bg-cover bg-center filter grayscale" />

      <Link to="/devlog" className="absolute top-30 left-138 inline-flex justify-center items-center py-1 px-1 pr-4 mb-7 text-sm text-gray-700 bg-gray-100 rounded-full dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700" role="alert">
        <span className="text-xs bg-primary-600 rounded-full text-white px-4 py-1.5 mr-3">New</span> 
        <span className="text-sm font-medium">Version 0.5.0 is out! See what's new</span> 
        <svg className="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
      </Link>
      {/* Main Content */}
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
