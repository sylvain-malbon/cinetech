import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import useFetch from "../hooks/useFetch";
import slugify from "../utils/slug.js";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export default function SearchBar() {
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const navigate = useNavigate();
    // Vérification de la clé API
    console.log('API_KEY:', API_KEY);
    const url = query.length >= 2
        ? `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&language=fr-FR&query=${encodeURIComponent(query)}`
        : null;
    const { data, loading, error } = useFetch(url);

    if (error) {
        console.log('Erreur fetch TMDB:', error);
    }

    // Fonction pour gérer le clic ou la validation clavier sur une suggestion
    const handleSelect = (item) => {
        if (item.media_type === "movie") {
            const slug = slugify(item.title || "");
            navigate(`/movies/${item.id}-${slug}`);
        } else if (item.media_type === "tv") {
            const slug = slugify(item.name || "");
            navigate(`/series/${item.id}-${slug}`);
        }
        setQuery("");
        setSelectedIndex(-1);
        setShowSuggestions(false);
    };

    // Gestion du clavier
    const handleKeyDown = (e) => {
        if (!data || !data.results) {
            if (e.key === "Enter" && query.length >= 2) {
                setShowSuggestions(false);
                navigate(`/results?query=${encodeURIComponent(query)}`);
            }
            return;
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex(prev => (prev < data.results.length - 1 ? prev + 1 : 0));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : data.results.length - 1));
        } else if (e.key === "Enter") {
            if (selectedIndex >= 0 && data.results[selectedIndex]) {
                handleSelect(data.results[selectedIndex]);
            } else if (query.length >= 2) {
                setShowSuggestions(false);
                navigate(`/results?query=${encodeURIComponent(query)}`);
            }
        }
    };

    // Remettre l'index si la liste change ou la recherche est vidée

    React.useEffect(() => {
        setSelectedIndex(-1);
        setShowSuggestions(query.length >= 2 && data?.results?.length > 0);
    }, [query, data?.results?.length]);

    // Fermer la liste si on clique en dehors
    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.searchbar-autocomplete')) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative w-full md:w-64 searchbar-autocomplete">
            <input
                type="search"
                className="w-full px-3 py-2 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Rechercher un film ou une série..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
            />
            {loading && <div className="absolute left-0 right-0 bg-gray-900 text-gray-400 px-3 py-2">Chargement...</div>}
            {error && <div className="absolute left-0 right-0 bg-red-900 text-red-300 px-3 py-2">Erreur lors de la recherche</div>}
            {showSuggestions && data && data.results && data.results.length > 0 && (
                <ul className="absolute left-0 right-0 bg-gray-900 border border-gray-700 rounded mt-1 z-10 max-h-60 overflow-y-auto">
                    {data.results.map((item, idx) => (
                        <li
                            key={item.id}
                            className={`px-3 py-2 hover:bg-gray-800 cursor-pointer ${selectedIndex === idx ? 'bg-yellow-400 text-gray-900' : ''}`}
                            onClick={() => handleSelect(item)}
                        >
                            {item.title || item.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
