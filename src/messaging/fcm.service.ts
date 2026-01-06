import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);
  private initialized = false;

  private init() {
    if (this.initialized) return;
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      this.initialized = true;
    } else {
      this.logger.warn('FCM not initialized: missing env FIREBASE_* variables');
    }
  }

  async sendDataMessage(token: string, data: Record<string, string>) {
    this.init();
    if (!this.initialized) return false;
    try {
      await admin.messaging().send({
        token,
        data,
      });
      return true;
    } catch (e) {
      this.logger.error(`FCM send error: ${e}`);
      return false;
    }
  }
}
