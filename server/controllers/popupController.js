import Popup from '../models/Popup.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listToClient, toClient } from '../utils/format.js';

async function disableOtherPopups(activeId) {
  await Popup.updateMany(
    { _id: { $ne: activeId }, isDeleted: false, enabled: true },
    { enabled: false }
  );
}

export const listPopups = asyncHandler(async (_req, res) => {
  const popups = await Popup.find({ isDeleted: false }).sort({ createdAt: -1 });
  res.json(listToClient(popups));
});

export const getActivePopup = asyncHandler(async (_req, res) => {
  const popup = await Popup.findOne({ enabled: true, isDeleted: false }).sort({ updatedAt: -1 });
  res.json(popup ? toClient(popup) : null);
});

export const createPopup = asyncHandler(async (req, res) => {
  const popup = await Popup.create({
    title: req.body.title,
    subtitle: req.body.subtitle || '',
    description: req.body.description || '',
    image: req.body.image || '',
    enabled: Boolean(req.body.enabled),
  });

  if (popup.enabled) {
    await disableOtherPopups(popup._id);
  }

  res.status(201).json(toClient(await Popup.findById(popup._id)));
});

export const updatePopup = asyncHandler(async (req, res) => {
  const popup = await Popup.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    {
      title: req.body.title,
      subtitle: req.body.subtitle || '',
      description: req.body.description || '',
      image: req.body.image || '',
      enabled: Boolean(req.body.enabled),
    },
    { new: true, runValidators: true }
  );

  if (!popup) {
    res.status(404);
    throw new Error('Popup not found');
  }

  if (popup.enabled) {
    await disableOtherPopups(popup._id);
  }

  res.json(toClient(await Popup.findById(popup._id)));
});

export const removePopup = asyncHandler(async (req, res) => {
  const popup = await Popup.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { enabled: false, isDeleted: true },
    { new: true }
  );

  if (!popup) {
    res.status(404);
    throw new Error('Popup not found');
  }

  res.status(204).end();
});
