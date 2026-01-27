
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
        <form onSubmit={handleSubmit} className="flex items-center w-full max-w-2xl focus-within:ring-2 focus-within:ring-yellow-400 rounded">
            <input
                ref={inputRef}
                type="text"
                placeholder="Rechercher un film ou une série"
                className="flex-1 px-4 py-1 border border-gray-300 border-r-0 rounded-l focus:outline-none"
            />
            <button
                type="submit"
                className="bg-yellow-400 text-gray-900 font-semibold px-4 py-1 rounded-r hover:bg-yellow-300 transition flex items-center justify-center border border-l-0 border-gray-300 focus:outline-none"
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
