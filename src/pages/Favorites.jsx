
import { useEffect, useState } from "react";
import { getFavorites } from "../utils/localStorage.js";
import Card from "../components/Card.jsx";
import slugify from "../utils/slug.js";
import Pagination from "../components/Pagination.jsx";


export default function Favorites() {
    const [favorites, setFavorites] = useState(() => getFavorites() || []);
    const [page, setPage] = useState(1);
    const FAVORITES_PER_PAGE = 20;

    useEffect(() => {
        const syncFavorites = () => {
            const favs = getFavorites();
            console.log("[DEBUG] Favoris MAJ (storage):", favs);
            setFavorites(favs);
        };
        window.addEventListener('storage', syncFavorites);
        return () => window.removeEventListener('storage', syncFavorites);
    }, []);

    // Pagination logic
    const totalPages = Math.ceil(favorites.length / FAVORITES_PER_PAGE);
    const paginatedFavorites = favorites.slice((page - 1) * FAVORITES_PER_PAGE, page * FAVORITES_PER_PAGE);

    // If the favorites list changes (e.g. an item is removed) the current page
    // might become out of range. Ensure `page` stays within valid bounds.
    useEffect(() => {
        setPage(p => Math.min(p, Math.max(1, totalPages)));
    }, [totalPages]);

    // Debug: log favorites / pagination state to help investigate truncation issues
    useEffect(() => {
        try {
            console.debug("[DEBUG] Favorites state:", {
                favoritesLength: Array.isArray(favorites) ? favorites.length : typeof favorites,
                page,
                FAVORITES_PER_PAGE,
                totalPages,
                paginatedCount: Array.isArray(paginatedFavorites) ? paginatedFavorites.length : typeof paginatedFavorites,
            });
        } catch (e) {
            console.error('[DEBUG] Favorites logging error', e);
        }
    }, [favorites, page, totalPages, paginatedFavorites]);

    // Notification when localStorage was repaired (corrupted favorites JSON)
    const [repairedAlert, setRepairedAlert] = useState(false);
    useEffect(() => {
        const handler = (e) => {
            // On affiche une alerte temporaire et on permet la fermeture manuelle
            console.info('[INFO] localStorage repaired for key', e?.detail?.key);
            setRepairedAlert(true);
            // hide automatically after 6 seconds
            const t = setTimeout(() => setRepairedAlert(false), 6000);
            return () => clearTimeout(t);
        };
        window.addEventListener('cinetech:localStorageRepaired', handler);
        return () => window.removeEventListener('cinetech:localStorageRepaired', handler);
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4 text-white">Mes favoris</h2>
            {repairedAlert && (
                <div className="mb-3 p-2 rounded bg-red-600 text-white text-sm flex items-center justify-between">
                    <span>La liste des favoris a été réparée automatiquement (données corrompues supprimées).</span>
                    <button className="ml-3 px-2 py-1 bg-red-700 rounded" onClick={() => setRepairedAlert(false)}>Fermer</button>
                </div>
            )}
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
