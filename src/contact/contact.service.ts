import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContactDto } from './dto/create-contact.dto';

import { Contact } from './entities/contact.entity';
import { FirebaseService } from '../firebase/firebase.service';
import { ContactResponseDto } from './dto/contact-response.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    private firebaseService: FirebaseService,
  ) {}

  async create(
    createContactDto: CreateContactDto,
    website: string,
  ): Promise<ContactResponseDto> {
    const contact = this.contactRepository.create({
      ...createContactDto,
      website,
    });
    await this.contactRepository.save(contact);

    await this.firebaseService.saveContact(createContactDto, website);

    return {
      success: true,
      message: 'Contact  submitted successfully',
      id: contact.id,
    };
  }
}
