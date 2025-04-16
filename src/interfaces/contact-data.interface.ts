/**
 * Interface para os dados do contato
 */
export interface ContactData {
    id: string
    fullName?: string
    email?: string
    phone?: string
    objective?: string
    source?: string
    location?: string
    businessName?: string
    linkedin?: string
    feedback?: string
    website?: string
    createdAt: Date
    [key: string]: any // Para permitir outras propriedades
  }
  