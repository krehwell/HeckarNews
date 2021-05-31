export default function getNumberOfChildrenComments(comment, count) {
    count = count || 1;

    for (let i = 0; i < comment.children.length; i++) {
        count += 1;

        if (comment.children) {
            count = getNumberOfChildrenComments(comment.children[i], count);
        }
    }

    return count;
}
