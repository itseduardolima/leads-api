import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactResponseDto } from './dto/contact-response.dto';

// Lista de sites permitidos
const ALLOWED_WEBSITES = ['allinsys', 'bloodcasted', 'passb2b', 'abavsp'];

@ApiTags('contato')
@Controller('contact')
export class ContactController {
  private readonly logger = new Logger(ContactController.name);

  constructor(private readonly contactService: ContactService) {}

  @Post(':website')
  @ApiOperation({ summary: 'Enviar um formulário de contato' })
  @ApiParam({
    name: 'website',
    description:
      'Identificador do site (allinsys, bloodcasted, passb2b, abavsp)',
    example: 'allinsys',
    enum: ALLOWED_WEBSITES,
  })
  @ApiBody({ type: CreateContactDto })
  @ApiResponse({
    type: ContactResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Identificador de site inválido ou dados do formulário inválidos.',
  })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor.' })
  async create(
    @Body() createContactDto: CreateContactDto,
    @Param('website') website: string,
  ): Promise<ContactResponseDto> {
    this.logger.log(
      `Recebida solicitação para criar contato para o site: ${website}`,
    );

    if (!ALLOWED_WEBSITES.includes(website)) {
      this.logger.warn(
        `Tentativa de criar contato com site inválido: ${website}`,
      );
      throw new HttpException(
        `Identificador de site inválido. Sites permitidos: ${ALLOWED_WEBSITES.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.contactService.create(
        createContactDto,
        website,
      );
      this.logger.log(
        `Contato criado com sucesso para o site ${website} com ID: ${result.id}`,
      );
      return result;
    } catch (error) {
      this.logger.error(`Erro ao criar contato: ${error.message}`, error.stack);
      throw new HttpException(
        'Falha ao salvar os dados do formulário de contato',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Obter todos os contatos',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de contatos',
    type: [ContactResponseDto],
  })
  async findAll() {
    this.logger.log(`Recebida solicitação para listar todos os contatos`);

    try {
      const result = await this.contactService.findAll();
      this.logger.log(
        `Listagem de contatos concluída. Total: ${result.length}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Erro ao listar contatos: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        'Falha ao buscar contatos',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter um contato por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID do contato',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'O contato',
    type: ContactResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Contato não encontrado',
  })
  async findOne(@Param('id') id: string) {
    this.logger.log(`Recebida solicitação para buscar contato com ID: ${id}`);

    try {
      const result = await this.contactService.findOne(id);
      this.logger.log(`Contato encontrado com ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar contato com ID ${id}: ${error.message}`,
      );
      throw error; 
    }
  }

}
