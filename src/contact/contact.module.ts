import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ContactService } from "./contact.service"
import { ContactController } from "./contact.controller"
import { Contact } from "./entities/contact.entity"
import { FirebaseModule } from "../firebase/firebase.module"

@Module({
  imports: [TypeOrmModule.forFeature([Contact]), FirebaseModule],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}

