import { useEffect, useState } from "react";
import { getFavorites } from "../utils/localStorage.js";
import Card from "../components/Card.jsx";
import slugify from "../utils/slug.js";

export default function Favorites() {
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        setFavorites(getFavorites());
        // Pour réagir à l'ajout/retrait, on pourrait écouter le storage event ou utiliser un contexte global
        // Ici, on recharge à chaque affichage de la page
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Mes favoris</h2>
            {favorites.length === 0 ? (
                <div className="text-gray-400">Aucun favori pour le moment.</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {favorites.map(item => {
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
            )}
        </div>
    );
}
