import useFetch from "../hooks/useFetch";
import Card from "../components/Card.jsx";
import slugify from "../utils/slug.js";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const url = `https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}&language=fr-FR`;

export default function Series() {
    const { data, loading, error } = useFetch(url);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Séries populaires</h2>
            {loading && <div>Chargement...</div>}
            {error && <div className="text-red-500">Erreur lors du chargement</div>}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data && data.results && data.results.map(serie => (
                    <Card key={serie.id} item={{ ...serie, media_type: "tv" }} slug={slugify(serie.name || "")} />
                ))}
            </div>
        </div>
    );
}
