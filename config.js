module.exports = {
  jwtSecret: process.env.JWT_SECRET || "default_fallback_secret_key",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "default_refresh_secret_key"
};