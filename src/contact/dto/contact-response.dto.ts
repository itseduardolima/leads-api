import { ApiProperty } from "@nestjs/swagger"

export class ContactResponseDto {
  @ApiProperty()
  success: boolean

  @ApiProperty()
  message: string

  @ApiProperty()
  id: string
}
