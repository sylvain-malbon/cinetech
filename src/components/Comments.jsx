
import React from "react";

// Affichage récursif d'un commentaire et de ses replies
function CommentItem({ com, path, onEdit, onDelete, onReply }) {
    // path = tableau d'index pour localiser le commentaire dans l'arbre
    const isRoot = path.length === 1;
    const isDeleted = (com.content === 'Commentaire supprimé' || com.text === 'Commentaire supprimé');
    // Style uniforme pour l'auteur avec avatar
    const authorDisplay = (
        <span className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-400 text-gray-900 font-bold text-sm">U</span>
            <span className="text-yellow-400 font-semibold">@User1</span>
        </span>
    );
    return (
        <div className={"bg-gray-800 p-3 rounded mb-2 " + (path.length > 0 ? "ml-4 border-l-2 border-gray-600 pl-4" : "")}>
            <div>
                {isRoot && (
                    <div className="text-xs text-gray-400 mb-1 flex items-center gap-2">
                        {/* Miniature du film/série si poster_path présent */}
                        {com.poster_path && (
                            <img
                                src={`https://image.tmdb.org/t/p/w45${com.poster_path}`}
                                alt={com.title || com.name || "miniature"}
                                className="w-8 h-12 object-cover rounded mr-2 border border-gray-700 bg-gray-700"
                                style={{ minWidth: 32, minHeight: 48 }}
                            />
                        )}
                        <span>
                            {(com.media_type === "movie" ? "Film" : com.media_type === "tv" ? "Série" : "")} {com.id ? `#${com.id}` : ''} {com.title ? `- ${com.title}` : ''}
                            {com.date && <span className="text-gray-500 ml-2">({com.date})</span>}
                            <div className="text-sm mt-1">{authorDisplay}</div>
                        </span>
                    </div>
                )}
                {!isRoot && com.date && (
                    <div className="text-xs text-gray-500 mb-1">{authorDisplay}{com.date && <span className="text-gray-500 ml-2">({com.date})</span>}</div>
                )}
                <div className={isDeleted ? "text-gray-400 italic text-sm mb-2 whitespace-pre-line" : "text-white text-sm mb-2 whitespace-pre-line"}>{com.content || com.text}</div>
                <div className="flex gap-2 flex-wrap mb-1">
                    {onReply && (
                        <button
                            onClick={() => onReply(path, com)}
                            className="text-xs px-2 py-1 rounded bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600 focus:outline-none"
                        >
                            Répondre
                        </button>
                    )}
                    {onEdit && ((com.content !== 'Commentaire supprimé' && com.text !== 'Commentaire supprimé') ? <button onClick={() => onEdit(path, com)} className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600">Modifier</button> : null)}
                    {onDelete && <button onClick={() => onDelete(path, com)} className="text-xs px-2 py-1 rounded bg-red-500 text-white hover:bg-red-400">Supprimer</button>}
                </div>
            </div>
            {/* Affichage récursif des réponses */}
            {Array.isArray(com.replies) && com.replies.length > 0 && (
                <div className="mt-3 space-y-2">
                    {com.replies.map((rep, rIdx) => (
                        <CommentItem
                            key={rIdx}
                            com={rep}
                            path={[...path, rIdx]}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onReply={onReply}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// Composant principal
export default function Comments({ comments, title = "Commentaires", onEdit, onDelete, onReply }) {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4 text-white">{title}</h3>
            {(!comments || comments.length === 0) ? (
                <div className="text-gray-400">Aucun commentaire pour le moment.</div>
            ) : (
                comments.map((com, idx) => (
                    <CommentItem
                        key={com.id + (com.media_type || "") + idx}
                        com={com}
                        idx={idx}
                        path={[idx]}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onReply={onReply}
                    />
                ))
            )}
        </div>
    );
}
