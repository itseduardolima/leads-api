import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpException,
  Logger,
  ConflictException,
} from "@nestjs/common"
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiBody, ApiQuery } from "@nestjs/swagger"
import { ContactService } from "./contact.service"
import { CreateContactDto } from "./dto/create-contact.dto"
import { ContactResponseDto } from "./dto/contact-response.dto"
import { ListContactQueryDto } from "./dto/list-contact-query.dto"
import { ContactData } from "../interfaces/contact-data.interface"
import { Pagination } from "nestjs-typeorm-paginate"

// Lista de sites permitidos
const ALLOWED_WEBSITES = ["allinsys", "bloodcasted", "passb2b", "abavsp"]

@ApiTags("contato")
@Controller("contact")
export class ContactController {
  private readonly logger = new Logger(ContactController.name)

  constructor(private readonly contactService: ContactService) {}

  @Post(":website")
  @ApiOperation({ summary: "Enviar um formulário de contato" })
  @ApiParam({
    name: "website",
    description: "Identificador do site (allinsys, bloodcasted, passb2b, abavsp)",
    example: "allinsys",
    enum: ALLOWED_WEBSITES,
  })
  @ApiBody({ type: CreateContactDto })
  @ApiResponse({
    status: 201,
    description: "O formulário de contato foi enviado com sucesso.",
    type: ContactResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Identificador de site inválido ou dados do formulário inválidos.",
  })
  @ApiResponse({
    status: 409,
    description: "Email ou telefone já cadastrado.",
  })
  @ApiResponse({ status: 500, description: "Erro interno do servidor." })
  async create(
    @Body() createContactDto: CreateContactDto,
    @Param('website') website: string,
  ): Promise<ContactResponseDto> {
    this.logger.log(`Recebida solicitação para criar contato para o site: ${website}`)

    if (!ALLOWED_WEBSITES.includes(website)) {
      this.logger.warn(`Tentativa de criar contato com site inválido: ${website}`)
      throw new HttpException(
        `Identificador de site inválido. Sites permitidos: ${ALLOWED_WEBSITES.join(", ")}`,
        HttpStatus.BAD_REQUEST,
      )
    }

    try {
      const result = await this.contactService.create(createContactDto, website)
      this.logger.log(`Contato criado com sucesso para o site ${website} com ID: ${result.id}`)
      return result
    } catch (error) {
      // Tratar erro de conflito (email ou telefone já existe)
      if (error instanceof ConflictException) {
        this.logger.warn(`Conflito ao criar contato: ${error.message}`)
        throw new HttpException(error.message, HttpStatus.CONFLICT)
      }

      this.logger.error(`Erro ao criar contato: ${error.message}`, error.stack)
      throw new HttpException("Falha ao salvar os dados do formulário de contato", HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Obter todos os contatos com paginação e filtragem',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página (começa em 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número de itens por página',
  })
  @ApiQuery({
    name: 'website',
    required: false,
    description: 'Filtrar por site',
    enum: ALLOWED_WEBSITES,
  })
  @ApiQuery({
    name: 'source',
    required: false,
    description: 'Filtrar por fonte',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Buscar por nome, e-mail ou nome da empresa',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filtrar por data inicial (formato ISO)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filtrar por data final (formato ISO)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de contatos',
  })
  async findAll(@Query() query: ListContactQueryDto): Promise<Pagination<ContactData>> {
    this.logger.log(`Recebida solicitação para listar contatos com parâmetros: ${JSON.stringify(query)}`);
    
    try {
      const result = await this.contactService.findAll(query);
      this.logger.log(`Listagem de contatos concluída. Total de itens: ${result.meta.totalItems}`);
      return result;
    } catch (error) {
      this.logger.error(`Erro ao listar contatos: ${error.message}`, error.stack);
      throw new HttpException('Falha ao buscar contatos', HttpStatus.INTERNAL_SERVER_ERROR);
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
  async findOne(@Param('id') id: string): Promise<ContactData> {
    this.logger.log(`Recebida solicitação para buscar contato com ID: ${id}`);

    try {
      const result = await this.contactService.findOne(id);
      this.logger.log(`Contato encontrado com ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar contato com ID ${id}: ${error.message}`,
      );
      throw error; // Já é um NotFoundException se o contato não for encontrado
    }
  }

  @Get('website/:website')
  @ApiOperation({ summary: 'Obter todos os contatos para um site específico' })
  @ApiParam({
    name: 'website',
    description:
      'Identificador do site (allinsys, bloodcasted, passb2b, abavsp)',
    example: 'allinsys',
    enum: ALLOWED_WEBSITES,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de contatos para o site',
    type: [ContactResponseDto],
  })
  async findByWebsite(@Param('website') website: string): Promise<ContactData[]> {
    this.logger.log(`Recebida solicitação para listar contatos do site: ${website}`);
    
    if (!ALLOWED_WEBSITES.includes(website)) {
      this.logger.warn(`Tentativa de listar contatos com site inválido: ${website}`);
      throw new HttpException(
        `Identificador de site inválido. Sites permitidos: ${ALLOWED_WEBSITES.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    
    try {
      const result = await this.contactService.findByWebsite(website);
      this.logger.log(`Listagem de contatos para o site ${website} concluída. Total: ${result.length}`);
      return result;
    } catch (error) {
      this.logger.error(`Erro ao listar contatos para o site ${website}: ${error.message}`, error.stack);
      throw new HttpException("Falha ao buscar contatos para o site", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
