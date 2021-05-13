import axios from "axios";

import apiBaseUrl from "../../utils/apiBaseUrl.js";

export default async function getItemById(itemId, req) {
    try {
        const cookie = req.headers.cookie ? req.headers.cookie : "";

        const response = await axios({
            url: `${apiBaseUrl}/items/get-item-by-id?id=${itemId}`,
            headers: req ? { cookie: cookie } : "",
            withCredentials: true,
        });

        return response.data;
    } catch (error) {
        console.log("error is", error);
        return { getDataError: true };
    }
}
