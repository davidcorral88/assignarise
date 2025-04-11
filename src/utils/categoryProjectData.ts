
// Category to Project mapping data
export const categoryToProjectMapping = {
  "a. Gestión de los contratos de concesión": [
    "a1. Puesta en marcha",
    "a2. Gestión continua",
    "a3. Gestión XG5xx"
  ],
  "b. Seguimiento de la explotación": [
    "b1. Seg. Explotac. Común",
    "b2. Penalidades contractuales",
    "b3. Recursos y reclamaciones",
    "b4. Reuniones",
    "b5. Reportes Diarios",
    "b6. Diseños"
  ],
  "c. Gestión de los pagos": [
    "c1. Cierre XG5xx",
    "c2. Nuevos contt XG6xx",
    "c3. Exped_Xunta"
  ],
  "d. Información general y gestión de las reclamaciones": [
    "d1. Info gral",
    "d2. Reclamaciones",
    "d3. Alegaciones FASE II"
  ],
  "e. Elaboración de memorias e informes": [
    "e. Memorias e informes"
  ],
  "f. Colaboración en la implantación de aplicaciones tecnológicas": [
    "f1. APPs existentes o Nuevas",
    "f2. Coordinación Concesionarios",
    "f3. Asistencia reuniones técnicas",
    "f4. Apoyo en la Implantación de SIMOB"
  ],
  "g. Elaboración y ejecución de análisis de la calidad de los servicios": [
    "g. Calidad de servicios"
  ]
};

// Get all categories as an array
export const getAllCategories = (): string[] => {
  return Object.keys(categoryToProjectMapping);
};

// Get projects for a specific category
export const getProjectsByCategory = (category: string): string[] => {
  return categoryToProjectMapping[category as keyof typeof categoryToProjectMapping] || [];
};
