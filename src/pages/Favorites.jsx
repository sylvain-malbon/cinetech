
import { useEffect, useState } from "react";
import { getFavorites } from "../utils/localStorage.js";
import Card from "../components/Card.jsx";
import slugify from "../utils/slug.js";
import Pagination from "../components/Pagination.jsx";


export default function Favorites() {
    const [favorites, setFavorites] = useState([]);
    const [page, setPage] = useState(1);
    const FAVORITES_PER_PAGE = 20;

    useEffect(() => {
        setFavorites(getFavorites());
        const syncFavorites = () => setFavorites(getFavorites());
        window.addEventListener('storage', syncFavorites);
        return () => window.removeEventListener('storage', syncFavorites);
    }, []);

    // Pagination logic
    const totalPages = Math.ceil(favorites.length / FAVORITES_PER_PAGE);
    const paginatedFavorites = favorites.slice((page - 1) * FAVORITES_PER_PAGE, page * FAVORITES_PER_PAGE);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4 text-white">Mes favoris</h2>
            {favorites.length === 0 ? (
                <div className="text-gray-400">Aucun favori pour le moment.</div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {paginatedFavorites.map(item => {
                            let media_type = item.media_type;
                            if (!media_type) {
                                media_type = item.title ? "movie" : "tv";
                            }
                            return (
                                <Card key={item.id + media_type}
                                    item={{ ...item, media_type }}
                                    slug={slugify(item.title || item.name || "")}
                                />
                            );
                        })}
                    </div>
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                </>
            )}
        </div>
    );
}
