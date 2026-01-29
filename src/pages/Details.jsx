
import { useParams, useLocation } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { useEffect, useState } from "react";
import CommentModal from "../components/CommentModal";
import Comments from "../components/Comments.jsx";
import { getComments, saveComment, addFavorite, removeFavorite, isFavorite } from "../utils/localStorage.js";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;


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
        if (!id) { Promise.resolve().then(() => setCast([])); return; }
        fetch(`https://api.themoviedb.org/3/${isMovie ? "movie" : "tv"}/${id}/credits?api_key=${API_KEY}&language=fr-FR`)
            .then(res => res.json())
            .then(json => setCast(Array.isArray(json.cast) ? json.cast.slice(0, 5) : []))
            .catch(() => Promise.resolve().then(() => setCast([])));
    }, [id, isMovie]);

    // Suggestions similaires
    const [similar, setSimilar] = useState([]);
    useEffect(() => {
        if (!id) { Promise.resolve().then(() => setSimilar([])); return; }
        fetch(`https://api.themoviedb.org/3/${isMovie ? "movie" : "tv"}/${id}/similar?api_key=${API_KEY}&language=fr-FR`)
            .then(res => res.json())
            .then(json => setSimilar(Array.isArray(json.results) ? json.results.slice(0, 6) : []))
            .catch(() => Promise.resolve().then(() => setSimilar([])));
    }, [id, isMovie]);

    // Favoris (localStorage cohérent)
    const [isFav, setIsFav] = useState(false);
    useEffect(() => {
        if (!data) { Promise.resolve().then(() => setIsFav(false)); }
        else {
            Promise.resolve().then(() => setIsFav(isFavorite({ ...data, media_type: isMovie ? "movie" : "tv" })));
        }
        const syncFavorite = () => Promise.resolve().then(() => setIsFav(isFavorite({ ...data, media_type: isMovie ? "movie" : "tv" })));
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
        if (!id) { Promise.resolve().then(() => setCommentsApi([])); return; }
        fetch(`https://api.themoviedb.org/3/${isMovie ? "movie" : "tv"}/${id}/reviews?api_key=${API_KEY}&language=fr-FR`)
            .then(res => res.json())
            .then(json => setCommentsApi(Array.isArray(json.results) ? json.results : []))
            .catch(() => Promise.resolve().then(() => setCommentsApi([])));
    }, [id, isMovie]);
    // Gestion centralisée des commentaires utilisateur (clé globale)
    const [comments, setComments] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [modalInitialAuthor, setModalInitialAuthor] = useState('user1');
    const [replyPath, setReplyPath] = useState(null);
    const [modalInitialValue, setModalInitialValue] = useState("");

    // Charger les commentaires pour ce film/série depuis la clé globale
    useEffect(() => {
        if (!id) { Promise.resolve().then(() => setComments([])); return; }
        const all = getComments();
        Promise.resolve().then(() => setComments(all.filter(c => c.id === Number(id) && c.media_type === (isMovie ? "movie" : "tv"))));
    }, [id, modalOpen, isMovie]);

    // Réalisateur/créateur
    const [realisateur, setRealisateur] = useState("-");
    useEffect(() => {
        if (!id) { Promise.resolve().then(() => setRealisateur("-")); return; }
        if (isMovie) {
            fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${API_KEY}&language=fr-FR`)
                .then(res => res.json())
                .then(json => {
                    const dir = Array.isArray(json.crew) ? json.crew.find(p => p.job === "Director") : null;
                    setRealisateur(dir ? dir.name : "-");
                })
                .catch(() => Promise.resolve().then(() => setRealisateur("-")));
        } else if (isSerie && data && Array.isArray(data.created_by)) {
            Promise.resolve().then(() => setRealisateur(data.created_by.map(c => c.name).join(", ") || "-"));
        } else {
            Promise.resolve().then(() => setRealisateur("-"));
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
                    <div className="mb-4 w-50 h-75 bg-gray-700 flex items-center justify-center rounded-lg text-gray-400 text-base self-center md:self-start" style={{ aspectRatio: '2/3' }}>
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
                {(() => {
                    const topComment = comments && comments[0];
                    const topDeleted = topComment && (topComment.content === 'Commentaire supprimé' || topComment.text === 'Commentaire supprimé');
                    return (
                        <button
                            onClick={() => { if (!topDeleted) { setEditIndex(0); setModalOpen(true); } }}
                            disabled={topDeleted}
                            className={"mb-2 px-3 py-1 rounded bg-yellow-400 text-gray-900 font-semibold hover:bg-yellow-300 flex items-center gap-2 " + (topDeleted ? 'opacity-50 cursor-not-allowed' : '')}
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
                    );
                })()}
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
                    onEdit={(path, com) => {
                        if (com && (com.content === 'Commentaire supprimé' || com.text === 'Commentaire supprimé')) return;
                        setEditIndex(path);
                        setModalInitialValue(com.content || com.text || "");
                        setModalInitialAuthor(com.author || 'user1');
                        setReplyPath(null);
                        setModalOpen(true);
                    }}
                    onDelete={(path) => {
                        const all = getComments();
                        const idxAll = all.findIndex(c => c.id === Number(id) && c.media_type === (isMovie ? "movie" : "tv"));
                        if (path && path.length === 1) {
                            // top-level: remplacer toujours le contenu par 'Commentaire supprimé'
                            if (idxAll !== -1) {
                                const target = all[idxAll];
                                all[idxAll] = { ...target, content: 'Commentaire supprimé', text: 'Commentaire supprimé' };
                                localStorage.setItem('cinetech_comments', JSON.stringify(all));
                            }
                        } else {
                            // delete nested reply
                            if (idxAll !== -1) {
                                const pathAll = [idxAll, ...(path.slice(1))];
                                function deleteByPathAll(arr, pathP) {
                                    if (!pathP || pathP.length === 0) return arr;
                                    if (pathP.length === 1) {
                                        const copy = [...arr];
                                        const node = copy[pathP[0]] || {};
                                        copy[pathP[0]] = { ...node, content: 'Commentaire supprimé', text: 'Commentaire supprimé' };
                                        return copy;
                                    }
                                    const [h, ...r] = pathP;
                                    const copy = [...arr];
                                    copy[h] = { ...copy[h], replies: deleteByPathAll(copy[h].replies || [], r) };
                                    return copy;
                                }
                                const updated = deleteByPathAll(all, pathAll);
                                localStorage.setItem('cinetech_comments', JSON.stringify(updated));
                            }
                        }
                        const refreshed = getComments();
                        setComments(refreshed.filter(c => c.id === Number(id) && c.media_type === (isMovie ? "movie" : "tv")));
                    }}
                    onReply={(path) => {
                        setReplyPath(path);
                        setModalInitialValue("");
                        setModalInitialAuthor('user1');
                        setEditIndex(null);
                        setModalOpen(true);
                    }}
                />
                <CommentModal
                    open={modalOpen}
                    onClose={() => { setModalOpen(false); setEditIndex(null); setReplyPath(null); }}
                    onSave={txt => {
                        console.log('Details onSave:', { txt, replyPath, editIndex });
                        if (replyPath) {
                            // add reply to nested path
                            const all = getComments();
                            const idxAll = all.findIndex(c => c.id === Number(id) && c.media_type === (isMovie ? "movie" : "tv"));
                            if (idxAll !== -1) {
                                const pathAll = [idxAll, ...(replyPath.slice(1))];
                                function addReplyAll(arr, pathP, reply) {
                                    if (!pathP || pathP.length === 0) return arr;
                                    if (pathP.length === 1) {
                                        const copy = [...arr];
                                        const node = copy[pathP[0]] || {};
                                        const replies = Array.isArray(node.replies) ? [...node.replies, reply] : [reply];
                                        copy[pathP[0]] = { ...node, replies };
                                        return copy;
                                    }
                                    const [h, ...r] = pathP;
                                    const copy = [...arr];
                                    copy[h] = { ...copy[h], replies: addReplyAll(copy[h].replies || [], r, reply) };
                                    return copy;
                                }
                                const replyObj = { content: txt, date: new Date().toLocaleString(), replies: [], author: 'user1' };
                                console.log('Details adding reply:', replyObj);
                                const updated = addReplyAll(all, pathAll, replyObj);
                                localStorage.setItem('cinetech_comments', JSON.stringify(updated));
                                const refreshed = getComments();
                                setComments(refreshed.filter(c => c.id === Number(id) && c.media_type === (isMovie ? "movie" : "tv")));
                            }
                        } else if (Array.isArray(editIndex)) {
                            // edit a nested comment or top-level when editIndex is a path array
                            const path = editIndex;
                            const all = getComments();
                            const idxAll = all.findIndex(c => c.id === Number(id) && c.media_type === (isMovie ? "movie" : "tv"));
                            if (idxAll !== -1) {
                                const pathAll = [idxAll, ...(path.slice(1))];
                                // Toujours préfixer par 'Commentaire modifié' lors d'une modification
                                function prefixModified(arr, pathP) {
                                    if (!pathP || pathP.length === 0) return arr;
                                    if (pathP.length === 1) {
                                        const copy = [...arr];
                                        const node = copy[pathP[0]] || {};
                                        const old = node.content || node.text || "";
                                        copy[pathP[0]] = { ...node, content: `Commentaire modifié\n${old}` };
                                        return copy;
                                    }
                                    const [h, ...r] = pathP;
                                    const copy = [...arr];
                                    copy[h] = { ...copy[h], replies: prefixModified(copy[h].replies || [], r) };
                                    return copy;
                                }
                                const updated = prefixModified(all, pathAll);
                                localStorage.setItem('cinetech_comments', JSON.stringify(updated));
                                console.log('Details prefixed modified:', pathAll, updated[pathAll[0]]);
                                const refreshed = getComments();
                                setComments(refreshed.filter(c => c.id === Number(id) && c.media_type === (isMovie ? "movie" : "tv")));
                            }
                        } else {
                            // Ajout top-level via saveComment (editIndex used as numeric flag like 0)
                            const item = {
                                id: Number(id),
                                media_type: isMovie ? "movie" : "tv",
                                title: isMovie ? data?.title : data?.name
                            };
                            saveComment(item, txt);
                            console.log('Details saved top-level via saveComment', { item, txt });
                            const all = getComments();
                            setComments(all.filter(c => c.id === Number(id) && c.media_type === (isMovie ? "movie" : "tv")));
                        }
                        // reset modal state
                        setModalOpen(false);
                        setEditIndex(null);
                        setReplyPath(null);
                        setModalInitialValue("");
                    }}
                    onDelete={editIndex !== null ? () => {
                        // delete based on path stored in editIndex
                        const path = editIndex;
                        const all = getComments();
                        const idxAll = all.findIndex(c => c.id === Number(id) && c.media_type === (isMovie ? "movie" : "tv"));
                        if (idxAll !== -1) {
                            const pathAll = [idxAll, ...(path.slice(1))];
                            function deleteByPathAll(arr, pathP) {
                                if (!pathP || pathP.length === 0) return arr;
                                if (pathP.length === 1) {
                                    // check target for replies: if has replies, replace content
                                    if (Array.isArray(arr[pathP[0]]?.replies) && arr[pathP[0]].replies.length > 0) {
                                        const copy = [...arr];
                                        const node = copy[pathP[0]] || {};
                                        copy[pathP[0]] = { ...node, content: 'Commentaire supprimé', text: 'Commentaire supprimé' };
                                        return copy;
                                    }
                                    const copy = [...arr];
                                    copy.splice(pathP[0], 1);
                                    return copy;
                                }
                                const [h, ...r] = pathP;
                                const copy = [...arr];
                                copy[h] = { ...copy[h], replies: deleteByPathAll(copy[h].replies || [], r) };
                                return copy;
                            }
                            const updated = deleteByPathAll(all, pathAll);
                            localStorage.setItem('cinetech_comments', JSON.stringify(updated));
                            const refreshed = getComments();
                            setComments(refreshed.filter(c => c.id === Number(id) && c.media_type === (isMovie ? "movie" : "tv")));
                        }
                    } : undefined}
                    initialValue={modalInitialValue}
                    initialAuthor={modalInitialAuthor}
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
