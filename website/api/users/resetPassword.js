import axios from "axios";

import apiBaseUrl from "../../utils/apiBaseUrl.js";

export default function resetPassword(username, newPassword, resetToken, callback) {
    axios
        .put(apiBaseUrl + "/users/reset-password", {
            username: username,
            newPassword: newPassword,
            resetToken: resetToken,
        })
        .then(function (response) {
            callback(response.data);
        })
        .catch(function (error) {
            callback({ submitError: true });
        });
}
