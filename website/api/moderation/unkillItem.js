import axios from "axios";

import apiBaseUrl from "../../utils/apiBaseUrl.js";

export default function unkillItem(itemId, callback) {
    axios
        .put(
            apiBaseUrl + "/moderation/unkill-item",
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
