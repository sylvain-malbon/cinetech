import { useState, useEffect } from "react";
import useLocalStorage from "../hooks/useLocalStorage.js";

function formatDisplayAuthor(raw) {
    if (!raw) return 'anonyme';
    const v = raw.startsWith('@') ? raw.slice(1) : raw;
    return v.charAt(0).toUpperCase() + v.slice(1);
}

export default function CommentModal({ open, onClose, onSave, onDelete, initialValue = "", initialAuthor }) {
    const [comment, setComment] = useState(initialValue);

    // utilise en priorité le pseudo stocké (utilisateur connecté), sinon la prop initialAuthor
    const [stored] = useLocalStorage('cinetech_user', '');
    const author = (stored && stored.replace(/^@+/, '').trim()) || initialAuthor || 'anonyme';

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
                <div className="text-sm mb-3">
                    <span className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-400 text-gray-900 font-bold text-sm">
                            {(author && author.trim() && author !== 'anonyme')
                                ? author.replace(/^@+/, '').charAt(0).toUpperCase()
                                : 'A'}
                        </span>
                        <span className="text-yellow-400 font-semibold">@{(author && author.trim() && author !== 'anonyme') ? formatDisplayAuthor(author) : 'Anonym'}</span>
                    </span>
                </div>
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
                            onClick={() => { console.log('CommentModal onSave:', { comment, author }); onSave(comment); onClose(); }}
                            disabled={comment.trim().length === 0}
                        >Enregistrer</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
