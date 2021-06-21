import axios from "axios";

import apiBaseUrl from "../../utils/apiBaseUrl.js";

export default async function getEditItemPageData(itemId, req) {
    try {
        const cookie = req.headers.cookie ? req.headers.cookie : "";

        const response = await axios({
            url: `${apiBaseUrl}/items/get-edit-item-page-data?id=${itemId}`,
            headers: req ? { cookie: cookie } : "",
            withCredentials: true,
        });

        return response.data;
    } catch (error) {
        return { getDataError: true };
    }
}
