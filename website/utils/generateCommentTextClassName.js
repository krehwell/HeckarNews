/**
 * @returns string: className of the faded text
 */
export default function generateCommentTextClassName(points) {
    if (points === -1) {
        return "comment-section-comment-text faded-level-1";
    } else if (points === -2) {
        return "comment-section-comment-text faded-level-2";
    } else if (points === -3) {
        return "comment-section-comment-text faded-level-3";
    } else if (points === -4) {
        return "comment-section-comment-text faded-level-4";
    } else {
        return "comment-section-comment-text";
    }
}
