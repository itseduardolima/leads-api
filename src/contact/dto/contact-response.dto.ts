import { ApiProperty } from "@nestjs/swagger"

export class ContactResponseDto {
  @ApiProperty({
    description: "Indicates if the operation was successful",
    example: true,
  })
  success: boolean

  @ApiProperty({
    description: "Response message",
    example: "Contact form submitted successfully",
  })
  message: string

  @ApiProperty({
    description: "ID of the created contact form",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  id: string
}

