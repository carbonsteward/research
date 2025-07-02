export const stakeholders = [
  {
    category: "Actores del Sector Público",
    description: "Las entidades gubernamentales lideran la arquitectura regulatoria, la supervisión y la implementación de las políticas de fijación de precios al carbono, actuando como el eje central de la gobernanza climática del país.",
    icon: "landmark",
    colorClass: "public-sector",
    members: [
      {
        id: "cnccmdl",
        name: "Consejo Nacional para el Cambio Climático y Mecanismo de Desarrollo Limpio (CNCCMDL)",
        description: "Es el organismo de más alto nivel, responsable de la coordinación interinstitucional y de articular la política climática nacional. Actúa como Autoridad Nacional Designada (DNA) ante la CMNUCC.",
        icon: "shield-check",
        mechanisms: [
          { name: "ITMOs / Artículo 6.4 (PACM)", responsibilities: "- **Aprobar y supervisar** la transición de proyectos del Mecanismo de Desarrollo Limpio (MDL) al Mecanismo del Artículo 6.4 (PACM).<br>- Liderar el diseño e implementación del **Sistema Nacional de Medición, Reporte y Verificación (MRV)**, crucial para la contabilidad y transparencia de los ITMOs.<br>- Coordinar la política nacional para la participación en enfoques cooperativos." },
          { name: "Impuesto al Carbono", responsibilities: "- **Rol indirecto:** Su liderazgo en el desarrollo del sistema MRV es fundamental para proporcionar los datos de emisiones necesarios para la aplicación de cualquier futuro impuesto al carbono de base amplia." },
          { name: "Sistema de Comercio de Emisiones (ETS)", responsibilities: "- **Liderar la evaluación** de la viabilidad técnica y política de un ETS doméstico.<br>- Coordinar el diseño del **programa piloto de ETS** con otros actores públicos y privados.<br>- Supervisar el desarrollo del sistema MRV para garantizar la integridad del mercado." },
          { name: "Mercado Voluntario de Carbono", responsibilities: "- **Promover activamente** la creación de un mercado voluntario nacional.<br>- Organizar plataformas de diálogo como el **Primer Foro de Carbono** para sensibilizar y activar la demanda de créditos en el sector privado.<br>- Fomentar el reporte voluntario de emisiones de Gases de Efecto Invernadero (GEI)." }
        ]
      },
      {
        id: "mmarn",
        name: "Ministerio de Medio Ambiente y Recursos Naturales (MMARN)",
        description: "Como ente rector ambiental, es responsable de la ejecución técnica y supervisión de las políticas y proyectos climáticos.",
        icon: "leaf",
        mechanisms: [
            { name: "ITMOs / Artículo 6.4 (PACM)", responsibilities: "- **Desarrollar capacidades técnicas** en actores públicos y privados para la implementación del Artículo 6, en colaboración con socios como Cedaf.<br>- Participar en la estructuración de proyectos que puedan generar créditos de carbono, como las iniciativas **REDD+**." },
            { name: "Impuesto al Carbono", responsibilities: "- Formar parte del comité directivo para la implementación de la Contribución Nacionalmente Determinada (NDC), lo que incluye la evaluación de instrumentos fiscales como los impuestos al carbono." },
            { name: "Sistema de Comercio de Emisiones (ETS)", responsibilities: "- Participar activamente en el diseño y validación del **programa piloto de ETS** junto al CNCCMDL y otros ministerios." },
            { name: "Mercado Voluntario de Carbono", responsibilities: "- **Co-organizar foros** y talleres para impulsar el mercado.<br>- Desarrollar marcos conceptuales y regulatorios, como el documento sobre **\"derecho de carbono\"** para proyectos de Reducción de Emisiones." }
        ]
      },
      {
        id: "dgii",
        name: "Dirección General de Impuestos Internos (DGII)",
        description: "La autoridad tributaria del país, con un rol directo y específico en la administración de impuestos ambientales existentes.",
        icon: "banknote",
        mechanisms: [
          { name: "Impuesto al Carbono", responsibilities: "- **Rol central y directo:** Administrar, recaudar y regular el **impuesto sobre las emisiones de CO2 para vehículos de motor**, según lo establecido en la Ley 253-12 y la Norma General 06-12.<br>- Definir los procedimientos para la liquidación y pago del impuesto basado en los gramos de CO2/km emitidos." },
          { name: "ITMOs / ETS / Mercado Voluntario", responsibilities: "<i>No se identifica un rol directo en la información disponible.</i>" }
        ]
      }
    ]
  },
  {
    category: "Actores del Sector Privado y Asociaciones",
    description: "El sector privado es un participante fundamental, tanto como entidad regulada en los mecanismos de precios al carbono como actor proactivo en la generación y compra de créditos.",
    icon: "building-2",
    colorClass: "private-sector",
    members: [
      {
        id: "concesionarios",
        name: "Concesionarios y Vendedores de Vehículos",
        description: "Actúan como agentes de retención en la aplicación del impuesto al carbono sobre vehículos.",
        icon: "car",
        mechanisms: [
          { name: "Impuesto al Carbono", responsibilities: "- **Rol operativo clave:** Consignar los valores de emisión de CO2 de cada vehículo y **realizar el pago del impuesto correspondiente** durante el proceso de primer registro ante la DGII." },
          { name: "ITMOs / ETS / Mercado Voluntario", responsibilities: "<i>No se identifica un rol directo.</i>" }
        ]
      },
      {
        id: "sectores-generales",
        name: "Sectores Industrial, Energético y Financiero (General)",
        description: "Este grupo representa a los principales emisores y, por tanto, a los participantes potenciales más importantes en cualquier mercado de carbono a gran escala.",
        icon: "factory",
        mechanisms: [
          { name: "ITMOs / Artículo 6.4 (PACM)", responsibilities: "- **Potenciales desarrolladores de proyectos** de mitigación en los sectores energético e industrial para generar Resultados de Mitigación Transferidos Internacionalmente (ITMOs)." },
          { name: "Sistema de Comercio de Emisiones (ETS)", responsibilities: "- Identificados como los **principales participantes obligados** en un futuro ETS doméstico.<br>- El sector financiero podría proveer la infraestructura de mercado para la compraventa y registro de derechos de emisión." },
          { name: "Mercado Voluntario de Carbono", responsibilities: "- **Actores clave como potenciales desarrolladores** de proyectos (generadores de créditos) o como **compradores** para cumplir metas corporativas de sostenibilidad y neutralidad de carbono." }
        ]
      },
      {
        id: "adocem",
        name: "Asociación Dominicana de Productores de Cemento (ADOCEM)",
        description: "Representa a un sector industrial con alto potencial de mitigación, mostrando un rol proactivo.",
        icon: "construction",
        mechanisms: [
          { name: "Todos los mecanismos", responsibilities: "- Identificada como una asociación con **opciones de mitigación industrial** claras (hoja de ruta de descarbonización).<br>- Su sector es un candidato natural para **generar créditos de carbono** a través de proyectos de reducción de emisiones bajo cualquiera de los mecanismos (Art. 6, ETS o voluntario)." }
        ]
      }
    ]
  },
  {
    category: "Actores Internacionales y Multilaterales",
    description: "Estos socios proveen financiamiento, asistencia técnica y un marco de gobernanza global, actuando como catalizadores y compradores en los mercados de carbono.",
    icon: "globe",
    colorClass: "international-actors",
    members: [
      {
        id: "banco-mundial",
        name: "Banco Mundial",
        description: "Facilita apoyo técnico y financiero para el desarrollo de la infraestructura de los mercados de carbono.",
        icon: "landmark",
        mechanisms: [
          { name: "Impuesto al Carbono", responsibilities: "- **Proveer análisis técnico**, como el estudio sobre el impacto macroeconómico de un impuesto al carbono en la productividad del país." },
          { name: "Sistema de Comercio de Emisiones (ETS)", responsibilities: "- **Brindar apoyo técnico y/o financiero** en el diseño e implementación del programa piloto de ETS." },
          { name: "Mercado Voluntario de Carbono", responsibilities: "- Apoyar al gobierno (a través del FCPF) en el desarrollo de marcos regulatorios, como el documento sobre **derechos de carbono y transferencia de títulos** para proyectos REDD+." }
        ]
      },
      {
        id: "paises-compradores",
        name: "Países Compradores (Ej. Suecia, Japón)",
        description: "Son la contraparte en los acuerdos bilaterales para la transferencia de resultados de mitigación.",
        icon: "flag",
        mechanisms: [
          { name: "ITMOs / Artículo 6.4 (PACM)", responsibilities: "- **Actuar como compradores de ITMOs** generados en la República Dominicana para cumplir con sus propias NDCs.<br>- Firmar **acuerdos bilaterales** que definen los términos de la cooperación bajo el Artículo 6.2." },
          { name: "Otros mecanismos", responsibilities: "<i>No se identifica un rol directo.</i>" }
        ]
      },
      {
        id: "cmnucc",
        name: "CMNUCC (Convención Marco de las Naciones Unidas sobre el Cambio Climático)",
        description: "Es el organismo que establece las reglas y supervisa los mercados regulados internacionales.",
        icon: "globe-2",
        mechanisms: [
          { name: "ITMOs / Artículo 6.4 (PACM)", responsibilities: "- **Gestionar el marco global**, incluyendo la transición de proyectos del MDL al Mecanismo del Artículo 6.4 (PACM).<br>- Establecer y supervisar las metodologías y requisitos para la emisión de créditos 6.4ERs." },
          { name: "Sistema de Comercio de Emisiones (ETS)", responsibilities: "- Facilitar **talleres de capacitación y validación** para el diseño del programa piloto de ETS en el país." }
        ]
      }
    ]
  }
];
