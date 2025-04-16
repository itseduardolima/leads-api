import { ApiProperty } from "@nestjs/swagger"
import { IsOptional, IsString, IsInt, Min, Max } from "class-validator"
import { Type } from "class-transformer"

export class ListContactQueryDto {
  @ApiProperty({
    description: "Número da página (começa em 1)",
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "A página deve ser um número inteiro" })
  @Min(1, { message: "A página deve ser maior ou igual a 1" })
  page?: number = 1

  @ApiProperty({
    description: "Número de itens por página",
    example: 10,
    required: false,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "O limite deve ser um número inteiro" })
  @Min(1, { message: "O limite deve ser maior ou igual a 1" })
  @Max(100, { message: "O limite deve ser menor ou igual a 100" })
  limit?: number = 10

  @ApiProperty({
    description: "Buscar por nome, e-mail ou nome da empresa",
    example: "joão",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "A busca deve ser uma string" })
  search?: string

 
}
