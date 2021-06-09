import Link from "next/link";

import renderCreatedTime from "../../utils/renderCreatedTime.js";
import truncateItemTitle from "../../utils/truncateItemTitle.js";

export default function SearchCommentComponent({ comment }) {
    return (
        <div className="search-results-comment">
            <div className="search-results-comment-details">
                <span>
                    <Link href={`/user?id=${comment.by}`}>
                        <a>{comment.by}</a>
                    </Link>
                </span>
                <span className="search-results-comment-details-separator">|</span>
                <span>
                    <Link href={`/comment?id=${comment.objectID}`}>
                        <a>{renderCreatedTime(comment.created)}</a>
                    </Link>
                </span>
                <span className="search-results-comment-details-separator">|</span>
                <Link href={comment.isParent ? `/item?id=${comment.parentItemId}` : `/comment?id=${comment.objectID}`}>
                    <a>parent</a>
                </Link>
                <span className="search-results-comment-details-separator">|</span>
                <span>
                    on:&nbsp;
                    <Link href={`/item?id=${comment.parentItemId}`}>
                        <a>{truncateItemTitle(comment.parentItemTitle)}</a>
                    </Link>
                </span>
            </div>
            <div className="search-results-comment-text">
                <span dangerouslySetInnerHTML={{ __html: comment.text }}></span>
            </div>
        </div>
    );
}
