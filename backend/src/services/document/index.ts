import fs from 'fs';
import path from 'path';
import os from 'os';
import { pipeline } from 'stream/promises';
import File from '../../models/File';
import { queueService } from '../queue';
import logger from '../../utils/logger';

const MIME_TYPE_MAP: Record<string, string> = {
  'image/png': 'image',
  'image/jpeg': 'image',
  'image/jpg': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'image/svg+xml': 'image',
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'doc',
  'text/csv': 'csv',
  'text/markdown': 'markdown',
  'text/plain': 'text',
  'text/html': 'html',
  'application/json': 'json',
};

export function getDocumentCategory(mimeType: string): string {
  return MIME_TYPE_MAP[mimeType] || 'other';
}

export function isPreviewable(mimeType: string): boolean {
  return ['image', 'pdf', 'text', 'markdown', 'csv'].includes(getDocumentCategory(mimeType));
}

export async function processDocumentUpload(
  fileId: string,
  workspaceId: string
): Promise<void> {
  try {
    const file = await File.findById(fileId);
    if (!file) {
      logger.error(`File ${fileId} not found for processing`);
      return;
    }

    const category = getDocumentCategory(file.mimeType);

    if (category === 'image' || category === 'pdf' || category === 'text' || category === 'markdown' || category === 'csv') {
      await queueService.addJob('file-processing', {
        action: 'extract-text',
        fileId: file._id.toString(),
        workspaceId,
        mimeType: file.mimeType,
      });
    }

    await queueService.addJob('vector-indexing', {
      entityType: 'document',
      entityId: file._id.toString(),
      text: `${file.originalName} ${file.mimeType}`,
      workspaceId,
    });

    logger.info(`Document ${file.originalName} queued for processing`);
  } catch (error) {
    logger.error(`Document processing failed for file ${fileId}:`, error);
  }
}

export async function extractTextFromFile(
  filePath: string,
  mimeType: string
): Promise<string> {
  try {
    if (mimeType.startsWith('text/') || mimeType === 'application/json' || mimeType === 'text/csv') {
      return fs.readFileSync(filePath, 'utf-8');
    }

    if (mimeType === 'application/pdf') {
      return '[PDF content - text extraction requires pdf-parse package]';
    }

    return '';
  } catch (error) {
    logger.error('Text extraction failed:', error);
    return '';
  }
}
