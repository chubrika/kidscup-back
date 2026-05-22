import * as groupService from '../services/groupService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getGroups = asyncHandler(async (req, res) => {
  const groups = await groupService.getGroups(req.query);
  res.json(groups);
});

export const getGroupById = asyncHandler(async (req, res) => {
  const group = await groupService.getGroupById(req.params.id);
  res.json(group);
});

export const createGroup = asyncHandler(async (req, res) => {
  const group = await groupService.createGroup(req.body);
  res.status(201).json(group);
});

export const updateGroup = asyncHandler(async (req, res) => {
  const group = await groupService.updateGroup(req.params.id, req.body);
  res.json(group);
});

export const deleteGroup = asyncHandler(async (req, res) => {
  await groupService.deleteGroup(req.params.id);
  res.status(204).send();
});
