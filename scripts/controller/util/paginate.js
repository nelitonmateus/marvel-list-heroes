class PaginatorUtil {

    constructor() {}

    paginate(totalItems, currentPage, pageSize, maxPages) {

        if (currentPage === void 0) { currentPage = 1; }
        if (pageSize === void 0) { pageSize = 10; }
        if (maxPages === void 0) { maxPages = 10; }

        var totalPages = Math.ceil(totalItems / pageSize);

        if (currentPage < 1) {
            currentPage = 1;
        }
        else if (currentPage > totalPages) {
            currentPage = totalPages;
        }

        var startPage, endPage;
        if (totalPages <= maxPages) {
            startPage = 1;
            endPage = totalPages;
        }
        else {
            ({ startPage, endPage } = this.totalPagesMoreThanMaxPages(maxPages, currentPage, startPage, endPage, totalPages));
        }

        var startIndex = (currentPage - 1) * pageSize;
        var endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);
        var pages = Array.from(Array((endPage + 1) - startPage).keys()).map(function (i) { return startPage + i; });

        return {
            totalItems: totalItems,
            currentPage: currentPage,
            pageSize: pageSize,
            totalPages: totalPages,
            startPage: startPage,
            endPage: endPage,
            startIndex: startIndex,
            endIndex: endIndex,
            pages: pages
        };
    }

    totalPagesMoreThanMaxPages(maxPages, currentPage, startPage, endPage, totalPages) {
        var maxPagesBeforeCurrentPage = Math.floor(maxPages / 2);
        var maxPagesAfterCurrentPage = Math.ceil(maxPages / 2) - 1;
        if (currentPage <= maxPagesBeforeCurrentPage) {
            startPage = 1;
            endPage = maxPages;
        }
        else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
            startPage = totalPages - maxPages + 1;
            endPage = totalPages;
        }
        else {
            startPage = currentPage - maxPagesBeforeCurrentPage;
            endPage = currentPage + maxPagesAfterCurrentPage;
        }
        return { startPage, endPage };
    }
}