export interface Donante {
    id?: number;
    razon_social: string;
    rfc?: string;
    regimen_fiscal?: string;
    direccion?: string;
    cp?: string;
    contacto: string;
    email?: string;
    telefono?: string;
    estatus: 'Permanente' | 'Eventual' | 'Unica vez';
}

export interface DetalleDonativo {
    id?: number;
    categoria_producto: string;
    nombre_producto: string;
    clave_sat?: string;
    modalidad?: string;
    clave_unidad?: string;
    cantidad: number;
    precio_venta_unitario?: number;
    precio_venta_total?: number;
    precio_unitario_deducible?: number;
    monto_deducible_total?: number;
}

export interface Donativo {
    id?: number;
    donante_id: number;
    donante?: Donante; // Para cuando traigamos la relación
    fecha_donativo: string;
    monto_total_deducible: number;
    observaciones?: string;
    detalles: DetalleDonativo[]; // Array de productos
}

export interface Iap {
    id?: number;
    nombre_iap: string;
    estatus: 'Activo' | 'Inactivo' | 'Nueva Constitución' | 'En Proceso' | 'Cancelada' | 'Sin Dato';
    rubro?: string;
    actividad_asistencial?: string;
    personas_beneficiadas: number;
    necesidad_primaria?: string;
    necesidad_complementaria?: string;
    es_certificada: boolean;
    tiene_donataria_autorizada: boolean;
    tiene_padron_beneficiarios: boolean;
    veces_donado: number;
    score_calculado?: number; // Para el algoritmo
}

export interface InventarioItem {
    producto: string;
    entradas: number;
    salidas: number;
    stock: number;
}