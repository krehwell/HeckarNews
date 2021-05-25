import axios from "axios";

import apiBaseUrl from "../../utils/apiBaseUrl.js";

export default function upvoteComment(commentId, parentItemId, callback) {
    axios
        .post(
            apiBaseUrl + "/comments/upvote-comment",
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
