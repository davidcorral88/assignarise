
export const categoryProjectData = {
  "categorias": {
    "-": {
      "proyectos": ["-"]
    },
    "a. Gestión de los contratos de concesión": {
      "proyectos": [
        "-",
        "a1.1. Actualizar cambios XG5xx",
        "a1.2. Act. servicios generales",
        "a1.3. Act. servicios integrados",
        "a1.4. Integr. proyectos generar Maestros",
        "a1.5. Integr. proyectos e info disponible",
        "a1.6. Verif. adscripción vehículos",
        "a1.7. Verif. adscripción personal",
        "a1.8. Verif. instalaciones fijas",
        "a1.9. Seguimiento y verif. Sist. tarifario",
        "a1.10. Seguimiento acuerdos",
        "a1.11. Comunicaciones",
        "a2.1. Cambios",
        "a2.2. Modificaciones",
        "a2.3. Adscrip. Vehículos",
        "a2.4. Adscrip. Personal",
        "a2.5. Instalaciones fijas",
        "a2.6. Publicidad e imagen",
        "a2.7. Sist. tarifario",
        "a2.8. Acuerdos",
        "a2.9. Convenios",
        "a2.10. Otros servicios",
        "a3.1. Cambios",
        "a3.2. Demanda",
        "a3.3. Continuidad"
      ]
    },
    "b. Seguimiento de la explotación": {
      "proyectos": [
        "-",
        "b1.1. Informes",
        "b1.2. Validación Datos",
        "b1.3. Verif. Cumplimiento",
        "b1.4. Protocolos",
        "b1.5. Notas Prensa y POP",
        "b1.6. Balance Mensual",
        "b2. Penalidades contractuales",
        "b3. Recursos y reclamaciones",
        "b4. Reuniones",
        "b5. Reportes Diarios",
        "b6. Diseños"
      ]
    },
    "c. Gestión de los pagos": {
      "proyectos": [
        "-",
        "c1. Cierre XG5xx",
        "c2.1. Compensaciones",
        "c2.2. Facturación",
        "c.2.3. Seguimiento",
        "c3. Exped_Xunta"
      ]
    },
    "d. Información general y gestión de las reclamaciones": {
      "proyectos": [
        "-",
        "d1.1. Info WEB-RRSS",
        "d1.2 Fichas",
        "d1.3 Aclaraciones",
        "d1.4 Interpretación de los pliegos",
        "d2.1  Protocolos",
        "d2.2 Quejas INFORMALES",
        "d2.3 Quejas FORMALES",
        "d2.4 Quejas OTRANS",
        "d2.5 Baixo Demanda",
        "d2.6 Mociones",
        "d3. Alegaciones FASE II"
      ]
    },
    "e. Elaboración de memorias e informes": {
      "proyectos": [
        "-",
        "e1. Memoria Anual",
        "e2. Docs. Específicos"
      ]
    },
    "f. Colaboración en la implantación de aplicaciones tecnológicas": {
      "proyectos": [
        "-",
        "f1. APPs existentes o Nuevas",
        "f2. Coordinación Concesionarios",
        "f3. Asistencia reuniones técnicas",
        "f4. Apoyo en la Implantación de SIMOB"
      ]
    },
    "g. Elaboración y ejecución de análisis de la calidad de los servicios": {
      "proyectos": [
        "-",
        "g1. Propuesta metodológica, calendario y cuestionarios",
        "g2. Propuesta de estructura y contenido",
        "g3. Realización de los trabajos",
        "g4. Otros trabajos de campo",
        "g5. Redacción de Documentos"
      ]
    }
  }
};

// Get all category options
export const getCategoryOptions = (): string[] => {
  return ["-", ...Object.keys(categoryProjectData.categorias).filter(cat => cat !== "-")];
};

// Get project options based on selected category
export const getProjectOptions = (selectedCategory: string): string[] => {
  if (!selectedCategory || !categoryProjectData.categorias[selectedCategory]) {
    return ["-"];
  }
  
  return categoryProjectData.categorias[selectedCategory].proyectos;
};
