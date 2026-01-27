import { useEffect, useState } from "react";
import { getComments } from "../utils/localStorage.js";

export default function Messages() {
    const [comments, setComments] = useState([]);

    useEffect(() => {
        setComments(getComments());
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4 text-white">Mes commentaires</h2>
            {comments.length === 0 ? (
                <div className="text-gray-400">Aucun commentaire pour le moment.</div>
            ) : (
                <div className="space-y-4">
                    {comments.map((com, idx) => (
                        <div key={com.id + com.media_type + idx} className="bg-gray-800 p-3 rounded">
                            <div className="text-sm text-gray-300 mb-1">
                                {com.media_type === "movie" ? "Film" : "Série"} #{com.id} - {com.title}
                            </div>
                            <div className="text-white">{com.content}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
