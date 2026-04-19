// Sistema tipográfico estándar de la aplicación
export const fs = {
  h1: 28,    // Títulos principales de pantalla
  h2: 22,    // Títulos de modal / encabezados de sección mayor
  h3: 20,    // Subtítulos de sección
  h4: 18,    // Títulos de tarjeta / ítem de lista
  body: 16,  // Texto principal
  sm: 14,    // Texto secundario / descripciones
  label: 13, // Etiquetas de formulario / metadatos
  xs: 12,    // Captions / información menor
  xxs: 11,   // Texto mínimo
} as const;

export const fw = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: 'bold' as const,
};
