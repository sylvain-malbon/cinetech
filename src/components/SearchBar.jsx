

import { useState } from "react";
import useFetch from "../hooks/useFetch";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;


const [query, setQuery] = useState("");
const url = query.length >= 2
    ? `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&language=fr-FR&query=${encodeURIComponent(query)}`
    : null;
const { data, loading, error } = useFetch(url);

return (
    <div className="relative w-full md:w-64">
        <input
            type="search"
            className="w-full px-3 py-2 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="Rechercher un film ou une série..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoComplete="off"
        />
        {loading && <div className="absolute left-0 right-0 bg-gray-900 text-gray-400 px-3 py-2">Chargement...</div>}
        {error && <div className="absolute left-0 right-0 bg-red-900 text-red-300 px-3 py-2">Erreur lors de la recherche</div>}
        {data && data.results && data.results.length > 0 && (
            <ul className="absolute left-0 right-0 bg-gray-900 border border-gray-700 rounded mt-1 z-10 max-h-60 overflow-y-auto">
                {data.results.map(item => (
                    <li key={item.id} className="px-3 py-2 hover:bg-gray-800 cursor-pointer">
                        {item.title || item.name}
                    </li>
                ))}
            </ul>
        )}
    </div>
);
}
