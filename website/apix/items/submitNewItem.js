import axios from "axios";

import apiBaseUrl from "../../utils/apiBaseUrl.js";

export default function submitNewItem(title, url, text, callback) {
    axios
        .post(
            apiBaseUrl + "/items/submit-new-item",
            {
                title: title,
                url: url,
                text: text,
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
