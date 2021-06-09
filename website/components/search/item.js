import Link from "next/link";

import renderCreatedTime from "../../utils/renderCreatedTime.js";

export default function SearchItemComponent({ item }) {
    return (
        <div className="search-results-item">
            <div className="search-results-item-data">
                <div className="search-results-item-title-and-link">
                    <Link href={`/item?id=${item.objectID}`}>
                        <a className="search-results-item-title">{item.title}</a>
                    </Link>
                    {item.url ? (
                        <Link href={item.url}>
                            <a className="search-results-item-link">({item.url})</a>
                        </Link>
                    ) : null}
                </div>
                <div className="search-results-item-details">
                    <span>
                        <Link href={`/item?id=${item.objectID}`}>
                            <a>
                                {item.points.toLocaleString()} {item.points === 1 ? "point" : "points"}
                            </a>
                        </Link>
                    </span>
                    <span className="search-results-item-details-separator">|</span>
                    <span>
                        <Link href={`/user?id=${item.by}`}>
                            <a>{item.by}</a>
                        </Link>
                    </span>
                    <span className="search-results-item-details-separator">|</span>
                    <span>
                        <Link href={`/item?id=${item.objectID}`}>
                            <a>{renderCreatedTime(item.created)}</a>
                        </Link>
                    </span>
                    <span className="search-results-item-details-separator">|</span>
                    <span>
                        <Link href={`/item?id=${item.objectID}`}>
                            <a>{item.commentCount.toLocaleString()} comments</a>
                        </Link>
                    </span>
                </div>
                {item.text ? (
                    <div className="search-results-item-text">
                        <span dangerouslySetInnerHTML={{ __html: item.text }}></span>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
