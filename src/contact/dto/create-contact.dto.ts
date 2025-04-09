import { IsEmail, IsNotEmpty, IsString, IsOptional, MaxLength, IsEnum, IsUrl } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class CreateContactDto {
  @ApiProperty({
    description: "Nome completo do contato",
    example: "João Silva",
    required: true,
  })
  @IsNotEmpty({ message: "O nome completo é obrigatório" })
  @IsString({ message: "O nome completo deve ser uma string" })
  @MaxLength(100, { message: "O nome completo deve ter no máximo 100 caracteres" })
  fullName: string

  @ApiProperty({
    description: "Endereço de e-mail",
    example: "joao.silva@exemplo.com",
    required: true,
  })
  @IsNotEmpty({ message: "O e-mail é obrigatório" })
  @IsEmail({}, { message: "O e-mail deve ser um endereço válido" })
  email: string

  @ApiProperty({
    description: "Número de telefone",
    example: "+5511999999999",
    required: true,
  })
  @IsNotEmpty({ message: "O telefone é obrigatório" })
  @IsString({ message: "O telefone deve ser uma string" })
  phone: string

  @ApiProperty({
    description: "Objetivo ou propósito do contato",
    example: "Quero saber mais sobre seus serviços",
    required: true,
  })
  @IsNotEmpty({ message: "O objetivo é obrigatório" })
  @IsString({ message: "O objetivo deve ser uma string" })
  @MaxLength(500, { message: "O objetivo deve ter no máximo 500 caracteres" })
  objective: string

  @ApiProperty({
    description: "Como o contato conheceu o serviço",
    enum: ["feira", "internet", "indicacao", "outros", "websites"],
    example: "internet",
    required: false,
  })
  @IsOptional()
  @IsEnum(["feira", "internet", "indicacao", "outros", "websites"], {
    message: "A fonte deve ser uma das opções: feira, internet, indicacao, outros ou websites",
  })
  source?: "feira" | "internet" | "indicacao" | "outros" | "websites"

  @ApiProperty({
    description: "Localização do contato",
    example: "São Paulo, SP",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "A localização deve ser uma string" })
  @MaxLength(100, { message: "A localização deve ter no máximo 100 caracteres" })
  location?: string

  @ApiProperty({
    description: "Feedback adicional do contato",
    example: "Achei o site muito informativo",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "O feedback deve ser uma string" })
  @MaxLength(500, { message: "O feedback deve ter no máximo 500 caracteres" })
  feedback?: string

  @ApiProperty({
    description: "Nome da empresa",
    example: "Empresa Exemplo Ltda.",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "O nome da empresa deve ser uma string" })
  @MaxLength(100, { message: "O nome da empresa deve ter no máximo 100 caracteres" })
  businessName?: string

  @ApiProperty({
    description: "URL do perfil do LinkedIn",
    example: "https://www.linkedin.com/in/joaosilva",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "O LinkedIn deve ser uma string" })
  @IsUrl({}, { message: "O LinkedIn deve ser uma URL válida" })
  @MaxLength(255, { message: "O LinkedIn deve ter no máximo 255 caracteres" })
  linkedin?: string
}
