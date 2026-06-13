export interface Profile {
  id: string
  email: string
  nombre: string
  cuit: string
  condicion_fiscal: 'monotributista' | 'responsable_inscripto'
  created_at: string
}

export interface NegocioMensual {
  id?: string
  user_id?: string
  anio: number
  mes: number
  facturacion: number
  compras: number
  gastos: number
  sueldos_cs: number
  acreditaciones: number
}

export interface Cheque {
  id?: string
  user_id?: string
  nro: string
  banco: string
  importe: number
  fecha_pago: string
  beneficiario: string
  concepto: string
  estado: 'cobrado' | 'pendiente' | 'vencido'
  created_at?: string
}

export interface Acreditacion {
  id?: string
  user_id?: string
  anio: number
  mes: number
  banco: string
  imp_creditos: number
  prestamos: number
  transferencias: number
  otras: number
  total_acred: number
  facturacion: number
}

export interface CategoriaFiscal {
  id?: string
  user_id?: string
  cuit: string
  condicion: 'monotributista' | 'responsable_inscripto'
  categoria: string
  actividad_principal: string
  actividad_secundaria: string
}

export interface KbTema {
  id: string
  nombre: string
  descripcion: string
  orden: number
  kb_nodos?: KbNodo[]
}

export interface KbNodo {
  id?: string
  tema_id: string
  pregunta: string
  respuesta: string
  palabras_clave: string
  activo: boolean
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export const MONOTRIBUTO_CATEGORIAS = [
  { cat: 'A', fact: 10277988, sup: 30, energia: 3330, alquiler: 2390882, cuota: 7600, obraSocial: 9100, art: 350 },
  { cat: 'B', fact: 15058448, sup: 45, energia: 5000, alquiler: 2390882, cuota: 9200, obraSocial: 9100, art: 350 },
  { cat: 'C', fact: 21113697, sup: 60, energia: 6700, alquiler: 3267433, cuota: 12500, obraSocial: 9100, art: 350 },
  { cat: 'D', fact: 26212853, sup: 85, energia: 10000, alquiler: 3267433, cuota: 16800, obraSocial: 9100, art: 350 },
  { cat: 'E', fact: 30833964, sup: 110, energia: 13000, alquiler: 4143984, cuota: 22400, obraSocial: 9100, art: 350 },
  { cat: 'F', fact: 38642048, sup: 150, energia: 16500, alquiler: 4143984, cuota: 30500, obraSocial: 9100, art: 350 },
  { cat: 'G', fact: 46211109, sup: 200, energia: 20000, alquiler: 4941561, cuota: 40800, obraSocial: 9100, art: 350 },
  { cat: 'H', fact: 70113407, sup: 200, energia: 20000, alquiler: 7170688, cuota: 74500, obraSocial: 9100, art: 350 },
  { cat: 'I', fact: 78479212, sup: 200, energia: 20000, alquiler: 7170688, cuota: 90200, obraSocial: 9100, art: 350 },
  { cat: 'J', fact: 89872640, sup: 200, energia: 20000, alquiler: 7170688, cuota: 110500, obraSocial: 9100, art: 350 },
  { cat: 'K', fact: 108357084, sup: 200, energia: 20000, alquiler: 7170688, cuota: 145200, obraSocial: 9100, art: 350 },
]

export function formatARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount)
}

export const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
