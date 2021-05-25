import axios from "axios";

import apiBaseUrl from "../../utils/apiBaseUrl.js";

export default function downvoteComment(commentId, parentItemId, callback) {
    axios
        .post(
            apiBaseUrl + "/comments/downvote-comment",
            {
                id: commentId,
                parentItemId: parentItemId,
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
