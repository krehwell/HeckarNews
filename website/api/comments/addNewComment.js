import axios from "axios";

import apiBaseUrl from "../../utils/apiBaseUrl.js";

export default function addNewComment(commentData, callback) {
    axios
        .post(
            apiBaseUrl + "/comments/add-new-comment",
            {
                commentData: commentData,
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
