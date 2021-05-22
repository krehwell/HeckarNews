const config = {
    productionWebsiteUrl: "https://news.krehwell.com",

    /// SITE CONFIGURATION
    userCookieExpirationLengthInDays: 365,

    /// ITEM CONFIGURATION
    hrsUntilUnvoteExpires: 24 * 30,
    hrsUntilEditAndDeleteExpires: 24 * 30,
    maxAgeOfRankedItemsInDays: 360,
    itemsPerPage: 30,

    /// ITEM SCORE ALGORITHM CONFIGURATION
    scoreGravity: 1.8,
    updateScoreTimeScheduleInMinute: 10
};

module.exports = config;
