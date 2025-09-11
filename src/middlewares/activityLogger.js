const ActivityLog = require('../models/activityLog');

exports.logLoginActivity = async ({ userId, req, statusCode, responseMessage, describtion }) => {
  try {
    await ActivityLog.create({
        userId,
        actionType: 'LOGIN',
        action: 'User logged in',
        method: req?.method,
        endpoint: req?.originalUrl,
        requestBody: req?.body,
        queryParams: req?.query,
        statusCode,
        responseMessage,
        describtion: describtion,
        ipAddress: req?.ip
    });
  } catch (err) {
    console.error('Failed to save login activity log:', err.message);
  }
};


exports.logUserAction = async ({ req, action, statusCode, responseMessage, describtion }) => {
  const userId = req?.user?.userId;
  if (!userId) {
    return;
  }

  try {
    await ActivityLog.create({
        userId,
        actionType: 'ACTION',
        action,
        method: req.method,
        endpoint: req.originalUrl,
        requestBody: req.body,
        queryParams: req.query,
        statusCode,
        describtion: describtion,
        responseMessage,
        ipAddress: req.ip
    });
  } catch (err) {
    console.error('Failed to save user action log:', err.message);
  }
};