import { useState, useEffect } from "react";


export default function CommentModal({ open, onClose, onSave, onDelete, initialValue = "", initialAuthor = 'user1' }) {
    const [comment, setComment] = useState(initialValue);

    // Réinitialise le champ à chaque ouverture de la modale
    useEffect(() => {
        if (open) {
            Promise.resolve().then(() => setComment(initialValue));
        }
    }, [open, initialValue]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-gray-900 p-6 rounded shadow-lg w-full max-w-md">
                <h3 className="text-lg font-bold text-white mb-2">{initialValue ? "Modifier le commentaire" : "Ajouter un commentaire"}</h3>
                <div className="text-sm text-gray-300 mb-3">{(initialAuthor || 'user1').charAt(0).toUpperCase() + (initialAuthor || 'user1').slice(1)} a dit :</div>
                <textarea
                    className="w-full p-2 rounded bg-gray-800 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    rows={4}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Votre commentaire..."
                />
                <div className="flex justify-between gap-2">
                    {onDelete && initialValue && (
                        <button
                            className="px-4 py-1 rounded bg-red-500 text-white hover:bg-red-400"
                            onClick={() => { onDelete(); onClose(); }}
                        >Supprimer</button>
                    )}
                    <div className="flex gap-2 ml-auto">
                        <button
                            className="px-4 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600"
                            onClick={onClose}
                        >Annuler</button>
                        <button
                            className="px-4 py-1 rounded bg-yellow-400 text-gray-900 font-semibold hover:bg-yellow-300"
                            onClick={() => { console.log('CommentModal onSave:', { comment, initialAuthor }); onSave(comment); onClose(); }}
                            disabled={comment.trim().length === 0}
                        >Enregistrer</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
