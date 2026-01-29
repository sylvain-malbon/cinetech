
import { useParams, useLocation } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { useEffect, useState } from "react";
import CommentModal from "../components/CommentModal";
import Comments from "../components/Comments.jsx";
import { getComments, saveComment, deleteComment, getFavorites, addFavorite, removeFavorite, isFavorite } from "../utils/localStorage.js";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            return initialValue;
        }
    });
    const setValue = value => {
        try {
            setStoredValue(value);
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) { }
    };
    return [storedValue, setValue];
}


export default function Details() {
    const { idSlug } = useParams();
    const location = useLocation();
    const isMovie = location.pathname.startsWith("/movies/");
    const isSerie = location.pathname.startsWith("/series/");
    const id = idSlug ? idSlug.split("-")[0] : null;
    const url = id ? (isMovie
        ? `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=fr-FR`
        : `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=fr-FR`) : null;
    const { data, loading, error } = useFetch(url);

    // Cast
    const [cast, setCast] = useState([]);
    useEffect(() => {
        if (!id) return setCast([]);
        fetch(`https://api.themoviedb.org/3/${isMovie ? "movie" : "tv"}/${id}/credits?api_key=${API_KEY}&language=fr-FR`)
            .then(res => res.json())
            .then(json => setCast(Array.isArray(json.cast) ? json.cast.slice(0, 5) : []))
            .catch(() => setCast([]));
    }, [id, isMovie]);

    // Suggestions similaires
    const [similar, setSimilar] = useState([]);
    useEffect(() => {
        if (!id) return setSimilar([]);
        fetch(`https://api.themoviedb.org/3/${isMovie ? "movie" : "tv"}/${id}/similar?api_key=${API_KEY}&language=fr-FR`)
            .then(res => res.json())
            .then(json => setSimilar(Array.isArray(json.results) ? json.results.slice(0, 6) : []))
            .catch(() => setSimilar([]));
    }, [id, isMovie]);

    // Favoris (localStorage cohérent)
    const [isFav, setIsFav] = useState(false);
    useEffect(() => {
        if (!data) return setIsFav(false);
        setIsFav(isFavorite({ ...data, media_type: isMovie ? "movie" : "tv" }));
        const syncFavorite = () => setIsFav(isFavorite({ ...data, media_type: isMovie ? "movie" : "tv" }));
        window.addEventListener('storage', syncFavorite);
        return () => window.removeEventListener('storage', syncFavorite);
    }, [data, isMovie]);

    const toggleFavori = () => {
        if (!data) return;
        const favItem = { ...data, media_type: isMovie ? "movie" : "tv" };
        if (isFavorite(favItem)) {
            removeFavorite(favItem);
            setIsFav(false);
        } else {
            addFavorite(favItem);
            setIsFav(true);
        }
    };

    // Commentaires (API + localStorage)
    const [commentsApi, setCommentsApi] = useState([]);
    useEffect(() => {
        if (!id) return setCommentsApi([]);
        fetch(`https://api.themoviedb.org/3/${isMovie ? "movie" : "tv"}/${id}/reviews?api_key=${API_KEY}&language=fr-FR`)
            .then(res => res.json())
            .then(json => setCommentsApi(Array.isArray(json.results) ? json.results : []))
            .catch(() => setCommentsApi([]));
    }, [id, isMovie]);
    // Gestion centralisée des commentaires utilisateur (clé globale)
    const [comments, setComments] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(null);

    // Charger les commentaires pour ce film/série depuis la clé globale
    useEffect(() => {
        if (!id) return setComments([]);
        const all = getComments();
        setComments(all.filter(c => c.id === Number(id) && c.media_type === (isMovie ? "movie" : "tv")));
    }, [id, modalOpen]);

    // Réalisateur/créateur
    const [realisateur, setRealisateur] = useState("-");
    useEffect(() => {
        if (!id) return setRealisateur("-");
        if (isMovie) {
            fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${API_KEY}&language=fr-FR`)
                .then(res => res.json())
                .then(json => {
                    const dir = Array.isArray(json.crew) ? json.crew.find(p => p.job === "Director") : null;
                    setRealisateur(dir ? dir.name : "-");
                })
                .catch(() => setRealisateur("-"));
        } else if (isSerie && data && Array.isArray(data.created_by)) {
            setRealisateur(data.created_by.map(c => c.name).join(", ") || "-");
        } else {
            setRealisateur("-");
        }
    }, [id, isMovie, isSerie, data]);

    // Sécurité du rendu
    if (loading) return <div className="p-4">Chargement...</div>;
    if (error) return <div className="p-4 text-red-500">Erreur lors du chargement</div>;
    if (!data || typeof data !== 'object') {
        return (
            <div className="p-4 max-w-3xl mx-auto bg-gray-900 rounded-lg shadow-lg text-white">
                <div className="text-center text-gray-400">Aucune donnée trouvée pour ce média.</div>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-3xl mx-auto bg-gray-900 rounded-lg shadow-lg text-white">
            <div className="flex flex-col md:flex-row gap-6">
                {data && data.poster_path ? (
                    <img src={`https://image.tmdb.org/t/p/w300${data.poster_path}`} alt={isMovie ? data.title : data.name} className="mb-4 rounded w-50 h-75 object-cover self-center md:self-start" />
                ) : (
                    <div className="mb-4 w-50 h-75 aspect-[2/3] bg-gray-700 flex items-center justify-center rounded-lg text-gray-400 text-base self-center md:self-start">
                        Image indisponible
                    </div>
                )}
                <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{isMovie ? data.title || '-' : data.name || '-'}</h2>
                    <div className="mb-2 flex flex-wrap gap-2 items-center">
                        <span className="bg-yellow-400 text-gray-900 px-2 py-1 rounded text-xs font-semibold">{isMovie ? "Film" : "Série"}</span>
                        {data.genres && data.genres.length > 0 ? (
                            data.genres.map(g => (
                                <span key={g.id} className="bg-gray-700 px-2 py-1 rounded text-xs">{g.name}</span>
                            ))
                        ) : (
                            <span className="text-xs text-gray-500">-</span>
                        )}
                    </div>
                    <div className="mb-2"><strong>Réalisateur{isSerie && "(s)"} :</strong> {realisateur || '-'}</div>
                    <div className="mb-2"><strong>Pays d'origine :</strong> {data.production_countries && data.production_countries.length > 0 ? data.production_countries.map(c => c.name).join(", ") : '-'}</div>
                    <div className="mb-2"><strong>{isMovie ? "Date de sortie" : "Date de première diffusion"} :</strong> {isMovie ? (data.release_date || '-') : (data.first_air_date || '-')}</div>
                    <div className="mb-2"><strong>Note :</strong> {typeof data.vote_average === 'number' ? data.vote_average : '-'} / 10</div>
                    <div className="mb-2"><strong>Résumé :</strong> {data.overview || '-'}</div>
                    <div className="mb-2 flex flex-wrap gap-2 items-center">
                        <button
                            aria-label={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
                            onClick={toggleFavori}
                            className="focus:outline-none"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill={isFav ? "#facc15" : "#9ca3af"}
                                stroke={isFav ? "#facc15" : "#9ca3af"}
                                className="w-7 h-7 transition"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.48 3.499a1.7 1.7 0 0 1 3.04 0l2.09 4.23a1.7 1.7 0 0 0 1.28.93l4.67.68a1.7 1.7 0 0 1 .94 2.9l-3.38 3.29a1.7 1.7 0 0 0-.49 1.5l.8 4.65a1.7 1.7 0 0 1-2.47 1.79l-4.18-2.2a1.7 1.7 0 0 0-1.58 0l-4.18 2.2a1.7 1.7 0 0 1-2.47-1.79l.8-4.65a1.7 1.7 0 0 0-.49-1.5l-3.38-3.29a1.7 1.7 0 0 1 .94-2.9l4.67-.68a1.7 1.7 0 0 0 1.28-.93l2.09-4.23z" />
                            </svg>
                        </button>
                        <span className="text-xs text-gray-400">{isFav ? "Retirer des favoris" : "Ajouter aux favoris"}</span>
                    </div>
                </div>
            </div>
            <div className="mt-6">
                <h3 className="text-lg font-bold mb-2">Acteurs principaux</h3>
                <div className="flex flex-wrap gap-4">
                    {cast.length === 0 && <span className="text-gray-400">Aucun acteur trouvé.</span>}
                    {cast.map(a => (
                        <div key={a.id} className="flex flex-col items-center w-24">
                            {a.profile_path ? (
                                <img src={`https://image.tmdb.org/t/p/w185${a.profile_path}`} alt={a.name} className="rounded-full w-16 h-16 object-cover mb-1" />
                            ) : (
                                <div className="rounded-full w-16 h-16 bg-gray-700 flex items-center justify-center mb-1">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                                        <circle cx="12" cy="7" r="4" />
                                        <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
                                    </svg>
                                </div>
                            )}
                            <span className="text-xs text-center">{a.name}</span>
                            <span className="text-[10px] text-gray-400">{a.character}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-8">
                <h3 className="text-lg font-bold mb-2">Commentaires</h3>
                <button
                    onClick={() => { setEditIndex(0); setModalOpen(true); }}
                    className="mb-2 px-3 py-1 rounded bg-yellow-400 text-gray-900 font-semibold hover:bg-yellow-300 flex items-center gap-2"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="#1f2937"
                        stroke="#1f2937"
                        className="w-5 h-5"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 11.5a8.38 8.38 0 0 1-1.9 5.4A8.5 8.5 0 0 1 3 12.5c0-4.42 3.58-8 8-8s8 3.58 8 8z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 15h8" />
                    </svg>
                    {comments.length === 0 ? "Ajouter un commentaire" : "Modifier mon commentaire"}
                </button>
                {/* Commentaires API */}
                {commentsApi.length > 0 && (
                    <div className="mb-4">
                        <h4 className="font-semibold text-sm mb-1 text-gray-300">Commentaires publics</h4>
                        {commentsApi.map(c => (
                            <div key={c.id} className="mb-2 p-2 bg-gray-800 rounded">
                                <div className="text-xs text-gray-400">{c.author} <span className="text-gray-500">({c.created_at?.slice(0, 10)})</span></div>
                                <div className="text-sm">{c.content}</div>
                            </div>
                        ))}
                    </div>
                )}
                {/* Commentaires LocalStorage */}
                <Comments
                    comments={comments}
                    title="Mes commentaires"
                    onEdit={(idx) => { setEditIndex(idx); setModalOpen(true); }}
                    onDelete={(_, com) => {
                        deleteComment(com);
                        // Rafraîchir la liste
                        const all = getComments();
                        setComments(all.filter(c => c.id === Number(id) && c.media_type === (isMovie ? "movie" : "tv")));
                    }}
                />
                <CommentModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSave={txt => {
                        // Ajout ou modification via saveComment (clé globale)
                        const item = {
                            id: Number(id),
                            media_type: isMovie ? "movie" : "tv",
                            title: isMovie ? data?.title : data?.name
                        };
                        saveComment(item, txt);
                        // Rafraîchir la liste
                        const all = getComments();
                        setComments(all.filter(c => c.id === Number(id) && c.media_type === (isMovie ? "movie" : "tv")));
                    }}
                    onDelete={editIndex !== null ? () => {
                        const com = comments[editIndex];
                        deleteComment(com);
                        const all = getComments();
                        setComments(all.filter(c => c.id === Number(id) && c.media_type === (isMovie ? "movie" : "tv")));
                    } : undefined}
                    initialValue={editIndex !== null ? (comments[editIndex]?.content || comments[editIndex]?.text || "") : ""}
                />
            </div>
            <div className="mt-8">
                <h3 className="text-lg font-bold mb-2">Suggestions similaires</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {similar.length === 0 && <span className="text-gray-400 col-span-2">Aucune suggestion trouvée.</span>}
                    {similar.map(s => (
                        <a key={s.id} href={`/${isMovie ? "movies" : "series"}/${s.id}-${(s.title || s.name).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="block bg-gray-800 rounded p-2 hover:bg-gray-700 transition">
                            {s.poster_path ? (
                                <img src={`https://image.tmdb.org/t/p/w185${s.poster_path}`} alt={s.title || s.name} className="rounded mb-2 w-full h-32 object-cover" />
                            ) : (
                                <div className="rounded w-full h-32 bg-gray-700 flex items-center justify-center mb-2">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                        <line x1="3" y1="3" x2="21" y2="21" />
                                    </svg>
                                </div>
                            )}
                            <div className="text-xs text-center">{s.title || s.name}</div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
