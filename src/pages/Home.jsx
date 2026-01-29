import { useEffect, useState } from "react";
import Card from "../components/Card.jsx";
import slugify from "../utils/slug.js";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export default function Home() {
    const [movies, setMovies] = useState([]);
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=fr-FR&page=1`).then(res => res.json()),
            fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}&language=fr-FR&page=1`).then(res => res.json())
        ]).then(([moviesRes, seriesRes]) => {
            setMovies(Array.isArray(moviesRes.results) ? moviesRes.results.slice(0, 8) : []);
            setSeries(Array.isArray(seriesRes.results) ? seriesRes.results.slice(0, 8) : []);
            setLoading(false);
        });
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-6 text-white">Bienvenue sur Cinetech</h2>
            <p className="mb-8 text-gray-300 max-w-2xl">Découvrez une sélection de films et séries populaires issus de l'API TMDB. Ajoutez vos favoris, commentez, et explorez l'univers du cinéma et des séries !</p>
            <section className="mb-10">
                <h3 className="text-xl font-semibold mb-4 text-yellow-400">Films populaires</h3>
                {loading ? <div className="text-gray-400">Chargement...</div> : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {movies.map(item => (
                            <Card key={item.id + 'movie'} item={{ ...item, media_type: "movie" }} slug={slugify(item.title || "")} />
                        ))}
                    </div>
                )}
            </section>
            <section>
                <h3 className="text-xl font-semibold mb-4 text-yellow-400">Séries populaires</h3>
                {loading ? <div className="text-gray-400">Chargement...</div> : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {series.map(item => (
                            <Card key={item.id + 'tv'} item={{ ...item, media_type: "tv" }} slug={slugify(item.name || "")} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
