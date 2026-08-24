import { getFirebaseStorage } from './firebase';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function setCors() {
  const bucketName = 'tamad-ce3c7.firebasestorage.app';
  const bucket = getFirebaseStorage().bucket(bucketName);
  
  await bucket.setCorsConfiguration([
    {
      origin: ['*'],
      responseHeader: ['*'],
      method: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD', 'OPTIONS'],
      maxAgeSeconds: 3600
    }
  ]);
  console.log('CORS configuration updated successfully for bucket:', bucketName);
}

setCors().catch(console.error);
