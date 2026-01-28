import React from "react";

// comments : tableau d'objets {id, media_type, title, content, date?}
// onEdit, onDelete : callbacks optionnels (index ou id)
export default function Comments({ comments, title = "Commentaires", onEdit, onDelete }) {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4 text-white">{title}</h3>
            {(!comments || comments.length === 0) ? (
                <div className="text-gray-400">Aucun commentaire pour le moment.</div>
            ) : (
                comments.map((com, idx) => (
                    <div key={com.id + (com.media_type || "") + idx} className="bg-gray-800 p-3 rounded flex justify-between items-center">
                        <div>
                            <div className="text-xs text-gray-400">
                                {(com.media_type === "movie" ? "Film" : com.media_type === "tv" ? "Série" : "")} #{com.id} - {com.title}
                                {com.date && <span className="text-gray-500 ml-2">({com.date})</span>}
                            </div>
                            <div className="text-white text-sm">{com.content || com.text}</div>
                        </div>
                        {(onEdit || onDelete) && (
                            <div className="flex gap-2">
                                {onEdit && <button onClick={() => onEdit(idx, com)} className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600">Modifier</button>}
                                {onDelete && <button onClick={() => onDelete(idx, com)} className="text-xs px-2 py-1 rounded bg-red-500 text-white hover:bg-red-400">Supprimer</button>}
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}
