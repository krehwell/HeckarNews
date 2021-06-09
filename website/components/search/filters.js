import { useState, useRef, useEffect } from "react";
import Router from "next/router";
import Link from "next/link";
import moment from "moment";

import DatePicker from "../../components/search/datePicker.js";

import UpArrow from "../../components/search/svg/upArrow.js";
import DownArrow from "../../components/search/svg/downArrow.js";
import RightArrow from "../../components/search/svg/rightArrow.js";

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
    const datePickerDropdown = useRef(null);

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
                dateRangeDropdown.current.contains(e.target) ||
                datePickerDropdown.current.contains(e.target);

            if (!isClickOnAnyDropdownEl) {
                setShowTypeDropdown(false);
                setShowSortByDropdown(false);
                setShowDateRangeDropdown(false);
                setShowDatePickerDropdown(false);
            }
        }
    };

    /// TYPE DROPDOWN
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

    /// SORT BY DROPDOWN
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

    /// DATE RANGE DROPDOWN
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

    /// DATE PICKER DROPDOWN
    const showDatePicker = () => {
        setShowTypeDropdown(false);
        setShowSortByDropdown(false);
        setShowDatePickerDropdown(true);
        setShowDateRangeDropdown(false);
    };

    const hideDatePicker = () => {
        setShowTypeDropdown(false);
        setShowSortByDropdown(false);
        setShowDatePickerDropdown(false);
        setShowDateRangeDropdown(false);
    };

    const submitDatePicker = (from, to) => {
        const startTimestamp = moment.unix(moment(from).unix()).startOf("day").unix();
        const endTimestamp = moment.unix(moment(to).unix()).endOf("day").unix();

        const query = `q=${searchQuery}`;
        const page = "page=1";
        const _itemType = `itemType=${itemType}`;
        const _dateRange = `dateRange=custom`;
        const _startDate = `startDate=${startTimestamp}`;
        const _endDate = `endDate=${endTimestamp}`;
        const _sortBy = `sortBy=${sortBy}`;

        Router.push(`/search?${query}&${page}&${_itemType}&${_dateRange}&${_startDate}&${_endDate}&${_sortBy}`);
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
        } else if (dateRange === "custom") {
            if (startDate && endDate) {
                const startDateToDate = moment.unix(startDate).format("MMM Do YYYY");
                const endDateToDate = moment.unix(endDate).format("MMM Do YYYY");

                return (
                    <>
                        <span>{startDateToDate}</span>
                        <span>
                            <RightArrow />
                        </span>
                        <span>{endDateToDate}</span>
                    </>
                );
            } else {
                return "Custom Range";
            }
        } else {
            return "All Time";
        }
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
                                <Link href={createLinkForItemTypeButton("all")}>
                                    <a>
                                        <button>All</button>
                                    </a>
                                </Link>
                            </li>
                            <li>
                                <Link href={createLinkForItemTypeButton("item")}>
                                    <a>
                                        <button>Items</button>
                                    </a>
                                </Link>
                            </li>
                            <li>
                                <Link href={createLinkForItemTypeButton("comment")}>
                                    <a>
                                        <button>Comments</button>
                                    </a>
                                </Link>
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
                                    <Link href={createLinkForSortByButton("popularity")}>
                                        <a>
                                            <button>Popularity</button>
                                        </a>
                                    </Link>
                                </li>
                                <li>
                                    <Link href={createLinkForSortByButton("date")}>
                                        <a>
                                            <button>Date</button>
                                        </a>
                                    </Link>
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
                                    <Link href={createLinkForDateRangeButton("allTime")}>
                                        <a>
                                            <button>All Time</button>
                                        </a>
                                    </Link>
                                </li>
                                <li>
                                    <Link href={createLinkForDateRangeButton("last24h")}>
                                        <a>
                                            <button>Last 24h</button>
                                        </a>
                                    </Link>
                                </li>
                                <li>
                                    <Link href={createLinkForDateRangeButton("pastWeek")}>
                                        <a>
                                            <button>Past Week</button>
                                        </a>
                                    </Link>
                                </li>
                                <li>
                                    <Link href={createLinkForDateRangeButton("pastMonth")}>
                                        <a>
                                            <button>Past Month</button>
                                        </a>
                                    </Link>
                                </li>
                                <li>
                                    <Link href={createLinkForDateRangeButton("pastYear")}>
                                        <a>
                                            <button>Past Year</button>
                                        </a>
                                    </Link>
                                </li>
                                <li>
                                    <button onClick={() => showDatePicker()}>Custom Range</button>
                                </li>
                            </ul>
                        </div>
                        <DatePicker
                            elRef={datePickerDropdown}
                            show={showDatePickerDropdown}
                            hideDatePicker={hideDatePicker}
                            submitDatePicker={submitDatePicker}
                            startDate={startDate}
                            endDate={endDate}
                        />
                    </span>
                </span>
            </div>

            {/* PROCESSING TIME */}
            <div className="search-results-filters-stats">
                <span>{totalNumOfHits} results</span>
                <span className="search-results-filters-stats-time">({processingTimeMS * 0.001} seconds)</span>
            </div>
        </div>
    );
}
