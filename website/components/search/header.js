import { useState } from "react";
import Router from "next/router";

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
            <a className="search-header-logo" href="/search">
                <img src="/android-chrome-512x512.png" />
                <div className="search-header-logo-label">
                    <span>
                        Search <br />
                        HeckarNews
                    </span>
                </div>
            </a>

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
                        <a href="https://www.algolia.com">
                            <AlgoliaLogo />
                        </a>
                    </div>
                </div>
            ) : null}

            {/* SETTINGS BTN */}
            {showSettingsButton ? (
                <div className="search-header-settings">
                    <a href="/search/settings">
                        <SettingsIcon />
                        <span className="search-header-settings-label">Settings</span>
                    </a>
                </div>
            ) : null}

            {/* BACK BTN */}
            {showBackButton ? (
                <div className="search-header-back">
                    <a href="/search">
                        <LeftArrow />
                        Back
                    </a>
                </div>
            ) : null}
        </div>
    );
}
