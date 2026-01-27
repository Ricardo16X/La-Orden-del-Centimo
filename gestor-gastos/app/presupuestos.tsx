import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useTema } from './src/context/TemaContext';
import { useCategorias } from './src/context/CategoriasContext';
import { usePresupuestos } from './src/context/PresupuestosContext';
import { useMonedas } from './src/context/MonedasContext';

const PERIODOS = [
  { id: 'semanal', nombre: 'Semanal', emoji: '📅' },
  { id: 'mensual', nombre: 'Mensual', emoji: '🗓️' },
  { id: 'anual', nombre: 'Anual', emoji: '📆' },
] as const;

export default function PresupuestosScreen() {
  const { tema } = useTema();
  const { categorias } = useCategorias();
  const { presupuestos, agregarPresupuesto, editarPresupuesto, eliminarPresupuesto } = usePresupuestos();
  const { monedaBase } = useMonedas();

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [monto, setMonto] = useState('');
  const [periodo, setPeriodo] = useState<'semanal' | 'mensual' | 'anual'>('mensual');
  const [alertaEn, setAlertaEn] = useState('80');

  const resetFormulario = () => {
    setCategoriaSeleccionada('');
    setMonto('');
    setPeriodo('mensual');
    setAlertaEn('80');
  };

  const handleAgregar = () => {
    if (!categoriaSeleccionada) {
      Alert.alert('Error', 'Por favor selecciona una categoría');
      return;
    }

    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    const alertaNum = parseFloat(alertaEn);
    if (isNaN(alertaNum) || alertaNum < 0 || alertaNum > 100) {
      Alert.alert('Error', 'El porcentaje de alerta debe estar entre 0 y 100');
      return;
    }

    // Verificar si ya existe un presupuesto para esta categoría
    const existente = presupuestos.find(
      p => p.categoriaId === categoriaSeleccionada && p.periodo === periodo
    );

    if (existente) {
      Alert.alert(
        'Actualizar presupuesto',
        '¿Deseas actualizar el presupuesto existente para esta categoría?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Actualizar',
            onPress: () => {
              editarPresupuesto(existente.id, {
                monto: montoNum,
                alertaEn: alertaNum,
              });
              resetFormulario();
              Alert.alert('Éxito', 'Presupuesto actualizado correctamente');
            },
          },
        ]
      );
      return;
    }

    agregarPresupuesto({
      categoriaId: categoriaSeleccionada,
      monto: montoNum,
      periodo,
      alertaEn: alertaNum,
    });

    resetFormulario();
    Alert.alert('Éxito', 'Presupuesto agregado correctamente');
  };

  const handleEliminar = (id: string) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de eliminar este presupuesto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            eliminarPresupuesto(id);
            Alert.alert('Eliminado', 'Presupuesto eliminado correctamente');
          },
        },
      ]
    );
  };

  const obtenerNombreCategoria = (id: string) => {
    const categoria = categorias.find(c => c.id === id);
    return categoria ? `${categoria.emoji} ${categoria.nombre}` : 'Categoría';
  };

  return (
    <View style={[styles.container, { backgroundColor: tema.colores.fondo }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={[styles.botonVolver, { color: tema.colores.primario }]}>← Volver</Text>
        </TouchableOpacity>
        <Text style={[styles.titulo, { color: tema.colores.primario }]}>Presupuestos</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Formulario para agregar nuevo presupuesto */}
            <View style={[styles.seccion, { borderColor: tema.colores.bordes }]}>
              <Text style={[styles.subtitulo, { color: tema.colores.primario }]}>
                ➕ Nuevo Presupuesto
              </Text>

              {/* Selector de categoría */}
              <Text style={[styles.label, { color: tema.colores.texto }]}>Categoría:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriasScroll}>
                {categorias.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setCategoriaSeleccionada(cat.id)}
                    style={[
                      styles.categoriaChip,
                      {
                        backgroundColor: categoriaSeleccionada === cat.id
                          ? tema.colores.primario
                          : tema.colores.fondoSecundario,
                        borderColor: cat.color,
                      }
                    ]}
                  >
                    <Text style={styles.categoriaEmoji}>{cat.emoji}</Text>
                    <Text style={[
                      styles.categoriaNombre,
                      { color: categoriaSeleccionada === cat.id ? '#fff' : tema.colores.texto }
                    ]}>
                      {cat.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Selector de período */}
              <Text style={[styles.label, { color: tema.colores.texto }]}>Período:</Text>
              <View style={styles.periodosContainer}>
                {PERIODOS.map(p => (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => setPeriodo(p.id)}
                    style={[
                      styles.periodoBoton,
                      {
                        backgroundColor: periodo === p.id
                          ? tema.colores.primario
                          : tema.colores.fondoSecundario,
                        borderColor: tema.colores.bordes,
                      }
                    ]}
                  >
                    <Text style={styles.periodoEmoji}>{p.emoji}</Text>
                    <Text style={[
                      styles.periodoTexto,
                      { color: periodo === p.id ? '#fff' : tema.colores.texto }
                    ]}>
                      {p.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Monto */}
              <Text style={[styles.label, { color: tema.colores.texto }]}>Monto del presupuesto:</Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: tema.colores.fondoSecundario,
                  borderColor: tema.colores.bordes,
                  color: tema.colores.texto,
                }]}
                placeholder="0.00"
                placeholderTextColor={tema.colores.textoSecundario}
                keyboardType="numeric"
                value={monto}
                onChangeText={setMonto}
              />

              {/* Porcentaje de alerta */}
              <Text style={[styles.label, { color: tema.colores.texto }]}>
                Alertar al alcanzar (%):</Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: tema.colores.fondoSecundario,
                  borderColor: tema.colores.bordes,
                  color: tema.colores.texto,
                }]}
                placeholder="80"
                placeholderTextColor={tema.colores.textoSecundario}
                keyboardType="numeric"
                value={alertaEn}
                onChangeText={setAlertaEn}
              />
              <Text style={[styles.hint, { color: tema.colores.textoSecundario }]}>
                Te avisaremos cuando alcances este porcentaje del presupuesto
              </Text>

              {/* Botón agregar */}
              <TouchableOpacity
                onPress={handleAgregar}
                style={[styles.botonAgregar, { backgroundColor: tema.colores.primario }]}
              >
                <Text style={styles.botonTexto}>➕ Agregar Presupuesto</Text>
              </TouchableOpacity>
            </View>

            {/* Lista de presupuestos existentes */}
            <View style={[styles.seccion, { borderColor: tema.colores.bordes }]}>
              <Text style={[styles.subtitulo, { color: tema.colores.primario }]}>
                📋 Presupuestos Actuales
              </Text>

              {presupuestos.length === 0 ? (
                <Text style={[styles.vacio, { color: tema.colores.textoSecundario }]}>
                  No tienes presupuestos configurados
                </Text>
              ) : (
                presupuestos.map(p => (
                  <View
                    key={p.id}
                    style={[styles.presupuestoItem, {
                      backgroundColor: tema.colores.fondoSecundario,
                      borderColor: tema.colores.bordes,
                    }]}
                  >
                    <View style={styles.presupuestoInfo}>
                      <Text style={[styles.presupuestoCategoria, { color: tema.colores.texto }]}>
                        {obtenerNombreCategoria(p.categoriaId)}
                      </Text>
                      <Text style={[styles.presupuestoDetalle, { color: tema.colores.textoSecundario }]}>
                        {PERIODOS.find(per => per.id === p.periodo)?.nombre} • {monedaBase?.simbolo}{p.monto.toFixed(2)}
                      </Text>
                      <Text style={[styles.presupuestoDetalle, { color: tema.colores.textoSecundario }]}>
                        Alerta al {p.alertaEn}%
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleEliminar(p.id)}
                      style={styles.botonEliminar}
                    >
                      <Text style={styles.botonEliminarTexto}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  botonVolver: {
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  seccion: {
    borderWidth: 2,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  cerrar: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    marginTop: 5,
    fontStyle: 'italic',
  },
  categoriasScroll: {
    marginBottom: 10,
  },
  categoriaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
  },
  categoriaEmoji: {
    fontSize: 20,
    marginRight: 5,
  },
  categoriaNombre: {
    fontSize: 14,
    fontWeight: '600',
  },
  periodosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  periodoBoton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
  },
  periodoEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  periodoTexto: {
    fontSize: 12,
    fontWeight: '600',
  },
  botonAgregar: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  botonTexto: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  vacio: {
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  presupuestoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    marginBottom: 10,
  },
  presupuestoInfo: {
    flex: 1,
  },
  presupuestoCategoria: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  presupuestoDetalle: {
    fontSize: 12,
    marginBottom: 2,
  },
  botonEliminar: {
    padding: 10,
  },
  botonEliminarTexto: {
    fontSize: 24,
  },
});
