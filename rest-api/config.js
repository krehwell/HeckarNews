const config = {
    /// SITE CONFIGURATION
    productionWebsiteUrl: "https://forum.krehwell.com",

    /// SITE CONFIGURATION
    userCookieExpirationLengthInDays: 365,

    /// ITEM CONFIGURATION
    hrsUntilEditAndDeleteExpires: 24 * 30,
    maxAgeOfRankedItemsInDays: 360,
    itemsPerPage: 30,

    /// ITEM SCORE ALGORITHM CONFIGURATION
    scoreGravity: 1.8,
    updateScoreTimeScheduleInMinute: 10,

    /// VOTE CONFIGURATION
    minimumKarmaToDownvote: 0,
    hrsUntilUnvoteExpires: 24 * 30,

    /// COMMENT CONFIGURATION
    commentsPerPage: 30,

    /// MODERATION CONFIGURATION
    shadowBannedUsersPerPage: 250,
    bannedUsersPerPage: 250,
    moderationLogsPerPage: 250,
};

module.exports = config;
