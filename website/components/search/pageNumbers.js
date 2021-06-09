import Link from "next/link";

import DoubleLeftArrowsIcon from "./svg/doubleLeftArrowsIcon.js";
import DoubleRightArrowsIcon from "./svg/doubleRightArrowsIcon.js";

export default function PageNumber({
    currPageNumber,
    totalNumOfPages,
    searchQuery,
    itemType,
    dateRange,
    startDate,
    endDate,
    sortBy,
}) {
    const maxNumOfResults = 3;

    const pages = new Array(Math.abs(totalNumOfPages - 1)).fill(1).map((_, i) => i + 1);

    const headPages = currPageNumber > 0 ? pages.slice(0, currPageNumber).slice(-maxNumOfResults) : [];
    const tailPages = pages.slice(currPageNumber, currPageNumber + maxNumOfResults);

    const isFirstPage = currPageNumber === 0;
    const isLastPage = currPageNumber === totalNumOfPages - 1;

    if (totalNumOfPages === 1) return null;

    const createLinkForPageButton = (pageNumber) => {
        const query = `q=${searchQuery}`;
        const page = `page=${pageNumber}`;
        const _itemType = `itemType=${itemType}`;
        const _dateRange = `dateRange=${dateRange}`;
        const _startDate = `startDate=${startDate}`;
        const _endDate = `endDate=${endDate}`;
        const _sortBy = `sortBy=${sortBy}`;

        return `/search?${query}&${page}&${_itemType}&${_dateRange}&${_startDate}&${_endDate}&${_sortBy}`;
    };

    return (
        <div className="search-results-pagination">
            <ul>
                {!isFirstPage ? (
                    <li>
                        <Link href={createLinkForPageButton(1)}>
                            <a>
                                <button>
                                    <DoubleLeftArrowsIcon />
                                </button>
                            </a>
                        </Link>
                    </li>
                ) : null}
                {headPages.map((page) => {
                    return (
                        <li key={page}>
                            <Link href={createLinkForPageButton(page)}>
                                <a>
                                    <button>{page}</button>
                                </a>
                            </Link>
                        </li>
                    );
                })}
                <li className="current">
                    <button>{currPageNumber + 1}</button>
                </li>
                {tailPages.map((page) => {
                    return (
                        <li key={page}>
                            <Link href={createLinkForPageButton(page + 1)}>
                                <a>
                                    <button>{page + 1}</button>
                                </a>
                            </Link>
                        </li>
                    );
                })}
                {!isLastPage && totalNumOfPages > maxNumOfResults ? (
                    <li className="search-results-pagination-item Pagination_next">
                        <Link href={createLinkForPageButton(totalNumOfPages)}>
                            <a>
                                <button>
                                    <DoubleRightArrowsIcon />
                                </button>
                            </a>
                        </Link>
                    </li>
                ) : null}
            </ul>
        </div>
    );
}
