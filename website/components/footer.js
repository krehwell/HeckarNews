import { useState } from "react";
import Link from "next/link";
import Router from "next/router";

export default function Footer({}) {
    const [searchInputValue, setSearchInputValue] = useState("");

    const updateSearchInputValue = (event) => {
        setSearchInputValue(event.target.value);
    };

    const listenForEnterKeyPress = (event) => {
        if (event.keyCode === 13 && searchInputValue) {
            // location.href = `/search?q=${searchInputValue}`;
            Router.push(`/search?q=${searchInputValue}`);
        }
    };

    return (
        <div className="footer-wrapper">
            <div className="footer-link-list">
                <div className="footer-link-list-item">
                    <Link href="/newsguidelines">Guidelines</Link>
                </div>
                <div className="footer-link-list-item">
                    <span>|</span>
                </div>
                <div className="footer-link-list-item">
                    <Link href="/newsfaq">FAQ</Link>
                </div>
                <div className="footer-link-list-item">
                    <span>|</span>
                </div>
                <div className="footer-link-list-item">
                    <Link href="https://github.com/krehwell">Contact</Link>
                </div>
            </div>

            <div className="footer-search">
                <span className="footer-search-label">Search:</span>
                <input
                    className="footer-search-input"
                    type="text"
                    value={searchInputValue}
                    onChange={updateSearchInputValue}
                    onKeyDown={listenForEnterKeyPress}
                />
            </div>

            <div className="footer-search">
                <span style={{ fontSize: "11px" }}>
                    made by <Link href="https://github.com/krehwell">me</Link> with ❤️
                </span>
            </div>
        </div>
    );
}
