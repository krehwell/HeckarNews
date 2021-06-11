import axios from "axios";

import apiBaseUrl from "../../utils/apiBaseUrl.js";

export default function killComment(commentId, callback) {
    axios
        .put(
            apiBaseUrl + "/moderation/kill-comment",
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
