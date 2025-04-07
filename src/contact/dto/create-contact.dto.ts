import { IsEmail, IsNotEmpty, IsString, IsOptional, MaxLength, IsEnum, IsUrl } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class CreateContactDto {
  @ApiProperty({
    description: "Full name of the contact",
    example: "John Doe",
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  fullName: string

  @ApiProperty({
    description: "Email address",
    example: "john.doe@example.com",
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty({
    description: "Phone number",
    example: "+5511999999999",
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiProperty({
    description: "Objective or purpose of the contact",
    example: "I want to know more about your services",
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  objective: string

  @ApiProperty({
    description: "How the contact found out about the service",
    enum: ["feira", "internet", "indicacao", "outros"],
    example: "internet",
    required: false,
  })
  @IsOptional()
  @IsEnum(["feira", "internet", "indicacao", "outros", "websites",])
  source?: "feira" | "internet" | "indicacao" | "outros" | "websites"

  @ApiProperty({
    description: "Location of the contact",
    example: "São Paulo, SP",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string

  @ApiProperty({
    description: "Additional feedback from the contact",
    example: "I found your website very informative",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  feedback?: string

  @ApiProperty({
    description: "Name of the business",
    example: "Acme Inc.",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  businessName?: string

  @ApiProperty({
    description: "LinkedIn profile URL",
    example: "https://www.linkedin.com/in/johndoe",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  linkedin?: string
}