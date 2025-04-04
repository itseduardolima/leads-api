import { Injectable, type OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import  { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private db: admin.firestore.Firestore;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');

    let privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');
    if (privateKey) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    const serviceAccount = {
      projectId,
      clientEmail,
      privateKey,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });

    this.db = admin.firestore();
  }

  async saveContact(data: any, website: string) {
    try {
      const contactFormsRef = this.db.collection('contactForms');
      const result = await contactFormsRef.add({
        ...data,
        website,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { id: result.id };
    } catch (error) {
      throw error;
    }
  }
}
