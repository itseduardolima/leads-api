import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(new ValidationPipe({ transform: true }))

  const config = new DocumentBuilder()
    .setTitle("Contact Form API")
    .setDescription("API for capturing contact form data from multiple websites")
    .setVersion("1.0")
    .addTag("contact-forms")
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("swagger", app, document)

  await app.listen(5000)
}
bootstrap()

