import { useEffect, useState } from "react";
import { getComments, deleteComment, saveComment } from "../utils/localStorage.js";
import Comments from "../components/Comments.jsx";
import CommentModal from "../components/CommentModal";

export default function CommentsPage() {
    const [comments, setComments] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(null);

    useEffect(() => {
        setComments(getComments());
    }, [modalOpen]);

    const handleDelete = (idx, com) => {
        deleteComment(com);
        setComments(getComments());
    };

    const handleEdit = (idx) => {
        setEditIndex(idx);
        setModalOpen(true);
    };

    return (
        <div className="p-4">
            <Comments
                comments={comments}
                onDelete={handleDelete}
                onEdit={handleEdit}
                title="Mes commentaires"
            />
            <CommentModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={txt => {
                    if (editIndex !== null) {
                        const com = comments[editIndex];
                        saveComment(com, txt);
                        setComments(getComments());
                    }
                }}
                onDelete={editIndex !== null ? () => {
                    const com = comments[editIndex];
                    deleteComment(com);
                    setComments(getComments());
                } : undefined}
                initialValue={editIndex !== null ? (comments[editIndex]?.content || comments[editIndex]?.text || "") : ""}
            />
        </div>
    );
}
