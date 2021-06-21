import axios from "axios";

import apiBaseUrl from "../../utils/apiBaseUrl.js";

export default function deleteComment(id, callback) {
    axios
        .put(
            apiBaseUrl + "/comments/delete-comment",
            {
                id: id,
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
