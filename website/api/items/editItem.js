import axios from "axios";

import apiBaseUrl from "../../utils/apiBaseUrl.js";

export default function editItem(id, newItemTitle, newItemText, callback) {
    axios
        .put(
            apiBaseUrl + "/items/edit-item",
            {
                id: id,
                newItemTitle: newItemTitle,
                newItemText: newItemText,
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
