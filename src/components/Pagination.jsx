import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Generate an array of page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Show at most 5 page numbers

    if (totalPages <= maxPagesToShow) {
      // If we have fewer pages than maxPagesToShow, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);

      // Calculate start and end of page numbers to show
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're at the beginning or end
      if (currentPage <= 2) {
        end = Math.min(totalPages - 1, maxPagesToShow - 1);
      } else if (currentPage >= totalPages - 1) {
        start = Math.max(2, totalPages - maxPagesToShow + 2);
      }

      // Add ellipsis if needed
      if (start > 2) {
        pageNumbers.push("...");
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pageNumbers.push("...");
      }

      // Always include last page
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <nav aria-label="Recipe pagination" className="pagination-container">
      <ul className="pagination">
        {/* Previous button */}
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &laquo; Previous
          </button>
        </li>

        {/* Page numbers */}
        {getPageNumbers().map((page, index) => (
          <li
            key={index}
            className={`page-item ${page === currentPage ? "active" : ""} ${
              page === "..." ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => (page !== "..." ? onPageChange(page) : null)}
              disabled={page === "..."}
            >
              {page}
            </button>
          </li>
        ))}

        {/* Next button */}
        <li
          className={`page-item ${
            currentPage === totalPages ? "disabled" : ""
          }`}
        >
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next &raquo;
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
