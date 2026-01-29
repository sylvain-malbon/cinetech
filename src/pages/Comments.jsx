
import { useEffect, useState } from "react";
import { getComments } from "../utils/localStorage.js";
import Comments from "../components/Comments.jsx";
import CommentModal from "../components/CommentModal";

export default function CommentsPage() {
    const [comments, setComments] = useState(() => getComments() || []);
    const [modalOpen, setModalOpen] = useState(false);
    const [editPath, setEditPath] = useState(null); // chemin dans l'arbre pour édition
    const [replyPath, setReplyPath] = useState(null); // chemin dans l'arbre pour réponse
    const [modalInitialValue, setModalInitialValue] = useState("");

    // Sync when storage changes (other tabs)
    useEffect(() => {
        const sync = () => setComments(getComments() || []);
        window.addEventListener("storage", sync);
        return () => window.removeEventListener("storage", sync);
    }, []);

    // (getByPath removed — pas utilisé)

    // Utilitaire pour modifier un commentaire/réponse par path (immutabilité)
    function updateByPath(arr, path, updater) {
        if (!path || path.length === 0) return updater(arr);
        const [head, ...rest] = path;
        if (Array.isArray(arr)) {
            const copy = [...arr];
            if (rest.length === 0) {
                copy[head] = updater(copy[head]);
            } else {
                copy[head] = updateByPath(copy[head] || {}, rest, updater);
            }
            return copy;
        }
        // arr is an object (comment) -> operate on its replies array
        const copyObj = { ...arr };
        copyObj.replies = updateByPath(copyObj.replies || [], path, updater);
        return copyObj;
    }

    // (deleteByPath removed — suppression désormais représentée par 'Commentaire supprimé')

    // Edition
    const handleEdit = (path, com) => {
        setEditPath(path);
        setReplyPath(null);
        setModalInitialValue(com.content || com.text || "");
        setModalOpen(true);
    };

    // Réponse
    const handleReply = (path) => {
        setReplyPath(path);
        setEditPath(null);
        setModalInitialValue("");
        setModalOpen(true);
    };

    // (getNodeByPath removed — plus utilisé)

    // Suppression: remplacer toujours le contenu par "Commentaire supprimé" (ne supprime plus les noeuds)
    const handleDelete = (path) => {
        const newComments = updateByPath(comments, path, c => ({ ...c, content: 'Commentaire supprimé', text: 'Commentaire supprimé' }));
        setComments(newComments);
        localStorage.setItem('cinetech_comments', JSON.stringify(newComments));
    };

    // Sauvegarde édition/réponse
    const handleSave = txt => {
        let newComments = comments;
        if (editPath) {
            // Edition
            newComments = updateByPath(comments, editPath, c => ({ ...c, content: txt }));
        } else if (replyPath) {
            // Ajout réponse
            newComments = updateByPath(comments, replyPath, c => ({
                ...c,
                replies: [...(c.replies || []), { content: txt, date: new Date().toLocaleString(), replies: [] }]
            }));
        }
        setComments(newComments);
        localStorage.setItem('cinetech_comments', JSON.stringify(newComments));
        setEditPath(null);
        setReplyPath(null);
        setModalOpen(false);
    };

    return (
        <div className="p-4">
            <Comments
                comments={comments}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onReply={handleReply}
                title="Mes commentaires"
            />
            <CommentModal
                key={modalOpen ? 'open' : 'closed'}
                open={modalOpen}
                onClose={() => { setModalOpen(false); setEditPath(null); setReplyPath(null); }}
                onSave={handleSave}
                onDelete={editPath ? () => handleDelete(editPath) : undefined}
                initialValue={modalInitialValue}
            />
        </div>
    );
}
