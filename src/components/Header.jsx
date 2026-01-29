
import SearchBar from "./SearchBar.jsx";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-gray-900 text-white px-2 py-2 shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 px-7 py-0">
        {/* Bloc gauche : logo + titre */}
        <Link to="/home" className="flex items-center gap-1 group md:mr-4">
          <span className="text-2xl text-yellow-400 group-hover:scale-105 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="32" height="32" fill="currentColor">
              <path d="M480 80v352c0 26.5-21.5 48-48 48H80c-26.5 0-48-21.5-48-48V80c0-26.5 21.5-48 48-48h352c26.5 0 48 21.5 48 48zM96 96c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16s16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm0 96c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16s16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm0 96c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16s16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm0 96c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16s16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm320-288c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16s16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm0 96c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16s16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm0 96c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16s16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm0 96c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16s16-7.2 16-16v-32c0-8.8-7.2-16-16-16z" />
            </svg>
          </span>
          <span className="text-xl font-bold tracking-wide group-hover:text-yellow-300 transition-colors">Cinetech</span>
        </Link>
        {/* Menu centré et espacé */}
        <nav className="flex text-sm md:text-base justify-center gap-x-8 flex-1">
          <Link to="/movies" className="hover:text-yellow-400 transition">Films</Link>
          <Link to="/series" className="hover:text-yellow-400 transition">Séries</Link>
          <Link to="/favorites" className="hover:text-yellow-400 transition">Favoris</Link>
          <Link to="/comments" className="hover:text-yellow-400 transition">Commentaires</Link>
        </nav>
        {/* SearchBar entre menu et login */}
        <div className="flex-1 flex justify-center">
          <SearchBar />
        </div>
        {/* Bouton Login à droite */}
        <div className="flex items-center justify-end shrink-0 md:ml-4">
          <button className="bg-yellow-400 text-gray-900 font-semibold px-4 py-1 rounded hover:bg-yellow-300 transition">Login</button>
        </div>
      </div>
    </header>
  );
}
