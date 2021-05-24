/**
 * Dumb function just because how stupid english is
 * @param string
 * @returns string
 */
export default function renderPointsString(points) {
    if (points > 1 || points < -1 || !points) {
        return "points";
    } else {
        return "point";
    }
}
