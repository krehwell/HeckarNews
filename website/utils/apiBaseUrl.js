let apiBaseUrl;

if (process.env.NODE_ENV === "development") {
    apiBaseUrl = process.env.DEVELOPMENT_API_URL;
} else {
    apiBaseUrl = process.env.PRODUCTION_API_URL;
}

export default apiBaseUrl;
