
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

    // Détecte si l'item est déjà en favori au chargement
    useEffect(() => {
        setIsFavorite(isFavoriteLS(item));
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
            <div className="bg-gray-800 rounded p-2 flex flex-col items-center hover:bg-gray-700 transition group">
                <div className="w-full flex flex-col items-center cursor-pointer" onClick={handleClick}>
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
                <div className="flex gap-3 mt-2">
                    {/* Icône Favori */}
                    <button
                        aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                        onClick={handleFavorite}
                        className="focus:outline-none"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill={isFavorite ? "#facc15" : "#9ca3af"}
                            stroke={isFavorite ? "#facc15" : "#9ca3af"}
                            className="w-6 h-6 transition"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.48 3.499a1.7 1.7 0 0 1 3.04 0l2.09 4.23a1.7 1.7 0 0 0 1.28.93l4.67.68a1.7 1.7 0 0 1 .94 2.9l-3.38 3.29a1.7 1.7 0 0 0-.49 1.5l.8 4.65a1.7 1.7 0 0 1-2.47 1.79l-4.18-2.2a1.7 1.7 0 0 0-1.58 0l-4.18 2.2a1.7 1.7 0 0 1-2.47-1.79l.8-4.65a1.7 1.7 0 0 0-.49-1.5l-3.38-3.29a1.7 1.7 0 0 1 .94-2.9l4.67-.68a1.7 1.7 0 0 0 1.28-.93l2.09-4.23z" />
                        </svg>
                    </button>
                    {/* Icône Message */}
                    <button
                        aria-label={isCommented ? "Modifier le commentaire" : "Ajouter un commentaire"}
                        onClick={e => {
                            e.stopPropagation();
                            setShowModal(true);
                        }}
                        className={`focus:outline-none ${!isCommented ? 'opacity-80' : ''}`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill={isCommented ? "#facc15" : "#9ca3af"}
                            stroke={isCommented ? "#facc15" : "#9ca3af"}
                            className="w-6 h-6 transition"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 11.5a8.38 8.38 0 0 1-1.9 5.4A8.5 8.5 0 0 1 3 12.5c0-4.42 3.58-8 8-8s8 3.58 8 8z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 15h8" />
                        </svg>
                    </button>
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
