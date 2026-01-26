import useFetch from "../hooks/useFetch";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=fr-FR`;

export default function Movies() {
    const { data, loading, error } = useFetch(url);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Films populaires</h2>
            {loading && <div>Chargement...</div>}
            {error && <div className="text-red-500">Erreur lors du chargement</div>}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data && data.results && data.results.map(film => (
                    <div key={film.id} className="bg-gray-800 rounded p-2 flex flex-col items-center">
                        {film.poster_path && (
                            <img src={`https://image.tmdb.org/t/p/w200${film.poster_path}`} alt={film.title} className="mb-2 rounded" />
                        )}
                        <div className="text-center text-white font-semibold">{film.title}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
