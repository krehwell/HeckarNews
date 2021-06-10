import Link from "next/link";
import Highlighter from "react-highlight-words";

import renderCreatedTime from "../../utils/renderCreatedTime.js";

export default function SearchItemComponent({ item, searchQuery }) {
    const highlightText = (text) => {
        return (
            <Highlighter
                searchWords={searchQuery ? searchQuery.trim().split(" ") : [""]}
                textToHighlight={text}
                highlightClassName="search-highlighted-text"
            />
        );
    };

    const renderItemFormattedText = (item) => {
        let textToRender;

        if (item._highlightResult && item._highlightResult.text.matchedWords.length) {
            textToRender = item._highlightResult.text.value;
        } else {
            textToRender = item.text;
        }

        return <span dangerouslySetInnerHTML={{ __html: textToRender }}></span>;
    };

    return (
        <div className="search-results-item">
            <div className="search-results-item-data">
                <div className="search-results-item-title-and-link">
                    <Link href={`/item?id=${item.objectID}`}>
                        <a className="search-results-item-title">{highlightText(item.title)}</a>
                    </Link>
                    {item.url ? (
                        <Link href={item.url}>
                            <a className="search-results-item-link">({highlightText(item.url)})</a>
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
                            <a>{highlightText(item.by)}</a>
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
                    <div className="search-results-item-text">{renderItemFormattedText(item)}</div>
                ) : null}
            </div>
        </div>
    );
}
