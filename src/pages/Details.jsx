
import { useParams, useLocation } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { useEffect, useState } from "react";
import CommentModal from "../components/CommentModal";

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
    const id = idSlug.split("-")[0];
    const url = isMovie
        ? `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=fr-FR`
        : `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=fr-FR`;
    const { data, loading, error } = useFetch(url);

    // Fetch cast (acteurs)
    const [cast, setCast] = useState([]);
    useEffect(() => {
        fetch(`https://api.themoviedb.org/3/${isMovie ? "movie" : "tv"}/${id}/credits?api_key=${API_KEY}&language=fr-FR`)
            .then(res => res.json())
            .then(json => setCast(json.cast ? json.cast.slice(0, 5) : []));
    }, [id, isMovie]);

    // Fetch similar
    const [similar, setSimilar] = useState([]);
    useEffect(() => {
        fetch(`https://api.themoviedb.org/3/${isMovie ? "movie" : "tv"}/${id}/similar?api_key=${API_KEY}&language=fr-FR`)
            .then(res => res.json())
            .then(json => setSimilar(json.results ? json.results.slice(0, 6) : []));
    }, [id, isMovie]);

    // Favoris (localStorage)
    const [favoris, setFavoris] = useLocalStorage("cinetech_favoris", []);
    const isFav = favoris.some(f => f.id === data?.id && f.type === (isMovie ? "movie" : "tv"));
    const toggleFavori = () => {
        if (!data) return;
        if (isFav) {
            setFavoris(favoris.filter(f => !(f.id === data.id && f.type === (isMovie ? "movie" : "tv"))));
        } else {
            setFavoris([...favoris, { id: data.id, type: isMovie ? "movie" : "tv", title: isMovie ? data.title : data.name, poster: data.poster_path }]);
        }
    };

    // Commentaires (API + localStorage)
    const [commentsApi, setCommentsApi] = useState([]);
    useEffect(() => {
        fetch(`https://api.themoviedb.org/3/${isMovie ? "movie" : "tv"}/${id}/reviews?api_key=${API_KEY}&language=fr-FR`)
            .then(res => res.json())
            .then(json => setCommentsApi(json.results || []));
    }, [id, isMovie]);
    const [comments, setComments] = useLocalStorage(`cinetech_comments_${isMovie ? "movie" : "tv"}_${id}`, []);
    const [modalOpen, setModalOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(null);

    if (loading) return <div className="p-4">Chargement...</div>;
    if (error) return <div className="p-4 text-red-500">Erreur lors du chargement</div>;
    if (!data) return null;

    // Récupération réalisateur/créateur
    // Pour films, on refait un fetch pour crew (API ne renvoie pas crew dans /movie/{id})
    const [realisateur, setRealisateur] = useState("");
    useEffect(() => {
        if (isMovie) {
            // Pour les films, fetch du crew pour trouver le réalisateur
            fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${API_KEY}&language=fr-FR`)
                .then(res => res.json())
                .then(json => {
                    const dir = json.crew.find(p => p.job === "Director");
                    setRealisateur(dir ? dir.name : "-");
                })
                .catch(() => setRealisateur("-"));
        } else if (isSerie && data && data.created_by) {
            // Pour les séries, on prend le champ created_by
            setRealisateur(data.created_by.map(c => c.name).join(", ") || "-");
        } else {
            setRealisateur("-");
        }
    }, [id, isMovie, isSerie, data]);

    return (
        <div className="p-4 max-w-3xl mx-auto bg-gray-900 rounded-lg shadow-lg text-white">
            <div className="flex flex-col md:flex-row gap-6">
                {data.poster_path ? (
                    <img src={`https://image.tmdb.org/t/p/w300${data.poster_path}`} alt={isMovie ? data.title : data.name} className="mb-4 rounded w-50 h-75 object-cover self-center md:self-start" />
                ) : (
                    <div className="mb-4 flex items-center justify-center w-50 h-75 bg-gray-700 rounded">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <line x1="3" y1="3" x2="21" y2="21" />
                        </svg>
                    </div>
                )}
                <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{isMovie ? data.title : data.name}</h2>
                    <div className="mb-2 flex flex-wrap gap-2 items-center">
                        <span className="bg-yellow-400 text-gray-900 px-2 py-1 rounded text-xs font-semibold">{isMovie ? "Film" : "Série"}</span>
                        {data.genres && data.genres.map(g => (
                            <span key={g.id} className="bg-gray-700 px-2 py-1 rounded text-xs">{g.name}</span>
                        ))}
                    </div>
                    <div className="mb-2"><strong>Réalisateur{isSerie && "(s)"} :</strong> {realisateur}</div>
                    <div className="mb-2"><strong>Pays d'origine :</strong> {data.production_countries ? data.production_countries.map(c => c.name).join(", ") : "-"}</div>
                    <div className="mb-2"><strong>{isMovie ? "Date de sortie" : "Date de première diffusion"} :</strong> {isMovie ? data.release_date : data.first_air_date}</div>
                    <div className="mb-2"><strong>Note :</strong> {data.vote_average} / 10</div>
                    <div className="mb-2"><strong>Résumé :</strong> {data.overview}</div>
                    <div className="mb-2 flex flex-wrap gap-2 items-center">
                        <button onClick={toggleFavori} className={`px-3 py-1 rounded font-semibold ${isFav ? "bg-yellow-400 text-gray-900" : "bg-gray-700 text-white hover:bg-gray-600"}`}>
                            {isFav ? "★ Retirer des favoris" : "☆ Ajouter aux favoris"}
                        </button>
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
                <button onClick={() => { setEditIndex(null); setModalOpen(true); }} className="mb-2 px-3 py-1 rounded bg-yellow-400 text-gray-900 font-semibold hover:bg-yellow-300">Ajouter un commentaire</button>
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
                {comments.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-sm mb-1 text-gray-300">Vos commentaires</h4>
                        {comments.map((c, i) => (
                            <div key={i} className="mb-2 p-2 bg-gray-800 rounded flex justify-between items-center">
                                <div>
                                    <div className="text-xs text-gray-400">Vous <span className="text-gray-500">({c.date})</span></div>
                                    <div className="text-sm">{c.text}</div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditIndex(i); setModalOpen(true); }} className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600">Modifier</button>
                                    <button onClick={() => setComments(comments.filter((_, idx) => idx !== i))} className="text-xs px-2 py-1 rounded bg-red-500 text-white hover:bg-red-400">Supprimer</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <CommentModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSave={txt => {
                        if (editIndex !== null) {
                            const newComments = [...comments];
                            newComments[editIndex] = { ...newComments[editIndex], text: txt };
                            setComments(newComments);
                        } else {
                            setComments([...comments, { text: txt, date: new Date().toLocaleDateString() }]);
                        }
                    }}
                    onDelete={editIndex !== null ? () => setComments(comments.filter((_, idx) => idx !== editIndex)) : undefined}
                    initialValue={editIndex !== null ? comments[editIndex].text : ""}
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
