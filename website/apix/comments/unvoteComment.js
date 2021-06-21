import axios from "axios";

import apiBaseUrl from "../../utils/apiBaseUrl.js";

export default function unvoteItem(commentId, callback) {
    axios
        .put(
            apiBaseUrl + "/comments/unvote-comment",
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
