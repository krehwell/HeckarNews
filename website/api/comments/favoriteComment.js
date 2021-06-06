import axios from "axios";

import apiBaseUrl from "../../utils/apiBaseUrl.js";

export default function favoriteComment(commentId, callback) {
    axios
        .post(
            apiBaseUrl + "/comments/favorite-comment",
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
            // console.log("ERR", error);
            callback({ submitError: true });
        });
}
