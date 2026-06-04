const adminDashboardService = require('../services/adminDashboardService');

const sendError = (res, error) => {
  const statusCode = error.statusCode || error.status || 500;
  return res.status(statusCode).json({ message: error.message });
};

const getDashboardStats = async (req, res) => {
  try {
    const stats = await adminDashboardService.getAdminDashboardStats();
    res.status(200).json(stats);
  } catch (error) {
    sendError(res, error);
  }
};

module.exports = {
  getDashboardStats,
};