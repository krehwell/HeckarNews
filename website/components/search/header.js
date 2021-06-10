import { useState } from "react";
import Router from "next/router";
import Link from "next/link";

import SearchBarIcon from "./svg/searchBarIcon.js";
import AlgoliaLogo from "./svg/algoliaLogo.js";
import SettingsIcon from "./svg/settingsIcon.js";
import LeftArrow from "./svg/leftArrow.js";

export default function SearchPageHeader({
    showSearchBar,
    searchQuery,
    showSettingsButton,
    showBackButton,
    currPageNumber,
    itemType,
    dateRange,
    startDate,
    endDate,
    sortBy,
}) {
    const [searchInputValue, setSearchInputValue] = useState(searchQuery ? searchQuery : "");

    const updateSearchInputValue = (event) => {
        setSearchInputValue(event.target.value);
    };

    const checkForEnterKeypress = (event) => {
        if (event.keyCode === 13 || event.which === 13) {
            submitSearchInputRequest(event.target.value);
        }
    };

    const submitSearchInputRequest = (inputValue) => {
        const query = `q=${inputValue}`;

        const page = `page=1`;
        const q_itemType = `itemType=${itemType}`;
        const q_dateRange = `dateRange=${dateRange}`;
        const q_startDate = `startDate=${startDate}`;
        const q_endDate = `endDate=${endDate}`;
        const q_sortBy = `sortBy=${sortBy}`;

        Router.push(`/search?${query}&${page}&${q_itemType}&${q_dateRange}&${q_startDate}&${q_endDate}&${q_sortBy}`);
    };

    return (
        <div className="search-header">
            <Link href="/">
                <a className="search-header-logo">
                    <img src="/android-chrome-512x512.png" />
                    <div className="search-header-logo-label">
                        <span>
                            <b>
                                Search <br />
                                HeckarNews
                            </b>
                        </span>
                    </div>
                </a>
            </Link>

            {/* SEARCH BAR */}
            {showSearchBar ? (
                <div className="search-header-bar">
                    <span className="search-header-bar-icon">
                        <SearchBarIcon />
                    </span>
                    <input
                        type="search"
                        placeholder="Search stories by title, url, or author"
                        value={searchInputValue}
                        onChange={updateSearchInputValue}
                        onKeyUp={checkForEnterKeypress}
                    />
                    <div className="search-header-bar-powered-by">
                        <span className="search-header-bar-powered-by-label">Search by</span>
                        <Link href="https://www.algolia.com">
                            <a>
                                <AlgoliaLogo />
                            </a>
                        </Link>
                    </div>
                </div>
            ) : null}

            {/* SETTINGS BTN */}
            {showSettingsButton ? (
                <div className="search-header-settings" style={{ cursor: "not-allowed", pointerEvents: "none" }}>
                    <Link href="/search/settings">
                        <a>
                            <SettingsIcon />
                            <span className="search-header-settings-label">Settings</span>
                        </a>
                    </Link>
                </div>
            ) : null}

            {/* BACK BTN */}
            {showBackButton ? (
                <div className="search-header-back">
                    <Link href="/search">
                        <a>
                            <LeftArrow />
                            Back
                        </a>
                    </Link>
                </div>
            ) : null}
        </div>
    );
}
