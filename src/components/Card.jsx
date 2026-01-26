
import { useState, useEffect } from "react";
import CommentModal from "./CommentModal.jsx";
import { useNavigate } from "react-router-dom";
import slugify from "../utils/slug.js";
import { addFavorite, removeFavorite, isFavorite as isFavoriteLS, saveComment, getComment, deleteComment } from "../utils/localStorage.js";

export default function Card({ item, slug }) {
    const navigate = useNavigate();
    const [isFavorite, setIsFavorite] = useState(false);
    const [isCommented, setIsCommented] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [comment, setComment] = useState("");

    // Charger le commentaire existant au montage
    useEffect(() => {
        const c = getComment(item);
        setComment(c);
        setIsCommented(!!c);
    }, [item]);

    // Détecte si l'item est déjà en favori au chargement et synchronise avec le localStorage
    useEffect(() => {
        setIsFavorite(isFavoriteLS(item));
        const syncFavorite = () => setIsFavorite(isFavoriteLS(item));
        window.addEventListener('storage', syncFavorite);
        return () => window.removeEventListener('storage', syncFavorite);
    }, [item]);

    const handleClick = () => {
        if (slug) {
            if (item.title) {
                navigate(`/movies/${item.id}-${slug}`);
            } else if (item.name) {
                navigate(`/series/${item.id}-${slug}`);
            } else {
                navigate("/");
            }
        } else {
            if (item.media_type === "movie") {
                const s = slugify(item.title || "");
                navigate(`/movies/${item.id}-${s}`);
            } else if (item.media_type === "tv") {
                const s = slugify(item.name || "");
                navigate(`/series/${item.id}-${s}`);
            } else if (item.title) {
                const s = slugify(item.title);
                navigate(`/movies/${item.id}-${s}`);
            } else if (item.name) {
                const s = slugify(item.name);
                navigate(`/series/${item.id}-${s}`);
            } else {
                navigate("/");
            }
        }
    };

    // Ajoute ou retire des favoris (localStorage)
    const handleFavorite = (e) => {
        e.stopPropagation();
        if (isFavorite) {
            removeFavorite(item);
            setIsFavorite(false);
        } else {
            // Ajoute le type si absent (pour la détection)
            const toSave = { ...item };
            if (!toSave.media_type) {
                toSave.media_type = item.title ? "movie" : "tv";
            }
            addFavorite(toSave);
            setIsFavorite(true);
        }
    };

    return (
        <>
            <div className="bg-gray-900 rounded-xl shadow-lg p-3 flex flex-col items-stretch hover:shadow-2xl transition group border border-gray-700">
                <div className="w-full flex flex-col items-stretch cursor-pointer" onClick={handleClick}>
                    {item.poster_path ? (
                        <div className="overflow-hidden rounded-lg mb-3 aspect-[2/3] bg-gray-700">
                            <img src={`https://image.tmdb.org/t/p/w200${item.poster_path}`} alt={item.title || item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                    ) : (
                        <div className="mb-3 w-full aspect-[2/3] bg-gray-700 flex items-center justify-center rounded-lg text-gray-400 text-sm">Image indisponible</div>
                    )}
                    <div className="w-full flex flex-col items-stretch gap-1">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="text-base font-bold text-white truncate max-w-[70%]" title={item.title || item.name}>{item.title || item.name}</h3>
                            <span className="bg-gray-700 text-gray-200 text-xs font-semibold px-2 py-0.5 rounded-full border border-gray-600">
                                {item.release_date || item.first_air_date
                                    ? (item.release_date || item.first_air_date).slice(0, 4)
                                    : "?"}
                            </span>
                        </div>
                        <div className="flex gap-2 items-center justify-start w-full mt-1">
                            <button
                                aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                                onClick={handleFavorite}
                                className={
                                    `focus:outline-none flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition border ` +
                                    (isFavorite
                                        ? 'bg-yellow-400/10 border-yellow-400 text-yellow-300 hover:bg-yellow-400/20'
                                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600')
                                }
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill={isFavorite ? "#facc15" : "#9ca3af"}
                                    stroke={isFavorite ? "#facc15" : "#9ca3af"}
                                    className="w-5 h-5 transition"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.48 3.499a1.7 1.7 0 0 1 3.04 0l2.09 4.23a1.7 1.7 0 0 0 1.28.93l4.67.68a1.7 1.7 0 0 1 .94 2.9l-3.38 3.29a1.7 1.7 0 0 0-.49 1.5l.8 4.65a1.7 1.7 0 0 1-2.47 1.79l-4.18-2.2a1.7 1.7 0 0 0-1.58 0l-4.18 2.2a1.7 1.7 0 0 1-2.47-1.79l.8-4.65a1.7 1.7 0 0 0-.49-1.5l-3.38-3.29a1.7 1.7 0 0 1 .94-2.9l4.67-.68a1.7 1.7 0 0 0 1.28-.93l2.09-4.23z" />
                                </svg>
                                {isFavorite ? "Retirer" : "Favori"}
                            </button>
                            <button
                                aria-label={isCommented ? "Modifier le commentaire" : "Ajouter un commentaire"}
                                onClick={e => {
                                    e.stopPropagation();
                                    setShowModal(true);
                                }}
                                className={
                                    `focus:outline-none flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition border ` +
                                    (isCommented
                                        ? 'bg-yellow-400/10 border-yellow-400 text-yellow-300 hover:bg-yellow-400/20'
                                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600')
                                }
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill={isCommented ? "#facc15" : "#9ca3af"}
                                    stroke={isCommented ? "#facc15" : "#9ca3af"}
                                    className="w-5 h-5 transition"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 11.5a8.38 8.38 0 0 1-1.9 5.4A8.5 8.5 0 0 1 3 12.5c0-4.42 3.58-8 8-8s8 3.58 8 8z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 15h8" />
                                </svg>
                                {isCommented ? "Commenté" : "Commenter"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Modale de commentaire */}
            <CommentModal
                open={showModal}
                onClose={() => setShowModal(false)}
                onSave={val => {
                    setComment(val);
                    setIsCommented(true);
                    saveComment(item, val);
                }}
                onDelete={isCommented ? () => {
                    setComment("");
                    setIsCommented(false);
                    deleteComment(item);
                } : undefined}
                initialValue={comment}
            />
        </>
    );
}
