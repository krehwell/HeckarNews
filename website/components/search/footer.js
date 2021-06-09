import Link from "next/link";

export default function SearchFooter({}) {
    return (
        <div className="search-footer">
            <ul>
                <li>
                    <Link href="/search/about">
                        <a>About</a>
                    </Link>
                </li>
                <li>•</li>
                <li>
                    <Link href="/search/settings">
                        <a>Settings</a>
                    </Link>
                </li>
                <li>•</li>
                <li>
                    <Link href="/">
                        <a>HeckarNews</a>
                    </Link>
                </li>
            </ul>
        </div>
    );
}
