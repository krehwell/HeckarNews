import moment from "moment";

export default function renderCreatedTime(timestamp) {
    const secondsSinceCreated = moment().unix() - timestamp;

    if (secondsSinceCreated < 60) {
        const labelString = secondsSinceCreated > 1 ? " seconds ago" : " second ago";

        return <span>{secondsSinceCreated + labelString}</span>;
    } else if (secondsSinceCreated < 3600) {
        const labelString = Math.floor(secondsSinceCreated / 60) > 1 ? " minutes ago" : " minute ago";

        return <span>{Math.floor(secondsSinceCreated / 60) + labelString}</span>;
    } else if (secondsSinceCreated < 86400) {
        const labelString = Math.floor(secondsSinceCreated / 3600) > 1 ? " hours ago" : " hour ago";

        return <span>{Math.floor(secondsSinceCreated / 3600) + labelString}</span>;
    } else if (secondsSinceCreated < 86400 * 365) {
        const labelString = Math.floor(secondsSinceCreated / 86400) > 1 ? " days ago" : " day ago";

        return <span>{Math.floor(secondsSinceCreated / 86400) + labelString}</span>;
    } else {
        return <span>{"on " + moment.unix(timestamp).format("MMM D, YYYY") + ""}</span>;
    }
}
