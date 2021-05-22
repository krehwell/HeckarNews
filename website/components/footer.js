import { useState } from "react";
import Link from "next/link";

export default function Footer({}) {
    const [searchInputValue, setSearchInputValue] = useState("");

    const updateSearchInputValue = (event) => {
        setSearchInputValue(event.target.value);
    };

    const listenForEnterKeyPress = (event) => {
        if (event.keyCode === 13 && searchInputValue) {
            window.location.href = `/search?q=${searchInputValue}`;
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
                    <Link href="me@krehwell.com">Contact</Link>
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
        </div>
    );
}
