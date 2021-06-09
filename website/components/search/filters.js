import { useState, useRef, useEffect } from "react";

import UpArrow from "../../components/search/svg/upArrow.js";
import DownArrow from "../../components/search/svg/downArrow.js";

export default function Filters({
    searchQuery,
    currPageNumber,
    dateRange,
    startDate,
    endDate,
    sortBy,
    itemType,
    totalNumOfHits,
    processingTimeMS,
}) {
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const [showSortByDropdown, setShowSortByDropdown] = useState(false);
    const [showDatePickerDropdown, setShowDatePickerDropdown] = useState(false);
    const [showDateRangeDropdown, setShowDateRangeDropdown] = useState(false);

    const typeDropdown = useRef(null);
    const filterDropdown = useRef(null);
    const dateRangeDropdown = useRef(null);

    /// CHECK ANY CLICK OUTSIDE DROPDOWN BOX TO CLOSE DROPDOWN LIST
    useEffect(() => {
        window.addEventListener("click", (event) => handleClickWatcher(event));
        return () => window.removeEventListener("click", (event) => handleClickWatcher(event));
    }, []);

    const handleClickWatcher = (e) => {
        if (typeDropdown.current && filterDropdown.current && dateRangeDropdown.current) {
            const isClickOnAnyDropdownEl =
                typeDropdown.current.contains(e.target) ||
                filterDropdown.current.contains(e.target) ||
                dateRangeDropdown.current.contains(e.target);

            if (!isClickOnAnyDropdownEl) {
                setShowTypeDropdown(false);
                setShowSortByDropdown(false);
                setShowDateRangeDropdown(false);
            }
        }
    };

    const toggleShowTypeDropdown = () => {
        if (showTypeDropdown) {
            setShowTypeDropdown(false);
            setShowSortByDropdown(false);
            setShowDatePickerDropdown(false);
            setShowDateRangeDropdown(false);
        } else {
            setShowTypeDropdown(true);
            setShowSortByDropdown(false);
            setShowDatePickerDropdown(false);
            setShowDateRangeDropdown(false);
        }
    };

    const createLinkForItemTypeButton = (itemTypeButtonValue) => {
        const query = `q=${searchQuery}`;
        const page = "page=1";
        const _itemType = `itemType=${itemTypeButtonValue}`;
        const _dateRange = `dateRange=${dateRange}`;
        const _startDate = `startDate=${startDate}`;
        const _endDate = `endDate=${endDate}`;
        const _sortBy = `sortBy=${sortBy}`;

        return `/search?${query}&${page}&${_itemType}&${_dateRange}&${_startDate}&${_endDate}&${_sortBy}`;
    };

    const toggleShowSortByDropdown = () => {
        if (showSortByDropdown) {
            setShowTypeDropdown(false);
            setShowSortByDropdown(false);
            setShowDatePickerDropdown(false);
            setShowDateRangeDropdown(false);
        } else {
            setShowTypeDropdown(false);
            setShowSortByDropdown(true);
            setShowDatePickerDropdown(false);
            setShowDateRangeDropdown(false);
        }
    };

    const createLinkForSortByButton = (sortByButtonValue) => {
        const query = `q=${searchQuery}`;
        const page = `page=${currPageNumber + 1}`;
        const _itemType = `itemType=${itemType}`;
        const _dateRange = `dateRange=${dateRange}`;
        const _startDate = `startDate=${startDate}`;
        const _endDate = `endDate=${endDate}`;
        const _sortBy = `sortBy=${sortByButtonValue}`;

        return `/search?${query}&${page}&${_itemType}&${_dateRange}&${_startDate}&${_endDate}&${_sortBy}`;
    };

    const toggleShowDateRangeDropdown = () => {
        if (showDateRangeDropdown) {
            setShowTypeDropdown(false);
            setShowSortByDropdown(false);
            setShowDatePickerDropdown(false);
            setShowDateRangeDropdown(false);
        } else {
            setShowTypeDropdown(false);
            setShowSortByDropdown(false);
            setShowDatePickerDropdown(false);
            setShowDateRangeDropdown(true);
        }
    };

    const renderDateRangeDropdownLabel = () => {
        if (dateRange === "allTime") {
            return "All Time";
        } else if (dateRange === "last24h") {
            return "Last 24h";
        } else if (dateRange === "pastWeek") {
            return "Past Week";
        } else if (dateRange === "pastMonth") {
            return "Past Month";
        } else if (dateRange === "pastYear") {
            return "Past Year";
        } else {
            return "All Time";
        }
    };

    const createLinkForDateRangeButton = (dateRangeButtonValue) => {
        const query = `q=${searchQuery}`;
        const page = "page=1";
        const _itemType = `itemType=${itemType}`;
        const _dateRange = `dateRange=${dateRangeButtonValue}`;
        const _startDate = `startDate=${startDate}`;
        const _endDate = `endDate=${endDate}`;
        const _sortBy = `sortBy=${sortBy}`;

        return `/search?${query}&${page}&${_itemType}&${_dateRange}&${_startDate}&${_endDate}&${_sortBy}`;
    };

    return (
        <div className="search-results-filters-container">
            <div className="search-results-filters">
                <span className="search-results-filter">
                    <span className="search-results-filter-text">Search</span>

                    {/* FILTER TYPE DROP DOWN */}
                    <div className="search-results-filter-dropdown" ref={typeDropdown}>
                        <label
                            className="search-results-filter-dropdown-label"
                            onClick={() => toggleShowTypeDropdown()}>
                            {itemType === "item" ? "Items" : null}
                            {itemType === "comment" ? "Comments" : null}
                            {itemType !== "item" && itemType !== "comment" ? "All" : null}
                            {showTypeDropdown ? <UpArrow /> : <DownArrow />}
                        </label>
                        <ul
                            className={
                                showTypeDropdown
                                    ? "search-results-filter-dropdown-list"
                                    : "search-results-filter-dropdown-list hide"
                            }>
                            <li>
                                <a href={createLinkForItemTypeButton("all")}>
                                    <button>All</button>
                                </a>
                            </li>
                            <li>
                                <a href={createLinkForItemTypeButton("item")}>
                                    <button>Items</button>
                                </a>
                            </li>
                            <li>
                                <a href={createLinkForItemTypeButton("comment")}>
                                    <button>Comments</button>
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* FILTER BY DROPDOWN */}
                    <span className="search-results-filter">
                        <span className="search-results-filter-text">by</span>
                        <div className="search-results-filter-dropdown" ref={filterDropdown}>
                            <label
                                className="search-results-filter-dropdown-label"
                                onClick={() => toggleShowSortByDropdown()}>
                                {sortBy === "popularity" || !sortBy ? "Popularity" : null}
                                {sortBy === "date" ? "Date" : null}
                                {showSortByDropdown ? <UpArrow /> : <DownArrow />}
                            </label>
                            <ul
                                className={
                                    showSortByDropdown
                                        ? "search-results-filter-dropdown-list"
                                        : "search-results-filter-dropdown-list hide"
                                }>
                                <li>
                                    <a href={createLinkForSortByButton("popularity")}>
                                        <button>Popularity</button>
                                    </a>
                                </li>
                                <li>
                                    <a href={createLinkForSortByButton("date")}>
                                        <button>Date</button>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </span>

                    {/* FILTER DATE DROPDOWN */}
                    <span className="search-results-filter">
                        <span className="search-results-filter-text">for</span>
                        <div className="search-results-filter-dropdown" ref={dateRangeDropdown}>
                            <label
                                className="search-results-filter-dropdown-label"
                                onClick={() => toggleShowDateRangeDropdown()}>
                                {renderDateRangeDropdownLabel()}
                                {showDateRangeDropdown ? <UpArrow /> : <DownArrow />}
                            </label>
                            <ul
                                className={
                                    showDateRangeDropdown
                                        ? "search-results-filter-dropdown-list"
                                        : "search-results-filter-dropdown-list hide"
                                }>
                                <li>
                                    <a href={createLinkForDateRangeButton("allTime")}>
                                        <button>All Time</button>
                                    </a>
                                </li>
                                <li>
                                    <a href={createLinkForDateRangeButton("last24h")}>
                                        <button>Last 24h</button>
                                    </a>
                                </li>
                                <li>
                                    <a href={createLinkForDateRangeButton("pastWeek")}>
                                        <button>Past Week</button>
                                    </a>
                                </li>
                                <li>
                                    <a href={createLinkForDateRangeButton("pastMonth")}>
                                        <button>Past Month</button>
                                    </a>
                                </li>
                                <li>
                                    <a href={createLinkForDateRangeButton("pastYear")}>
                                        <button>Past Year</button>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </span>

                    {/* PROCESSING TIME */}
                    <div className="search-results-filters-stats">
                        <span>{totalNumOfHits} results</span>
                        <span className="search-results-filters-stats-time">({processingTimeMS * 0.001} seconds)</span>
                    </div>
                </span>
            </div>
        </div>
    );
}
