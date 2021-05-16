import axios from "axios";

import apiBaseUrl from "../../utils/apiBaseUrl.js";

export default function unhideItem(itemId, callback) {
    axios
        .put(
            apiBaseUrl + "/items/unhide-item",
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
