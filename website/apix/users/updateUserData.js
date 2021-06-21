import axios from "axios";

import apiBaseUrl from "../../utils/apiBaseUrl.js";

export default function updateUserData(inputData, callback) {
    axios
        .put(
            apiBaseUrl + "/users/update-user-data",
            {
                inputData: inputData,
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
