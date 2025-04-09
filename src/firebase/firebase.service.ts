import { Injectable, type OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private db: admin.firestore.Firestore;
  private readonly logger = new Logger(FirebaseService.name);
  private readonly collectionName = 'contactForms';

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    try {
      const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
      const clientEmail = this.configService.get<string>(
        'FIREBASE_CLIENT_EMAIL',
      );
      let privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

      if (!projectId || !clientEmail || !privateKey) {
        this.logger.error(
          'Configurações do Firebase incompletas. Verifique as variáveis de ambiente.',
        );
        throw new Error('Configurações do Firebase incompletas');
      }

      // Substituir os caracteres de escape \\n por quebras de linha reais
      if (privateKey) {
        privateKey = privateKey.replace(/\\n/g, '\n');
      }

      const serviceAccount = {
        projectId,
        clientEmail,
        privateKey,
      };

      // Inicializar o Firebase apenas se ainda não estiver inicializado
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(
            serviceAccount as admin.ServiceAccount,
          ),
        });
        this.logger.log('Firebase inicializado com sucesso');
      }

      this.db = admin.firestore();
    } catch (error) {
      this.logger.error(
        `Erro ao inicializar o Firebase: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Salva um novo formulário de contato no Firestore
   */
  async saveContactForm(data: any, website: string) {
    try {
      this.logger.log(`Salvando formulário de contato para o site ${website}`);

      const contactFormsRef = this.db.collection(this.collectionName);
      const result = await contactFormsRef.add({
        ...data,
        website,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      this.logger.log(`Formulário de contato salvo com ID: ${result.id}`);

      return { id: result.id };
    } catch (error) {
      this.logger.error(
        `Erro ao salvar formulário de contato: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Busca um contato pelo ID
   */
  async getContactById(id: string) {
    try {
      this.logger.log(`Buscando contato com ID: ${id}`);

      const docRef = this.db.collection(this.collectionName).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        this.logger.warn(`Contato com ID ${id} não encontrado`);
        return null;
      }

      const data = doc.data();

      // Verificar se data não é undefined
      if (!data) {
        this.logger.warn(`Dados do contato com ID ${id} estão vazios`);
        return null;
      }

      // Converter o timestamp do Firestore para Date
      const createdAt = data.createdAt ? data.createdAt.toDate() : new Date();

      return {
        id: doc.id,
        ...data,
        createdAt,
      };
    } catch (error) {
      this.logger.error(
        `Erro ao buscar contato por ID: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Busca todos os contatos
   */
  async getAllContacts() {
    try {
      this.logger.log('Buscando todos os contatos');

      const querySnapshot = await this.db
        .collection(this.collectionName)
        .orderBy('createdAt', 'desc')
        .get();

      const contacts = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        // Converter o timestamp do Firestore para Date
        const createdAt = data.createdAt ? data.createdAt.toDate() : new Date();

        return {
          id: doc.id,
          ...data,
          createdAt,
        };
      });

      this.logger.log(`Encontrados ${contacts.length} contatos no total`);

      return contacts;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar todos os contatos: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
