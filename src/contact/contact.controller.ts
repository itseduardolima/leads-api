import {
  Controller,
  Post,
  Body,
  Param,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import  { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post(':website')
  @ApiOperation({ summary: 'Submit a contact ' })
  @ApiParam({
    name: 'website',
    description: 'Website identifier (allinsys or passb2b)',
    enum: ['allinsys', 'passb2b', 'abavsp', 'bloodcated'],
    example: 'allinys',
  })
  @ApiBody({ type: CreateContactDto })
  @ApiResponse({
    status: 201,
    description: 'The contact  has been successfully submitted.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid website identifier or  data.',
  })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async create(
    @Body() createContactDto: CreateContactDto,
    @Param('website') website: string,
  ) {
    if (website !== 'allinsys' && website !== 'passb2b') {
      throw new HttpException(
        'Invalid website identifier',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return await this.contactService.create(
        createContactDto,
        website,
      );
    } catch (error) {
      throw new HttpException(
        'Failed to save contact  data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
