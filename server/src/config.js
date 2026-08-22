require('dotenv').config();

module.exports = {
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  openTripMapKey: process.env.OPENTRIPMAP_API_KEY || '',
  // 'static' = DB catalog only, 'dynamic' = live API only, 'hybrid' = DB + live top-up when DB is thin.
  activitySource: process.env.ACTIVITY_SOURCE || 'hybrid',
};
