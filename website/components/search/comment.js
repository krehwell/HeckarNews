import renderCreatedTime from "../../utils/renderCreatedTime.js";
import truncateItemTitle from "../../utils/truncateItemTitle.js";

export default function SearchCommentComponent({ comment }) {
    return (
        <div className="search-results-comment">
            <div className="search-results-comment-details">
                <span>
                    <a href={`/user?id=${comment.by}`}>{comment.by}</a>
                </span>
                <span className="search-results-comment-details-separator">|</span>
                <span>
                    <a href={`/comment?id=${comment.objectID}`}>{renderCreatedTime(comment.created)}</a>
                </span>
                <span className="search-results-comment-details-separator">|</span>
                <a href={comment.isParent ? `/item?id=${comment.parentItemId}` : `/comment?id=${comment.objectID}`}>
                    parent
                </a>
                <span className="search-results-comment-details-separator">|</span>
                <span>
                    on: <a href={`/item?id=${comment.parentItemId}`}>{truncateItemTitle(comment.parentItemTitle)}</a>
                </span>
            </div>
            <div className="search-results-comment-text">
                <span dangerouslySetInnerHTML={{ __html: comment.text }}></span>
            </div>
        </div>
    );
}
