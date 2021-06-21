import axios from "axios";

import apiBaseUrl from "../../utils/apiBaseUrl.js";

export default function deleteItem(id, callback) {
    axios
        .put(
            apiBaseUrl + "/items/delete-item",
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
