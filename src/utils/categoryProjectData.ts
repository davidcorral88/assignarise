
interface CategoryData {
  categorias: {
    [category: string]: {
      proyectos: string[];
    };
  };
}

const categoryData: CategoryData = {
  "categorias": {
    "a. Gestión de los contratos de concesión": {
      "proyectos": [
        "a1. Puesta en marcha",
        "a2. Gestión continua",
        "a3. Gestión XG5xx"
      ]
    },
    "b. Seguimiento de la explotación": {
      "proyectos": [
        "b1. Seg. Explotac. Común",
        "b2. Penalidades contractuales",
        "b3. Recursos y reclamaciones",
        "b4. Reuniones",
        "b5. Reportes Diarios",
        "b6. Diseños"
      ]
    },
    "c. Gestión de los pagos": {
      "proyectos": [
        "c1. Cierre XG5xx",
        "c2. Nuevos contt XG6xx",
        "c3. Exped_Xunta"
      ]
    },
    "d. Información general y gestión de las reclamaciones": {
      "proyectos": [
        "d1. Info gral",
        "d2. Reclamaciones",
        "d3. Alegaciones FASE II"
      ]
    },
    "e. Elaboración de memorias e informes": {
      "proyectos": [
        "e. Memorias e informes"
      ]
    },
    "f. Colaboración en la implantación de aplicaciones tecnológicas": {
      "proyectos": [
        "f1. APPs existentes o Nuevas",
        "f2. Coordinación Concesionarios",
        "f3. Asistencia reuniones técnicas",
        "f4. Apoyo en la Implantación de SIMOB"
      ]
    },
    "g. Elaboración y ejecución de análisis de la calidad de los servicios": {
      "proyectos": [
        "g. Calidad de servicios"
      ]
    }
  }
};

export const getAllCategories = (): string[] => {
  return Object.keys(categoryData.categorias);
};

export const getProjectsByCategory = (category: string): string[] => {
  if (!category || !categoryData.categorias[category]) {
    return [];
  }
  return categoryData.categorias[category].proyectos;
};

export default categoryData;
