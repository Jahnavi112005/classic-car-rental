import Inquiry from '../models/Inquiry.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listToClient, toClient } from '../utils/format.js';

export const listInquiries = asyncHandler(async (_req, res) => {
  const inquiries = await Inquiry.find().sort({ createdAt: -1 });
  res.json(listToClient(inquiries));
});

export const createInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.create(req.body);
  res.status(201).json(toClient(inquiry));
});

export const updateInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!inquiry) {
    res.status(404);
    throw new Error('Inquiry not found');
  }

  res.json(toClient(inquiry));
});
