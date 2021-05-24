/**
 * Ellipses the text if item title has more than 50 characters
 */
export default function truncateItemTitle(titleString) {
    if (titleString.length > 50) {
        return titleString.substring(0, 47) + "...";
    } else {
        return titleString;
    }
}
