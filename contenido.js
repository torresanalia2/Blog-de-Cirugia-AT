/* =====================================================================
   CONTENIDO DEL BLOG  —  este es el ÚNICO archivo que necesitas editar.
   ---------------------------------------------------------------------
   Cómo agregar un RESUMEN de clase
   1. Busca la línea  const RESUMENES = {  (más abajo).
   2. Agrega un bloque con el número de la clase (el número que aparece
      en la lista del blog). Ejemplo para la clase 12:

      12: {
        resumen: `Escribe aquí tu resumen (aprox. 1 página).

Deja una línea en blanco entre párrafos.

## Un subtítulo
- Una lista
- Con viñetas

Puedes poner **negrita** y *cursiva*.`,
        claves: ["Punto clave 1", "Punto clave 2", "Punto clave 3"],
        perla: "Una perla clínica o algo que no quieras olvidar.",
        preguntas: [
          { p: "¿Pregunta para repasar?", r: "Respuesta corta." },
        ],
      },

   Reglas importantes:
   - El texto del resumen va entre acentos graves ( ` ) — la tecla junto a la "Ñ" o
     Alt Gr + tecla del corchete, según tu teclado. No uses acentos graves dentro del texto.
   - Cada bloque termina con una coma:  },
   - "claves", "perla" y "preguntas" son opcionales. Si no los quieres, bórralos.
   - En cuanto un resumen tiene texto, la clase aparece como "Resumen listo".

   Cómo escribir un DÍA de rotación
   Más abajo, dentro de  ROTACION.dias , agrega una entrada con la clave
   "semana-día". Por ejemplo, "1-1" es la semana 1, día 1. Hay un ejemplo comentado.

   PRIVACIDAD: en los casos clínicos NO pongas nombres, iniciales, número de
   cédula, número de cama ni nada que identifique a un paciente.
   ===================================================================== */


/* ---------- Sobre mí ---------- */
const PERFIL = {
  nombre: "Analia Torres",
  blog: "Diario de Cirugía",
  universidad: "Universidad de Panamá, Facultad de Medicina",
  anio: "5.º año de Medicina",
  materia: "Cirugía",
  semestre: "2.º semestre 2026",
  hospital: "Hospital Susana Jones",
  // Puedes escribir varios párrafos separados por una línea en blanco.
  bio: `Soy estudiante de quinto año de Medicina en la Universidad de Panamá. Este blog es mi cuaderno de Cirugía: aquí dejo mis resúmenes de clase, los talleres, las clases especiales y lo que voy viviendo en la rotación.

Lo escribo para estudiar mejor y, si le sirve a alguien más, mejor todavía.`,
};


/* ---------- Áreas (colores del blog) ---------- */
const AREAS = {
  fund:   { nombre: "Fundamentos perioperatorios", color: "#1d7a6b" },
  trauma: { nombre: "Trauma y cuidados críticos",  color: "#d0483f" },
  torvas: { nombre: "Tórax y vascular",            color: "#2a55c8" },
  dig:    { nombre: "Aparato digestivo",           color: "#b7791f" },
  hpb:    { nombre: "Hígado, vías biliares y páncreas", color: "#7a4bc2" },
  onco:   { nombre: "Oncología quirúrgica, mama y piel", color: "#c2417c" },
  pared:  { nombre: "Hernias y pared abdominal",   color: "#5b7f2b" },
  peds:   { nombre: "Cirugía pediátrica",          color: "#0e8aa6" },
  hum:    { nombre: "Humanidades y práctica",      color: "#7a6a58" },
};


/* ---------- Programa de la materia (no necesitas tocar esto) ----------
   C(número, semana, área, "tema", "profesor", tipo)
   tipo: "clase" (por defecto), "especial" o "taller"                    */
const C = (id, semana, area, tema, profe, tipo = "clase") => ({ id, semana, area, tema, profe, tipo });

const CLASES = [
  // Semana 1
  C(1, 1, "fund", "Complicaciones en cirugía", "Dr. Gerardo Victoria"),
  C(2, 1, "fund", "Complicaciones sistémicas: riesgo y pausa", "Dr. Gerardo Victoria"),
  C(3, 1, "fund", "ERAS", "Dr. Alfredo Matos"),
  C(4, 1, "fund", "Nutrición en cirugía", "Dr. Alfredo Matos"),
  C(5, 1, "fund", "Cicatrización de las heridas, diéresis y síntesis", "Dr. Néstor Vega"),
  C(6, 1, "fund", "Infecciones en cirugía", "Dr. Néstor Vega"),
  C(7, 1, "fund", "Líquidos y electrolitos", "Dr. Martin Vasquez"),
  C(8, 1, "trauma", "Trauma: mecanismo y respuesta metabólica", "Dr. Martin Vasquez"),

  // Semana 2
  C(9, 2, "torvas", "Síndrome aórtico agudo", "Dr. Ubaldo Rivas", "especial"),
  C(10, 2, "fund", "Cirugía menor y ambulatoria", "Dr. Gerardo Victoria"),
  C(11, 2, "fund", "Asepsia y antisepsia", "Dr. Gerardo Victoria"),
  C(12, 2, "trauma", "Trauma abdominal", "Dr. Martin Vasquez"),
  C(13, 2, "trauma", "Trauma: cráneo, pelvis y extremidades", "Dr. Martin Vasquez"),
  C(14, 2, "onco", "Cáncer de estómago", "Dra. Stephany Torres"),
  C(15, 2, "onco", "Tumores de intestino delgado", "Dra. Stephany Torres"),
  C(16, 2, "trauma", "Manejo intensivo del paciente politraumatizado", "Dr. Mon", "especial"),
  C(17, 2, "fund", "Desbridamiento de heridas quirúrgicas", "Dr. Enrique Victoria"),
  C(18, 2, "trauma", "Trauma torácico", "Dr. Gerardo Victoria"),
  C(19, 2, "trauma", "Reto torácico", "Dr. Gerardo Victoria", "taller"),
  C(20, 2, "torvas", "Accesos vasculares", "Dr. Adrian Rujano", "especial"),

  // Semana 3
  C(21, 3, "hpb", "Enfermedad de vías biliares I", "Dr. Inti Pérez"),
  C(22, 3, "hpb", "Enfermedad de vías biliares II", "Dr. Inti Pérez"),
  C(23, 3, "fund", "Respuesta sistémica a la lesión y apoyo metabólico", "Dr. Alfredo Matos"),
  C(24, 3, "trauma", "Cuidados intensivos quirúrgicos: monitorización en UCI", "Dr. Alfredo Matos"),
  C(25, 3, "trauma", "Prioridades en la atención del trauma, ATLS, vía aérea y ventilación", "Dr. Martin Vasquez"),
  C(26, 3, "trauma", "Shock y reanimación en trauma", "Dr. Martin Vasquez"),
  C(27, 3, "dig", "Estómago: enfermedad úlcero-péptica y tumores benignos", "Dr. Alfredo Matos"),
  C(28, 3, "dig", "Sangrado digestivo alto y hemorragia digestiva baja", "Dr. Alfredo Matos"),
  C(29, 3, "dig", "Apendicitis aguda", "Dr. James Lindsay"),
  C(30, 3, "onco", "Tumor carcinoide", "Dr. James Lindsay"),

  // Semana 4
  C(31, 4, "torvas", "Cirugía torácica", "Dr. Ricardo Jaramillo"),
  C(32, 4, "torvas", "Pleura, pulmón y mediastino", "Dr. Ricardo Jaramillo"),
  C(33, 4, "torvas", "Cirugía vascular: enfermedades arteriales", "Dr. Gerardo Victoria"),
  C(34, 4, "torvas", "Cirugía vascular: enfermedades venosas", "Dr. Gerardo Victoria"),
  C(35, 4, "pared", "Hernias de la pared abdominal I", "Dra. Debbie Wong"),
  C(36, 4, "pared", "Hernias de la pared abdominal II", "Dra. Debbie Wong"),
  C(37, 4, "dig", "Enfermedad diverticular del colon y vólvulos", "Dr. Edgardo Arcia"),
  C(38, 4, "dig", "Enfermedad inflamatoria intestinal", "Dr. Edgardo Arcia"),

  // Semana 5
  C(39, 5, "dig", "Abdomen agudo I", "Dr. Gerardo Victoria"),
  C(40, 5, "dig", "Abdomen agudo II", "Dr. Gerardo Victoria"),
  C(41, 5, "fund", "Imagenología en cirugía", "Dra. Debbie Wong"),
  C(42, 5, "pared", "Hernias, ostomías y drenajes", "Dra. Debbie Wong"),
  C(43, 5, "hum", "Psicología para cirujanos", "Dr. Luis G. Victoria", "especial"),
  C(44, 5, "hum", "Ética en cirugía", "Dr. Enrique Victoria", "especial"),
  C(45, 5, "dig", "Obstrucción intestinal", "Dra. Debbie Wong"),
  C(46, 5, "fund", "Problemas médicos en pacientes quirúrgicos", "Dra. Debbie Wong"),

  // Semana 6
  C(47, 6, "hpb", "Pancreatitis aguda y crónica", "Dr. Moisés Cukier"),
  C(48, 6, "hpb", "Neoplasias del páncreas", "Dr. Moisés Cukier"),
  C(49, 6, "onco", "Lesiones benignas de la mama", "Dr. Pablo Duran"),
  C(50, 6, "onco", "Tumores malignos de mama", "Dr. Pablo Duran"),
  C(51, 6, "onco", "Lesiones en la piel", "Dr. Pablo Duran"),
  C(52, 6, "onco", "Melanoma", "Dr. Pablo Duran"),
  C(53, 6, "hpb", "Hígado: enfermedades benignas y tumores", "Dra. Lizka Richards"),
  C(54, 6, "hpb", "Hipertensión portal, bazo, esplenectomía y trasplantes", "Dra. Lizka Richards"),

  // Semana 7
  C(55, 7, "dig", "Enfermedades del ano y recto", "Dr. Edgardo Arcia"),
  C(56, 7, "onco", "Tumores de colon, ano y recto", "Dr. Edgardo Arcia"),
  C(57, 7, "onco", "Tumores de cabeza y cuello", "Dr. Pablo Duran"),
  C(58, 7, "onco", "Tumores de esófago", "Dr. Pablo Duran"),
  C(59, 7, "dig", "Cirugía bariátrica metabólica y obesidad", "Dra. Debbie Wong"),
  C(60, 7, "dig", "Secuelas de la cirugía gastroduodenal", "Dra. Debbie Wong"),
  C(61, 7, "peds", "Enfermedades quirúrgicas pediátricas I", "Dr. Ramon Policart"),
  C(62, 7, "peds", "Enfermedades quirúrgicas pediátricas II", "Dr. Ramon Policart"),
];


/* =====================================================================
   TUS RESÚMENES  —  agrégalos aquí (mira las instrucciones arriba)
   ===================================================================== */
const RESUMENES = {

  // 1: {
  //   resumen: `Tu resumen aquí.`,
  //   claves: [],
  //   perla: "",
  //   preguntas: [],
  // },

};


/* =====================================================================
   ROTACIÓN CLÍNICA  —  4 semanas en el Hospital Susana Jones
   ===================================================================== */
const ROTACION = {
  hospital: "Hospital Susana Jones",
  diasPorSemana: 5,   // cambia a 6 o 7 si también cuentas sábados o domingos

  // Cuando sepas por dónde vas a rotar, cambia "Servicio por definir".
  semanas: [
    { servicio: "Servicio por definir", nota: "" },
    { servicio: "Servicio por definir", nota: "" },
    { servicio: "Servicio por definir", nota: "" },
    { servicio: "Servicio por definir", nota: "" },
  ],

  // Un bloque por día. La clave es "semana-día". Todos los campos son opcionales.
  dias: {

    // "1-1": {
    //   titulo: "Primer día en el servicio",
    //   animo: "😅",
    //   vi: `Qué vi hoy.`,
    //   hice: `Qué hice yo (curaciones, ayudé en cirugía, historia clínica…).`,
    //   aprendi: `Qué aprendí.`,
    //   casos: `Caso anonimizado: paciente masculino de 60 y tantos años con…`,
    //   estudiar: `Lo que me quedó pendiente por estudiar.`,
    // },

  },
};
