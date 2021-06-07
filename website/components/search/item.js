import renderCreatedTime from "../../utils/renderCreatedTime.js";

export default function SearchItemComponent({ item }) {
    return (
        <div className="search-results-item">
            <div className="search-results-item-data">
                <div className="search-results-item-title-and-link">
                    <a className="search-results-item-title" href={`/item?id=${item.objectID}`}>
                        {item.title}
                    </a>
                    {item.url ? (
                        <a className="search-results-item-link" href={item.url}>
                            ({item.url})
                        </a>
                    ) : null}
                </div>
                <div className="search-results-item-details">
                    <span>
                        <a href={`/item?id=${item.objectID}`}>
                            {item.points.toLocaleString()} {item.points === 1 ? "point" : "points"}
                        </a>
                    </span>
                    <span className="search-results-item-details-separator">|</span>
                    <span>
                        <a href={`/user?id=${item.by}`}>{item.by}</a>
                    </span>
                    <span className="search-results-item-details-separator">|</span>
                    <span>
                        <a href={`/item?id=${item.objectID}`}>{renderCreatedTime(item.created)}</a>
                    </span>
                    <span className="search-results-item-details-separator">|</span>
                    <span>
                        <a href={`/item?id=${item.objectID}`}>{item.commentCount.toLocaleString()} comments</a>
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
