/**
 * Script de seed de datos de prueba
 * Genera registros para Enero y Febrero 2026
 * Formato compatible con el sistema de backup de la app
 */

const fs = require('fs');

let idCounter = 1700000000000;
const generarId = () => (idCounter++).toString();

const fecha = (anio, mes, dia, hora = 10, min = 0) =>
  new Date(anio, mes - 1, dia, hora, min, 0).toISOString();

// Categorías disponibles (sin ahorro_metas ni transferencia)
const CATS = ['comida', 'transporte', 'equipo', 'pociones', 'vivienda', 'entrenamiento', 'otros'];

const gastos = [];

// ─── ENERO 2026 ────────────────────────────────────────────────
// Ingresos
gastos.push({ id: generarId(), monto: 8500, descripcion: 'Salario enero', fecha: fecha(2026,1,5,9), categoria: 'otros', tipo: 'ingreso', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 8500 });
gastos.push({ id: generarId(), monto: 1200, descripcion: 'Freelance diseño web', fecha: fecha(2026,1,15,14), categoria: 'otros', tipo: 'ingreso', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 1200 });

// Gastos enero
gastos.push({ id: generarId(), monto: 350, descripcion: 'Supermercado La Torre', fecha: fecha(2026,1,3,11), categoria: 'comida', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 350 });
gastos.push({ id: generarId(), monto: 45, descripcion: 'Almuerzo trabajo', fecha: fecha(2026,1,4,13), categoria: 'comida', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 45 });
gastos.push({ id: generarId(), monto: 280, descripcion: 'Supermercado Walmart', fecha: fecha(2026,1,10,10), categoria: 'comida', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 280 });
gastos.push({ id: generarId(), monto: 65, descripcion: 'Cena restaurante', fecha: fecha(2026,1,17,20), categoria: 'comida', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 65 });
gastos.push({ id: generarId(), monto: 320, descripcion: 'Supermercado semanal', fecha: fecha(2026,1,24,11), categoria: 'comida', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 320 });
gastos.push({ id: generarId(), monto: 55, descripcion: 'Almuerzo con compañeros', fecha: fecha(2026,1,28,13), categoria: 'comida', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 55 });

gastos.push({ id: generarId(), monto: 180, descripcion: 'Gasolina', fecha: fecha(2026,1,2,8), categoria: 'transporte', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 180 });
gastos.push({ id: generarId(), monto: 25, descripcion: 'Bus urbano semana', fecha: fecha(2026,1,7,7), categoria: 'transporte', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 25 });
gastos.push({ id: generarId(), monto: 175, descripcion: 'Gasolina semana 2', fecha: fecha(2026,1,14,8), categoria: 'transporte', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 175 });
gastos.push({ id: generarId(), monto: 40, descripcion: 'Taxi al aeropuerto', fecha: fecha(2026,1,20,6), categoria: 'transporte', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 40 });
gastos.push({ id: generarId(), monto: 160, descripcion: 'Gasolina fin de mes', fecha: fecha(2026,1,27,8), categoria: 'transporte', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 160 });

gastos.push({ id: generarId(), monto: 1800, descripcion: 'Alquiler enero', fecha: fecha(2026,1,1,9), categoria: 'vivienda', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 1800 });
gastos.push({ id: generarId(), monto: 145, descripcion: 'Electricidad', fecha: fecha(2026,1,8,10), categoria: 'vivienda', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 145 });
gastos.push({ id: generarId(), monto: 85, descripcion: 'Internet + cable', fecha: fecha(2026,1,10,10), categoria: 'vivienda', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 85 });
gastos.push({ id: generarId(), monto: 60, descripcion: 'Agua potable', fecha: fecha(2026,1,12,10), categoria: 'vivienda', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 60 });

gastos.push({ id: generarId(), monto: 35, descripcion: 'Café Barista mañana', fecha: fecha(2026,1,3,8), categoria: 'pociones', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 35 });
gastos.push({ id: generarId(), monto: 28, descripcion: 'Starbucks reunión', fecha: fecha(2026,1,9,10), categoria: 'pociones', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 28 });
gastos.push({ id: generarId(), monto: 32, descripcion: 'Café Juan Valdez', fecha: fecha(2026,1,16,9), categoria: 'pociones', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 32 });
gastos.push({ id: generarId(), monto: 30, descripcion: 'Café viernes', fecha: fecha(2026,1,23,8), categoria: 'pociones', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 30 });

gastos.push({ id: generarId(), monto: 250, descripcion: 'Ropa nueva temporada', fecha: fecha(2026,1,6,15), categoria: 'equipo', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 250 });
gastos.push({ id: generarId(), monto: 450, descripcion: 'Teclado mecánico', fecha: fecha(2026,1,13,16), categoria: 'equipo', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 450 });
gastos.push({ id: generarId(), monto: 120, descripcion: 'Zapatos trabajo', fecha: fecha(2026,1,22,14), categoria: 'equipo', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 120 });

gastos.push({ id: generarId(), monto: 150, descripcion: 'Gym mensualidad', fecha: fecha(2026,1,5,7), categoria: 'entrenamiento', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 150 });
gastos.push({ id: generarId(), monto: 80, descripcion: 'Suplementos proteína', fecha: fecha(2026,1,18,12), categoria: 'entrenamiento', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 80 });

gastos.push({ id: generarId(), monto: 95, descripcion: 'Netflix + Spotify', fecha: fecha(2026,1,1,12), categoria: 'otros', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 95 });
gastos.push({ id: generarId(), monto: 200, descripcion: 'Médico consulta', fecha: fecha(2026,1,19,11), categoria: 'otros', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 200 });
gastos.push({ id: generarId(), monto: 75, descripcion: 'Barbería', fecha: fecha(2026,1,25,11), categoria: 'otros', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 75 });

// ─── FEBRERO 2026 ──────────────────────────────────────────────
// Ingresos
gastos.push({ id: generarId(), monto: 8500, descripcion: 'Salario febrero', fecha: fecha(2026,2,5,9), categoria: 'otros', tipo: 'ingreso', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 8500 });
gastos.push({ id: generarId(), monto: 800, descripcion: 'Venta equipo viejo', fecha: fecha(2026,2,18,16), categoria: 'otros', tipo: 'ingreso', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 800 });

// Gastos febrero
gastos.push({ id: generarId(), monto: 310, descripcion: 'Supermercado semana 1', fecha: fecha(2026,2,1,11), categoria: 'comida', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 310 });
gastos.push({ id: generarId(), monto: 50, descripcion: 'Almuerzo trabajo', fecha: fecha(2026,2,5,13), categoria: 'comida', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 50 });
gastos.push({ id: generarId(), monto: 295, descripcion: 'Supermercado semana 2', fecha: fecha(2026,2,8,10), categoria: 'comida', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 295 });
gastos.push({ id: generarId(), monto: 180, descripcion: 'Cena San Valentín', fecha: fecha(2026,2,14,20), categoria: 'comida', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 180 });
gastos.push({ id: generarId(), monto: 340, descripcion: 'Supermercado semana 3', fecha: fecha(2026,2,15,11), categoria: 'comida', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 340 });
gastos.push({ id: generarId(), monto: 60, descripcion: 'Pizzas viernes', fecha: fecha(2026,2,20,20), categoria: 'comida', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 60 });
gastos.push({ id: generarId(), monto: 270, descripcion: 'Supermercado fin de mes', fecha: fecha(2026,2,22,10), categoria: 'comida', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 270 });

gastos.push({ id: generarId(), monto: 185, descripcion: 'Gasolina', fecha: fecha(2026,2,2,8), categoria: 'transporte', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 185 });
gastos.push({ id: generarId(), monto: 30, descripcion: 'Bus urbano', fecha: fecha(2026,2,9,7), categoria: 'transporte', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 30 });
gastos.push({ id: generarId(), monto: 170, descripcion: 'Gasolina semana 2', fecha: fecha(2026,2,16,8), categoria: 'transporte', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 170 });
gastos.push({ id: generarId(), monto: 155, descripcion: 'Gasolina semana 3', fecha: fecha(2026,2,23,8), categoria: 'transporte', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 155 });

gastos.push({ id: generarId(), monto: 1800, descripcion: 'Alquiler febrero', fecha: fecha(2026,2,1,9), categoria: 'vivienda', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 1800 });
gastos.push({ id: generarId(), monto: 138, descripcion: 'Electricidad', fecha: fecha(2026,2,7,10), categoria: 'vivienda', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 138 });
gastos.push({ id: generarId(), monto: 85, descripcion: 'Internet + cable', fecha: fecha(2026,2,10,10), categoria: 'vivienda', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 85 });
gastos.push({ id: generarId(), monto: 55, descripcion: 'Gas propano', fecha: fecha(2026,2,19,11), categoria: 'vivienda', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 55 });

gastos.push({ id: generarId(), monto: 38, descripcion: 'Café mañana', fecha: fecha(2026,2,3,8), categoria: 'pociones', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 38 });
gastos.push({ id: generarId(), monto: 42, descripcion: 'Café San Valentín', fecha: fecha(2026,2,14,11), categoria: 'pociones', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 42 });
gastos.push({ id: generarId(), monto: 35, descripcion: 'Café viernes', fecha: fecha(2026,2,21,9), categoria: 'pociones', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 35 });

gastos.push({ id: generarId(), monto: 380, descripcion: 'Audífonos inalámbricos', fecha: fecha(2026,2,4,15), categoria: 'equipo', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 380 });
gastos.push({ id: generarId(), monto: 150, descripcion: 'Mochila nueva', fecha: fecha(2026,2,17,14), categoria: 'equipo', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 150 });

gastos.push({ id: generarId(), monto: 150, descripcion: 'Gym mensualidad', fecha: fecha(2026,2,5,7), categoria: 'entrenamiento', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 150 });
gastos.push({ id: generarId(), monto: 65, descripcion: 'Clase de yoga', fecha: fecha(2026,2,12,18), categoria: 'entrenamiento', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 65 });
gastos.push({ id: generarId(), monto: 90, descripcion: 'Suplementos vitaminas', fecha: fecha(2026,2,25,12), categoria: 'entrenamiento', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 90 });

gastos.push({ id: generarId(), monto: 95, descripcion: 'Netflix + Spotify', fecha: fecha(2026,2,1,12), categoria: 'otros', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 95 });
gastos.push({ id: generarId(), monto: 120, descripcion: 'Regalo cumpleaños amigo', fecha: fecha(2026,2,11,16), categoria: 'otros', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 120 });
gastos.push({ id: generarId(), monto: 250, descripcion: 'Farmacia', fecha: fecha(2026,2,26,11), categoria: 'otros', tipo: 'gasto', moneda: 'GTQ', tipoCambio: 1, montoEnMonedaBase: 250 });

// ─── RESUMEN ───────────────────────────────────────────────────
const enero = gastos.filter(g => new Date(g.fecha).getMonth() === 0);
const febrero = gastos.filter(g => new Date(g.fecha).getMonth() === 1);
const ingEnero = enero.filter(g => g.tipo === 'ingreso').reduce((s, g) => s + g.monto, 0);
const gastEnero = enero.filter(g => g.tipo === 'gasto').reduce((s, g) => s + g.monto, 0);
const ingFeb = febrero.filter(g => g.tipo === 'ingreso').reduce((s, g) => s + g.monto, 0);
const gastFeb = febrero.filter(g => g.tipo === 'gasto').reduce((s, g) => s + g.monto, 0);

console.log(`\n📊 RESUMEN DEL SEED`);
console.log(`Enero  → ${enero.length} registros | Ingresos: Q${ingEnero} | Gastos: Q${gastEnero} | Balance: Q${ingEnero - gastEnero}`);
console.log(`Febrero → ${febrero.length} registros | Ingresos: Q${ingFeb} | Gastos: Q${gastFeb} | Balance: Q${ingFeb - gastFeb}`);
console.log(`Total registros: ${gastos.length}\n`);

// Generar backup
const backup = {
  version: '1.0.0',
  fecha: new Date().toISOString(),
  datos: {
    gastos: JSON.stringify(gastos),
  },
};

const outputPath = '/home/ricardo16x/Documentos/La-Orden-del-Centimo/seed-backup.json';
fs.writeFileSync(outputPath, JSON.stringify(backup, null, 2));
console.log(`✅ Archivo generado: ${outputPath}`);
console.log(`📱 Ejecuta el siguiente comando para copiarlo al dispositivo:`);
console.log(`   adb push ${outputPath} /sdcard/Download/seed-backup.json\n`);
