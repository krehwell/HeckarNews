import axios from "axios";

import apiBaseUrl from "../../utils/apiBaseUrl.js";

export default function unvoteItem(itemId, callback) {
    axios
        .put(
            apiBaseUrl + "/items/unvote-item",
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
