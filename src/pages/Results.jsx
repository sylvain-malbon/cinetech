import { useLocation } from "react-router-dom";
import useFetch from "../hooks/useFetch";

import Card from "../components/Card.jsx";
import slugify from "../utils/slug.js";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export default function Results() {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const query = params.get("query") || "";
    const url = query.length >= 2
        ? `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&language=fr-FR&query=${encodeURIComponent(query)}`
        : null;
    const { data, loading, error } = useFetch(url);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4 text-white">Résultats pour : <span className="text-yellow-400">{query}</span></h2>
            {loading && <div>Chargement...</div>}
            {error && <div className="text-red-500">Erreur lors de la recherche</div>}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data && data.results && data.results.length > 0 ? (
                    data.results.map(item => (
                        <Card key={item.id} item={item} slug={slugify(item.title || item.name || "")} />
                    ))
                ) : (
                    !loading && <div className="col-span-4 text-gray-400">Aucun résultat</div>
                )}
            </div>
        </div>
    );
}
