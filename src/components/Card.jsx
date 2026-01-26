
import { useNavigate } from "react-router-dom";
import slugify from "../utils/slug.js";

export default function Card({ item, slug }) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (slug) {
            // On fait confiance à la page appelante pour le type
            if (item.title) {
                navigate(`/movie/${item.id}-${slug}`);
            } else if (item.name) {
                navigate(`/serie/${item.id}-${slug}`);
            } else {
                navigate("/");
            }
        } else {
            // fallback ancienne logique
            if (item.media_type === "movie") {
                const s = slugify(item.title || "");
                navigate(`/movie/${item.id}-${s}`);
            } else if (item.media_type === "tv") {
                const s = slugify(item.name || "");
                navigate(`/serie/${item.id}-${s}`);
            } else if (item.title) {
                const s = slugify(item.title);
                navigate(`/movie/${item.id}-${s}`);
            } else if (item.name) {
                const s = slugify(item.name);
                navigate(`/serie/${item.id}-${s}`);
            } else {
                navigate("/");
            }
        }
    };

    return (
        <div className="bg-gray-800 rounded p-2 flex flex-col items-center cursor-pointer hover:bg-gray-700 transition" onClick={handleClick}>
            {item.poster_path ? (
                <img src={`https://image.tmdb.org/t/p/w200${item.poster_path}`} alt={item.title || item.name} className="mb-2 rounded" />
            ) : (
                <div className="mb-2 flex items-center justify-center w-30 h-45 bg-gray-700 rounded">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <line x1="3" y1="3" x2="21" y2="21" />
                    </svg>
                </div>
            )}
            <div className="text-center text-white font-semibold">{item.title || item.name}</div>
        </div>
    );
}
