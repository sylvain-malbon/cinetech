import SearchBar from "./SearchBar.jsx";

export default function Header() {
  return (
    <header className="bg-gray-900 text-white px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between shadow">
      <div className="flex items-center gap-2 mb-2 md:mb-0">
        {/* Logomark (Font Awesome film icon) */}
        <span className="text-2xl text-yellow-400">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="32" height="32" fill="currentColor">
            <path d="M480 80v352c0 26.5-21.5 48-48 48H80c-26.5 0-48-21.5-48-48V80c0-26.5 21.5-48 48-48h352c26.5 0 48 21.5 48 48zM96 96c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16s16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm0 96c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16s16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm0 96c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16s16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm0 96c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16s16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm320-288c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16s16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm0 96c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16s16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm0 96c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16s16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm0 96c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16s16-7.2 16-16v-32c0-8.8-7.2-16-16-16z" />
          </svg>
        </span>
        {/* Logotype */}
        <span className="text-xl font-bold tracking-wide">Cinetech</span>
      </div>
      <nav className="flex gap-4 text-sm md:text-base mb-2 md:mb-0">
        <a href="/home" className="hover:text-yellow-400 transition">Accueil</a>
        <a href="/movies" className="hover:text-yellow-400 transition">Films</a>
        <a href="/series" className="hover:text-yellow-400 transition">Séries</a>
        <a href="/favorites" className="hover:text-yellow-400 transition">Favoris</a>
        <a href="/messages" className="hover:text-yellow-400 transition">Messages</a>
      </nav>
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
        <SearchBar />
        <button className="bg-yellow-400 text-gray-900 font-semibold px-4 py-1 rounded hover:bg-yellow-300 transition">Login</button>
      </div>
    </header>
  );
}
