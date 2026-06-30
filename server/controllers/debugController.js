import fs from 'fs';
import { debugPdfConversion } from '../services/identityVerificationService.js';

export const uploadPdfDebug = async (req, res, next) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file uploaded' });
    return;
  }

  const localPath = req.file.path;
  const conversion = await debugPdfConversion(localPath).catch(err => ({ ok: false, error: err.message || String(err) }));

  const response = {
    success: conversion?.ok === true,
    generatedImages: conversion?.imagePaths || [],
    stderr: conversion?.poppler?.stderr || null,
    stdout: conversion?.poppler?.stdout || null,
    command: conversion?.poppler?.command || null,
    exitCode: conversion?.poppler?.exitCode || null,
    reason: conversion?.reason || (conversion?.error ? String(conversion.error) : null),
  };

  res.status(conversion?.ok ? 200 : 500).json(response);
};
