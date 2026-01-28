import React from "react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    return (
        <nav className="flex items-center justify-center gap-2 my-4">
            <button
                className={
                    "px-3 py-1 rounded-md border text-xs font-medium transition focus:outline-none flex items-center justify-center " +
                    (currentPage === 1
                        ? "bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed opacity-60"
                        : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 focus:ring-2 focus:ring-yellow-400")
                }
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Page précédente"
            >
                &lt;
            </button>
            <span className="px-3 py-1 rounded bg-yellow-400 text-gray-900 font-bold select-none shadow">
                {currentPage}
            </span>
            <button
                className={
                    "px-3 py-1 rounded-md border text-xs font-medium transition focus:outline-none flex items-center justify-center " +
                    (currentPage === totalPages
                        ? "bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed opacity-60"
                        : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 focus:ring-2 focus:ring-yellow-400")
                }
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Page suivante"
            >
                &gt;
            </button>
        </nav>
    );
}
