import { useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
    const inputRef = useRef();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const value = inputRef.current.value;
        navigate(`/results?query=${encodeURIComponent(value)}`);
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-stretch w-full max-w-2xl focus-within:ring-2 focus-within:ring-yellow-400 rounded overflow-hidden h-8">
            <input
                ref={inputRef}
                type="text"
                placeholder="Rechercher un film ou une série..."
                className="flex-1 px-4 py-1 focus:outline-none h-full bg-gray-100 text-gray-900 placeholder-gray-500"
            />
            <button
                type="submit"
                className="bg-yellow-400 text-gray-900 font-semibold px-4 hover:bg-yellow-300 transition flex items-center justify-center h-full"
                aria-label="Lancer la recherche"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
                    <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </button>
        </form>
    );
}