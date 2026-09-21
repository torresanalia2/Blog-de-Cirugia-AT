/* =====================================================================
   CONTENIDO DEL BLOG  —  este es el ÚNICO archivo que necesitas editar.

   CÓMO SUBIR TUS ARCHIVOS (PDF de Canva, fotos, videos)
   ---------------------------------------------------------------------
   1. Todo va dentro de una carpeta llamada  archivos  en tu repositorio de GitHub.
      (En GitHub: Add file > Upload files, y arrastra tus archivos. Si la carpeta no
      existe todavía, arrastra desde tu computador una carpeta llamada "archivos".)
   2. Usa nombres SIN espacios, sin tildes y en minúscula:  clase-01.pdf  (no "Clase 1 final.pdf").

   RESÚMENES DE CLASES (lo más fácil)
   Descarga tu resumen de Canva como PDF y ponle este nombre exacto:
        clase-01.pdf, clase-02.pdf ... clase-61.pdf     (el número es el que ves en la lista de clases)
   Súbelo a la carpeta "archivos" y el blog lo detecta solo: la clase pasa a "Resumen listo"
   y la página muestra la vista previa del PDF. No tienes que tocar este archivo.

   BITÁCORA DE ROTACIÓN (igual de fácil)
        bitacora-completa.pdf           (toda la rotación)
        bitacora-semana-1.pdf  ...  bitacora-semana-4.pdf

   TALLERES:  taller-1.pdf, taller-2.pdf ...   (en el orden de la lista TALLERES, más abajo)

   OTRAS OPCIONES
   - En vez de un PDF puedes pegar el enlace de Canva:  enlace: "https://www.canva.com/design/...".
     (En Canva: Compartir > Ver enlace; asegúrate de que cualquiera con el enlace pueda verlo.)
   - También sirven los enlaces de Google Drive (con permiso "cualquiera con el enlace").
   - Si prefieres escribir el resumen aquí mismo como texto, mira el ejemplo en RESUMENES.

   Reglas: el texto va entre comillas, cada bloque termina con coma, y no borres las llaves { }.
   PRIVACIDAD: nada de nombres, iniciales, cédulas ni camas de pacientes en tus documentos ni fotos.
   ===================================================================== */


/* ---------- Inicio: sobre mí ---------- */
const PERFIL = {
  nombre: "Analia Torres",
  blog: "Diario de Cirugía",
  universidad: "Universidad de Panamá, Facultad de Medicina",
  anio: "5.º año de Medicina",
  materia: "Cirugía",
  semestre: "2.º semestre 2026",
  hospital: "Hospital Susana Jones",
  foto: "analia.jpg",   // tu foto: súbela como archivos/analia.jpg (si no existe, se muestra un espacio para ella)
  // Puedes escribir varios párrafos separados por una línea en blanco.
  bio: `Soy estudiante de quinto año de Medicina en la Universidad de Panamá. Este blog es mi cuaderno de Cirugía: aquí dejo mis resúmenes de clase, los talleres, mis rotaciones y todo lo que voy aprendiendo entre pinzas y bisturís.

Lo armo para estudiar mejor y, si le sirve a alguien más, mejor todavía.`,
};


/* ---------- Portada (la imagen grande del inicio) ----------
   MODO 1 (el que se usa ahora): tu portada de Canva tal cual, como una sola imagen.
     Sube  portada.jpg  a la carpeta "archivos". Debe ser una imagen horizontal (16:9)
     de tu diseño, SIN los botones del menú de Canva (el blog ya tiene su propio menú).
   MODO 2 (respaldo): si no existe portada.jpg, se arma la portada por capas con estas 3 imágenes:
     portada-fondo.jpg   la foto del quirófano
     pinzas.png          las pinzas (PNG con fondo transparente)
     bisturi.png         el bisturí (PNG con fondo transparente)
   Ajustes del modo 2 (giro en grados, tamano: 1 = normal, x / y: mueven la imagen; positivo = derecha / abajo).
   Los giros vienen de tu diseño de Canva (pinzas 65°, bisturí 114°); si tus PNG ya vienen girados, pon 0.   */
const PORTADA = {
  imagen: "portada.jpg",
  linea1: "Entre",
  linea2: "pinzas y bisturís",
  fondo: "portada-fondo.jpg",
  pinzas: "pinzas.png",
  bisturi: "bisturi.png",
  fondoColor: "#13080f",              // el color oscuro que hay detrás de la foto (el de tu diseño)
  fondoOpacidad: 0.53,                // la foto se ve al 53 % de fuerza, como en tu diseño
  tinte: "transparent",               // un color encima de la foto, si quieres (ej.: "rgba(26, 46, 214, 0.3)")
  resaltador: "#ffe847",              // el amarillo de tu diseño
  pinzasAjuste:  { giro: 65,    tamano: 1, x: 0, y: 0 },
  bisturiAjuste: { giro: 113.8, tamano: 1, x: 0, y: 0 },
};


/* ---------- Inicio: mis profesores ----------
   Los nombres salen solos de la lista de clases. Aquí solo agregas su foto o una nota (opcional).
   Copia el nombre EXACTAMENTE como aparece en la lista de clases.                                  */
const PROFES = {
  // "Dr. Gerardo Victoria": { foto: "victoria.jpg", nota: "Cirugía general" },
};


/* ---------- Clases (normales y especiales, por semana) ----------
   C(número, semana, "tema", "profesor")   /   C(número, semana, "tema", "profesor", "especial") */
const C = (id, semana, tema, profe, tipo = "clase") => ({ id, semana, tema, profe, tipo });

const CLASES = [
  // Semana 1
  C(1, 1, "Complicaciones en cirugía", "Dr. Gerardo Victoria"),
  C(2, 1, "Complicaciones sistémicas: riesgo y pausa", "Dr. Gerardo Victoria"),
  C(3, 1, "ERAS", "Dr. Alfredo Matos"),
  C(4, 1, "Nutrición en cirugía", "Dr. Alfredo Matos"),
  C(5, 1, "Cicatrización de las heridas, diéresis y síntesis", "Dr. Néstor Vega"),
  C(6, 1, "Infecciones en cirugía", "Dr. Néstor Vega"),
  C(7, 1, "Líquidos y electrolitos", "Dr. Martin Vasquez"),
  C(8, 1, "Trauma: mecanismo y respuesta metabólica", "Dr. Martin Vasquez"),

  // Semana 2
  C(9, 2, "Síndrome aórtico agudo", "Dr. Ubaldo Rivas", "especial"),
  C(10, 2, "Cirugía menor y ambulatoria", "Dr. Gerardo Victoria"),
  C(11, 2, "Asepsia y antisepsia", "Dr. Gerardo Victoria"),
  C(12, 2, "Trauma abdominal", "Dr. Martin Vasquez"),
  C(13, 2, "Trauma: cráneo, pelvis y extremidades", "Dr. Martin Vasquez"),
  C(14, 2, "Cáncer de estómago", "Dra. Stephany Torres"),
  C(15, 2, "Tumores de intestino delgado", "Dra. Stephany Torres"),
  C(16, 2, "Manejo intensivo del paciente politraumatizado", "Dr. Mon", "especial"),
  C(17, 2, "Desbridamiento de heridas quirúrgicas", "Dr. Enrique Victoria"),
  C(18, 2, "Trauma torácico", "Dr. Gerardo Victoria"),
  C(19, 2, "Accesos vasculares", "Dr. Adrian Rujano", "especial"),

  // Semana 3
  C(20, 3, "Enfermedad de vías biliares I", "Dr. Inti Pérez"),
  C(21, 3, "Enfermedad de vías biliares II", "Dr. Inti Pérez"),
  C(22, 3, "Respuesta sistémica a la lesión y apoyo metabólico", "Dr. Alfredo Matos"),
  C(23, 3, "Cuidados intensivos quirúrgicos: monitorización en UCI", "Dr. Alfredo Matos"),
  C(24, 3, "Prioridades en la atención del trauma, ATLS, vía aérea y ventilación", "Dr. Martin Vasquez"),
  C(25, 3, "Shock y reanimación en trauma", "Dr. Martin Vasquez"),
  C(26, 3, "Estómago: enfermedad úlcero-péptica y tumores benignos", "Dr. Alfredo Matos"),
  C(27, 3, "Sangrado digestivo alto y hemorragia digestiva baja", "Dr. Alfredo Matos"),
  C(28, 3, "Apendicitis aguda", "Dr. James Lindsay"),
  C(29, 3, "Tumor carcinoide", "Dr. James Lindsay"),

  // Semana 4
  C(30, 4, "Cirugía torácica", "Dr. Ricardo Jaramillo"),
  C(31, 4, "Pleura, pulmón y mediastino", "Dr. Ricardo Jaramillo"),
  C(32, 4, "Cirugía vascular: enfermedades arteriales", "Dr. Gerardo Victoria"),
  C(33, 4, "Cirugía vascular: enfermedades venosas", "Dr. Gerardo Victoria"),
  C(34, 4, "Hernias de la pared abdominal I", "Dra. Debbie Wong"),
  C(35, 4, "Hernias de la pared abdominal II", "Dra. Debbie Wong"),
  C(36, 4, "Enfermedad diverticular del colon y vólvulos", "Dr. Edgardo Arcia"),
  C(37, 4, "Enfermedad inflamatoria intestinal", "Dr. Edgardo Arcia"),

  // Semana 5
  C(38, 5, "Abdomen agudo I", "Dr. Gerardo Victoria"),
  C(39, 5, "Abdomen agudo II", "Dr. Gerardo Victoria"),
  C(40, 5, "Imagenología en cirugía", "Dra. Debbie Wong"),
  C(41, 5, "Hernias, ostomías y drenajes", "Dra. Debbie Wong"),
  C(42, 5, "Psicología para cirujanos", "Dr. Luis G. Victoria", "especial"),
  C(43, 5, "Ética en cirugía", "Dr. Enrique Victoria", "especial"),
  C(44, 5, "Obstrucción intestinal", "Dra. Debbie Wong"),
  C(45, 5, "Problemas médicos en pacientes quirúrgicos", "Dra. Debbie Wong"),

  // Semana 6
  C(46, 6, "Pancreatitis aguda y crónica", "Dr. Moisés Cukier"),
  C(47, 6, "Neoplasias del páncreas", "Dr. Moisés Cukier"),
  C(48, 6, "Lesiones benignas de la mama", "Dr. Pablo Duran"),
  C(49, 6, "Tumores malignos de mama", "Dr. Pablo Duran"),
  C(50, 6, "Lesiones en la piel", "Dr. Pablo Duran"),
  C(51, 6, "Melanoma", "Dr. Pablo Duran"),
  C(52, 6, "Hígado: enfermedades benignas y tumores", "Dra. Lizka Richards"),
  C(53, 6, "Hipertensión portal, bazo, esplenectomía y trasplantes", "Dra. Lizka Richards"),

  // Semana 7
  C(54, 7, "Enfermedades del ano y recto", "Dr. Edgardo Arcia"),
  C(55, 7, "Tumores de colon, ano y recto", "Dr. Edgardo Arcia"),
  C(56, 7, "Tumores de cabeza y cuello", "Dr. Pablo Duran"),
  C(57, 7, "Tumores de esófago", "Dr. Pablo Duran"),
  C(58, 7, "Cirugía bariátrica metabólica y obesidad", "Dra. Debbie Wong"),
  C(59, 7, "Secuelas de la cirugía gastroduodenal", "Dra. Debbie Wong"),
  C(60, 7, "Enfermedades quirúrgicas pediátricas I", "Dr. Ramon Policart"),
  C(61, 7, "Enfermedades quirúrgicas pediátricas II", "Dr. Ramon Policart"),
];


/* ---------- Resúmenes con opciones extra (todo es opcional) ----------
   Lo normal es subir clase-NN.pdf y no escribir nada aquí. Usa este bloque solo si quieres:
   un enlace de Canva, fotos en esa clase, o escribir el resumen como texto.

   12: {
     enlace: "https://www.canva.com/design/XXXX/YYYY/view",
     fotos: ["clase12-1.jpg", "clase12-2.jpg"],
     resumen: `Texto del resumen. Deja una línea en blanco entre párrafos.

## Un subtítulo
- Una viñeta
- Otra viñeta

Puedes usar **negrita** y *cursiva*.`,
     claves: ["Punto clave 1", "Punto clave 2"],
     perla: "Una perla clínica.",
     preguntas: [ { p: "¿Pregunta?", r: "Respuesta." } ],
   },                                                                                                  */
const RESUMENES = {

};


/* ---------- Talleres ----------  (fotos: nombres de archivos dentro de "archivos") */
const TALLERES = [
  { tema: "Reto torácico", profe: "Dr. Gerardo Victoria", semana: 2, descripcion: "", archivo: "", enlace: "", fotos: [] },
  // { tema: "Nombre del taller", profe: "Dr. ...", semana: 3, descripcion: "Qué hicimos.", archivo: "", enlace: "", fotos: ["taller2-1.jpg"] },
];


/* ---------- Rotaciones ---------- */
const ROTACION = {
  hospital: "Hospital Susana Jones",
  bitacora: { archivo: "", enlace: "" },   // vacío = usa bitacora-completa.pdf si existe
  fotos: [],                                // fotos generales de toda la rotación
  // Cuando sepas por qué servicio vas a rotar, cambia "Servicio por definir".
  semanas: [
    { servicio: "Servicio por definir", nota: "", archivo: "", enlace: "", fotos: [] },
    { servicio: "Servicio por definir", nota: "", archivo: "", enlace: "", fotos: [] },
    { servicio: "Servicio por definir", nota: "", archivo: "", enlace: "", fotos: [] },
    { servicio: "Servicio por definir", nota: "", archivo: "", enlace: "", fotos: [] },
  ],
};


/* ---------- Multimedia (fotos y videos) ----------
   tipo: "foto" o "video".
   Fotos:  { tipo: "foto", archivo: "taller1.jpg", titulo: "Reto torácico", descripcion: "" }
   Videos: { tipo: "video", enlace: "https://www.youtube.com/watch?v=XXXX", titulo: "..." }
           { tipo: "video", archivo: "mi-video.mp4", titulo: "..." }   (máx. 25 MB desde la web de GitHub) */
const MULTIMEDIA = [
  // { tipo: "foto", archivo: "foto1.jpg", titulo: "Mi primera guardia", descripcion: "" },
];


/* ---------- Trabajos ----------
   { titulo: "Caso clínico de apendicitis", descripcion: "De qué trata.", fecha: "Septiembre 2026",
     archivo: "trabajo-apendicitis.pdf", enlace: "", fotos: [] } */
const TRABAJOS = [
  // { titulo: "", descripcion: "", fecha: "", archivo: "", enlace: "", fotos: [] },
];


/* ---------- Extras ----------
   Lo que quieras: guías, algoritmos, resúmenes de otros temas, enlaces útiles, etc.
   { titulo: "Nudos quirúrgicos", descripcion: "Guía rápida.", foto: "nudos.jpg", archivo: "nudos.pdf", enlace: "" } */
const EXTRAS = [
  // { titulo: "", descripcion: "", foto: "", archivo: "", enlace: "" },
];
