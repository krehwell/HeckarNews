export default function sortCommentChildren(children) {
    if (children) {
        return children.sort(function (a, b) {
            if (a.points > b.points) return -1;
            if (a.points < b.points) return 1;

            if (a.created > b.created) return -1;
            if (a.created < b.created) return 1;
        });
    }
}
