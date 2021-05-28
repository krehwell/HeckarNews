import axios from "axios";

import apiBaseUrl from "../../utils/apiBaseUrl.js";

export default function unfavoriteComment(commentId, callback) {
    axios
        .put(
            apiBaseUrl + "/comments/unfavorite-comment",
            {
                id: commentId,
            },
            {
                withCredentials: true,
            }
        )
        .then(function (response) {
            callback(response.data);
        })
        .catch(function (error) {
            callback({ submitError: true });
        });
}
