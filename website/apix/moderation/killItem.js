import axios from "axios";

import apiBaseUrl from "../../utils/apiBaseUrl.js";

export default function killItem(itemId, callback) {
    axios
        .put(
            apiBaseUrl + "/moderation/kill-item",
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
