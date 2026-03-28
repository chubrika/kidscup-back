import * as dashboardService from '../services/dashboardService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getAdminDashboardStats();
  res.json(stats);
});

export const getCharts = asyncHandler(async (req, res) => {
  const charts = await dashboardService.getAdminChartsData();
  res.json(charts);
});

export const getActivity = asyncHandler(async (req, res) => {
  const activity = await dashboardService.getAdminActivityFeed();
  res.json(activity);
});
