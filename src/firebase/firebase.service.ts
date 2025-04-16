import { Injectable, type OnModuleInit, Logger, ConflictException } from "@nestjs/common"
import * as admin from "firebase-admin"
import { ConfigService } from "@nestjs/config"
import { IPaginationOptions, Pagination } from "nestjs-typeorm-paginate"
import { ContactData } from "../interfaces/contact-data.interface"

@Injectable()
export class FirebaseService implements OnModuleInit {
  private db: admin.firestore.Firestore
  private readonly logger = new Logger(FirebaseService.name)
  private readonly collectionName = "contactForms"

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    try {
      const projectId = this.configService.get<string>("FIREBASE_PROJECT_ID")
      const clientEmail = this.configService.get<string>("FIREBASE_CLIENT_EMAIL")
      let privateKey = this.configService.get<string>("FIREBASE_PRIVATE_KEY")

      if (!projectId || !clientEmail || !privateKey) {
        this.logger.error("Configurações do Firebase incompletas. Verifique as variáveis de ambiente.")
        throw new Error("Configurações do Firebase incompletas")
      }

      // Substituir os caracteres de escape \\n por quebras de linha reais
      if (privateKey) {
        privateKey = privateKey.replace(/\\n/g, "\n")
      }

      const serviceAccount = {
        projectId,
        clientEmail,
        privateKey,
      }

      // Inicializar o Firebase apenas se ainda não estiver inicializado
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        })
        this.logger.log("Firebase inicializado com sucesso")
      }

      this.db = admin.firestore()
    } catch (error) {
      this.logger.error(`Erro ao inicializar o Firebase: ${error.message}`, error.stack)
      throw error
    }
  }

  /**
   * Verifica se um email ou telefone já existe na coleção
   * @param email Email a ser verificado
   * @param phone Telefone a ser verificado
   * @returns Um objeto indicando se o email ou telefone já existe
   */
  async checkDuplicates(email: string, phone?: string): Promise<{ exists: boolean; field: string; value: string }> {
    try {
      this.logger.log(`Verificando duplicatas para email: ${email} e telefone: ${phone || "não fornecido"}`)

      // Verificar se o email já existe
      const emailSnapshot = await this.db.collection(this.collectionName).where("email", "==", email).limit(1).get()

      if (!emailSnapshot.empty) {
        this.logger.warn(`Email ${email} já existe no banco de dados`)
        return { exists: true, field: "email", value: email }
      }

      // Verificar se o telefone já existe (se fornecido)
      if (phone) {
        const phoneSnapshot = await this.db.collection(this.collectionName).where("phone", "==", phone).limit(1).get()

        if (!phoneSnapshot.empty) {
          this.logger.warn(`Telefone ${phone} já existe no banco de dados`)
          return { exists: true, field: "phone", value: phone }
        }
      }

      this.logger.log("Nenhuma duplicata encontrada")
      return { exists: false, field: "", value: "" }
    } catch (error) {
      this.logger.error(`Erro ao verificar duplicatas: ${error.message}`, error.stack)
      throw error
    }
  }

  /**
   * Salva um novo formulário de contato no Firestore
   */
  async saveContactForm(data: any, website: string) {
    try {
      this.logger.log(`Salvando formulário de contato para o site ${website}`)

      // Verificar duplicatas antes de salvar
      const { exists, field, value } = await this.checkDuplicates(data.email, data.phone)

      if (exists) {
        throw new ConflictException(`O ${field} '${value}' já está cadastrado!`)
      }

      const contactFormsRef = this.db.collection(this.collectionName)
      const result = await contactFormsRef.add({
        ...data,
        website,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      this.logger.log(`Formulário de contato salvo com ID: ${result.id}`)

      return { id: result.id }
    } catch (error) {
      this.logger.error(`Erro ao salvar formulário de contato: ${error.message}`, error.stack)
      throw error
    }
  }

  /**
   * Busca um contato pelo ID
   */
  async getContactById(id: string): Promise<ContactData | null> {
    try {
      this.logger.log(`Buscando contato com ID: ${id}`)

      const docRef = this.db.collection(this.collectionName).doc(id)
      const doc = await docRef.get()

      if (!doc.exists) {
        this.logger.warn(`Contato com ID ${id} não encontrado`)
        return null
      }

      const data = doc.data()

      // Verificar se data não é undefined
      if (!data) {
        this.logger.warn(`Dados do contato com ID ${id} estão vazios`)
        return null
      }

      // Converter o timestamp do Firestore para Date
      const createdAt = data.createdAt ? data.createdAt.toDate() : new Date()

      return {
        id: doc.id,
        ...data,
        createdAt,
      } as ContactData
    } catch (error) {
      this.logger.error(`Erro ao buscar contato por ID: ${error.message}`, error.stack)
      throw error
    }
  }

  /**
   * Busca contatos com paginação
   */
  async paginate(options: IPaginationOptions, filters?: any): Promise<Pagination<ContactData>> {
    try {
      // Garantir que page e limit sejam números
      const page = Number(options.page || 1)
      const limit = Number(options.limit || 10)
      const route = options.route || "/contact"

      this.logger.log(`Buscando contatos com paginação: página ${page}, limite ${limit}`)

      if (filters) {
        this.logger.log(`Filtros aplicados: ${JSON.stringify(filters)}`)
      }

      // Obter referência à coleção
      const collectionRef = this.db.collection(this.collectionName)

      // Iniciar com a coleção base
      let firestoreQuery: admin.firestore.Query = collectionRef

      // Aplicar filtros
      if (filters?.website) {
        firestoreQuery = firestoreQuery.where("website", "==", filters.website)
      }

      if (filters?.source) {
        firestoreQuery = firestoreQuery.where("source", "==", filters.source)
      }

      // Ordenar por data de criação (mais recente primeiro)
      firestoreQuery = firestoreQuery.orderBy("createdAt", "desc")

      // Executar a consulta
      const snapshot = await firestoreQuery.get()

      // Converter os documentos para objetos
      let items: ContactData[] = snapshot.docs.map((doc) => {
        const data = doc.data()
        const createdAt = data.createdAt ? data.createdAt.toDate() : new Date()

        return {
          id: doc.id,
          ...data,
          createdAt,
        } as ContactData
      })

      // Aplicar filtros adicionais em memória
      if (filters?.search) {
        const search = filters.search.toLowerCase()
        items = items.filter(
          (item) =>
            (item.fullName && item.fullName.toLowerCase().includes(search)) ||
            (item.email && item.email.toLowerCase().includes(search)) ||
            (item.businessName && item.businessName.toLowerCase().includes(search)),
        )
      }

      if (filters?.startDate) {
        const startDate = new Date(filters.startDate)
        items = items.filter((item) => item.createdAt >= startDate)
      }

      if (filters?.endDate) {
        const endDate = new Date(filters.endDate)
        items = items.filter((item) => item.createdAt <= endDate)
      }

      // Calcular total de itens após filtragem
      const totalItems = items.length

      // Calcular total de páginas
      const totalPages = Math.ceil(totalItems / limit)

      // Aplicar paginação
      const startIndex = (page - 1) * limit
      const endIndex = page * limit
      const paginatedItems = items.slice(startIndex, endIndex)

      this.logger.log(`Total de itens: ${totalItems}, Total de páginas: ${totalPages}`)
      this.logger.log(`Retornando ${paginatedItems.length} itens para a página ${page}`)

      // Construir links de paginação
      const createUrl = (page: number): string => {
        return `${route}?page=${page}&limit=${limit}${
          filters?.website ? `&website=${filters.website}` : ""
        }${filters?.source ? `&source=${filters.source}` : ""}${filters?.search ? `&search=${filters.search}` : ""}`
      }

      // Construir objeto de paginação no formato esperado
      const pagination: Pagination<ContactData> = {
        items: paginatedItems,
        meta: {
          totalItems,
          itemCount: paginatedItems.length,
          itemsPerPage: limit,
          totalPages,
          currentPage: page,
        },
        links: {
          first: page > 1 ? createUrl(1) : "",
          previous: page > 1 ? createUrl(page - 1) : "",
          next: page < totalPages ? createUrl(page + 1) : "",
          last: page < totalPages ? createUrl(totalPages) : "",
        },
      }

      return pagination
    } catch (error) {
      this.logger.error(`Erro ao buscar contatos paginados: ${error.message}`, error.stack)
      throw error
    }
  }

  /**
   * Busca todos os contatos para um site específico
   */
  async getContactsByWebsite(website: string): Promise<ContactData[]> {
    try {
      this.logger.log(`Buscando contatos para o site: ${website}`)

      const querySnapshot = await this.db
        .collection(this.collectionName)
        .where("website", "==", website)
        .orderBy("createdAt", "desc")
        .get()

      const contacts: ContactData[] = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        // Converter o timestamp do Firestore para Date
        const createdAt = data.createdAt ? data.createdAt.toDate() : new Date()

        return {
          id: doc.id,
          ...data,
          createdAt,
        } as ContactData
      })

      this.logger.log(`Encontrados ${contacts.length} contatos para o site ${website}`)

      return contacts
    } catch (error) {
      this.logger.error(`Erro ao buscar contatos por site: ${error.message}`, error.stack)
      throw error
    }
  }
}
