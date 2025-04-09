import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContactDto } from './dto/create-contact.dto';
import { Contact } from './entities/contact.entity';
import { FirebaseService } from '../firebase/firebase.service';
import { ContactResponseDto } from './dto/contact-response.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    private firebaseService: FirebaseService,
  ) {}

  async create(
    createContactDto: CreateContactDto,
    website: string,
  ): Promise<ContactResponseDto> {
    try {
      this.logger.log(`Criando contato para o site ${website}`);

      // Salvar no Firebase
      const firebaseResult = await this.firebaseService.saveContactForm(
        createContactDto,
        website,
      );

      return {
        success: true,
        message: 'Formulário de contato enviado com sucesso',
        id: firebaseResult.id,
      };
    } catch (error) {
      this.logger.error(`Erro ao criar contato: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll() {
    try {
      this.logger.log(`Buscando todos os contatos`);

      // Buscar do Firebase
      const contacts = await this.firebaseService.getAllContacts();

      this.logger.log(`Encontrados ${contacts.length} contatos`);
      return contacts;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar contatos: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      this.logger.log(`Buscando contato com ID: ${id}`);

      // Buscar do Firebase
      const contact = await this.firebaseService.getContactById(id);

      if (!contact) {
        this.logger.warn(`Contato com ID ${id} não encontrado`);
        throw new NotFoundException(`Contato com ID ${id} não encontrado`);
      }

      this.logger.log(`Contato encontrado com ID: ${id}`);
      return contact;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar contato: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
