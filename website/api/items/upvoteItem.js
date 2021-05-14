import axios from "axios";

import apiBaseUrl from "../../utils/apiBaseUrl.js";

export default function upvoteItem(itemId, callback) {
    axios
        .post(
            apiBaseUrl + "/items/upvote-item",
            {
                id: itemId,
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
