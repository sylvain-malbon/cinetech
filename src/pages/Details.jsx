import { useParams, useLocation } from "react-router-dom";
import useFetch from "../hooks/useFetch";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export default function Details() {
    const { idSlug } = useParams();
    const location = useLocation();
    // Détecter le type (movie ou serie) selon le chemin
    const isMovie = location.pathname.startsWith("/movies/");
    const isSerie = location.pathname.startsWith("/series/");
    const id = idSlug.split("-")[0];
    const url = isMovie
        ? `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=fr-FR`
        : `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=fr-FR`;
    const { data, loading, error } = useFetch(url);

    if (loading) return <div className="p-4">Chargement...</div>;
    if (error) return <div className="p-4 text-red-500">Erreur lors du chargement</div>;
    if (!data) return null;

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">{isMovie ? data.title : data.name}</h2>
            {data.poster_path ? (
                <img src={`https://image.tmdb.org/t/p/w300${data.poster_path}`} alt={isMovie ? data.title : data.name} className="mb-4 rounded" />
            ) : (
                <div className="mb-4 flex items-center justify-center w-[200px] h-[300px] bg-gray-700 rounded">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <line x1="3" y1="3" x2="21" y2="21" />
                    </svg>
                </div>
            )}
            <div className="text-white mb-2">
                <strong>{isMovie ? "Date de sortie" : "Date de première diffusion"} :</strong> {isMovie ? data.release_date : data.first_air_date}
            </div>
            <div className="text-white mb-2"><strong>Note :</strong> {data.vote_average} / 10</div>
            <div className="text-white mb-2"><strong>Résumé :</strong> {data.overview}</div>
        </div>
    );
}
