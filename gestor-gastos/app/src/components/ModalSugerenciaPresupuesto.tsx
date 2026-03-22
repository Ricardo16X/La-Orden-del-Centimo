/**
 * Modal de sugerencia de presupuesto dinámico
 * Muestra el presupuesto sugerido para el mes actual basado en datos históricos
 * y metas de ahorro activas. El usuario puede ajustar montos antes de confirmar.
 */

import {
  Modal, View, Text, ScrollView, StyleSheet,
  TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useTema } from '../context/TemaContext';
import { useCategorias } from '../context/CategoriasContext';
import { usePresupuestos } from '../context/PresupuestosContext';
import { useSugerenciaPresupuesto } from '../hooks/useSugerenciaPresupuesto';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const ModalSugerenciaPresupuesto = ({ visible, onClose }: Props) => {
  const { tema } = useTema();
  const { categorias } = useCategorias();
  const { agregarPresupuesto, editarPresupuesto, obtenerPresupuestoPorCategoria } = usePresupuestos();

  const resultado = useSugerenciaPresupuesto();
  const [montosEditados, setMontosEditados] = useState<Record<string, string>>({});

  // Inicializar montos editados cuando cambian las sugerencias
  useEffect(() => {
    if (visible) {
      const inicial: Record<string, string> = {};
      resultado.sugerencias.forEach(s => {
        inicial[s.categoriaId] = s.montoSugerido.toString();
      });
      setMontosEditados(inicial);
    }
  }, [visible, resultado.sugerencias]);

  const obtenerCategoria = (id: string) => categorias.find(c => c.id === id);

  const handleConfirmar = () => {
    const sugerenciasValidas = resultado.sugerencias.filter(s => {
      const monto = parseFloat(montosEditados[s.categoriaId] || '0');
      return monto > 0;
    });

    if (sugerenciasValidas.length === 0) {
      Alert.alert('Sin cambios', 'Ajusta al menos un monto antes de confirmar.');
      return;
    }

    sugerenciasValidas.forEach(s => {
      const monto = parseFloat(montosEditados[s.categoriaId]);
      const existente = obtenerPresupuestoPorCategoria(s.categoriaId);

      if (existente && existente.periodo === 'mensual') {
        editarPresupuesto(existente.id, { monto });
      } else {
        agregarPresupuesto({
          categoriaId: s.categoriaId,
          monto,
          periodo: 'mensual',
          alertaEn: 80,
          monedaId: resultado.monedaBaseId,
        });
      }
    });

    Alert.alert(
      '✅ Presupuesto aplicado',
      `Se configuraron ${sugerenciasValidas.length} presupuestos para ${resultado.mesSugeridoLabel}.`,
      [{ text: 'Listo', onPress: onClose }]
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: tema.colores.fondo }]}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.titulo, { color: tema.colores.primario }]}>
              ✨ Presupuesto Sugerido
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={[styles.cerrar, { color: tema.colores.textoSecundario }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.subtituloMes, { color: tema.colores.textoSecundario }]}>
            Para {resultado.mesSugeridoLabel} · basado en {resultado.mesAnalizadoLabel}
          </Text>

          {/* Advertencia de datos insuficientes */}
          {!resultado.suficientesDatos && (
            <View style={[styles.advertencia, { backgroundColor: '#f59e0b20', borderColor: '#f59e0b' }]}>
              <Text style={[styles.advertenciaTexto, { color: '#f59e0b' }]}>
                ⚠️{' '}
                {resultado.totalTransacciones === 0
                  ? `No hay gastos registrados en ${resultado.mesAnalizadoLabel}. Ingresa al menos ${resultado.minTransacciones} transacciones en un mes para recibir una sugerencia personalizada.`
                  : `Solo tienes ${resultado.totalTransacciones} transacción${resultado.totalTransacciones > 1 ? 'es' : ''} en ${resultado.mesAnalizadoLabel}. Se recomiendan al menos ${resultado.minTransacciones} para una mejor sugerencia.`
                }
              </Text>
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false} style={styles.contenido}>

            {/* Resumen financiero — solo mostrar si hay ingresos registrados */}
            {resultado.ingresosMes > 0 && <View style={[styles.resumenCard, { backgroundColor: tema.colores.fondoSecundario, borderColor: tema.colores.bordes }]}>
              <Text style={[styles.resumenTitulo, { color: tema.colores.texto }]}>Resumen del mes</Text>

              <View style={styles.resumenFila}>
                <Text style={[styles.resumenLabel, { color: tema.colores.textoSecundario }]}>
                  💰 Ingresos ({resultado.mesAnalizadoLabel})
                </Text>
                <Text style={[styles.resumenValor, { color: tema.colores.texto }]}>
                  {resultado.monedaBaseSimbolo}{resultado.ingresosMes.toFixed(2)}
                </Text>
              </View>

              {resultado.ahorroMetas > 0 && (
                <View style={styles.resumenFila}>
                  <Text style={[styles.resumenLabel, { color: tema.colores.textoSecundario }]}>
                    🎯 Reserva para metas
                  </Text>
                  <Text style={[styles.resumenValor, { color: '#ef4444' }]}>
                    −{resultado.monedaBaseSimbolo}{resultado.ahorroMetas.toFixed(2)}
                  </Text>
                </View>
              )}

              {resultado.totalRecurrentes > 0 && (
                <View style={styles.resumenFila}>
                  <Text style={[styles.resumenLabel, { color: tema.colores.textoSecundario }]}>
                    🔄 Gastos Recurrentes
                  </Text>
                  <Text style={[styles.resumenValor, { color: '#ef4444' }]}>
                    −{resultado.monedaBaseSimbolo}{resultado.totalRecurrentes.toFixed(2)}
                  </Text>
                </View>
              )}

              <View style={[styles.resumenSeparador, { backgroundColor: tema.colores.bordes }]} />

              <View style={styles.resumenFila}>
                <Text style={[styles.resumenLabelDestacado, { color: tema.colores.texto }]}>
                  Disponible para gastar
                </Text>
                <Text style={[styles.resumenValorDestacado, { color: tema.colores.primario }]}>
                  {resultado.monedaBaseSimbolo}{resultado.disponible.toFixed(2)}
                </Text>
              </View>
            </View>}

            {/* Sin datos */}
            {resultado.sugerencias.length === 0 && (
              <View style={styles.sinDatos}>
                <Text style={[styles.sinDatosTexto, { color: tema.colores.textoSecundario }]}>
                  No hay gastos registrados en {resultado.mesAnalizadoLabel} para generar sugerencias.
                </Text>
              </View>
            )}

            {/* Lista de categorías sugeridas */}
            {resultado.sugerencias.length > 0 && (
              <>
                <Text style={[styles.seccionTitulo, { color: tema.colores.texto }]}>
                  Ajusta los montos por categoría
                </Text>

                {resultado.sugerencias.map(s => {
                  const cat = obtenerCategoria(s.categoriaId);
                  const emoji = cat?.emoji ?? '📦';
                  const nombre = cat?.nombre ?? s.categoriaId;
                  const borderColor = s.tienePresupuesto ? tema.colores.primario : tema.colores.bordes;
                  return (
                    <View
                      key={s.categoriaId}
                      style={[styles.categoriaFila, { backgroundColor: tema.colores.fondoSecundario, borderColor }]}
                    >
                      <View style={styles.categoriaInfo}>
                        <Text style={styles.categoriaEmoji}>{emoji}</Text>
                        <View>
                          <View style={styles.categoriaHeaderFila}>
                            <Text style={[styles.categoriaNombre, { color: tema.colores.texto }]}>
                              {nombre}
                            </Text>
                            {s.tienePresupuesto
                              ? <Text style={[styles.badge, { backgroundColor: tema.colores.primario + '22', color: tema.colores.primario }]}>actualizar</Text>
                              : <Text style={[styles.badge, { backgroundColor: '#10b98122', color: '#10b981' }]}>nuevo</Text>
                            }
                          </View>
                          <Text style={[styles.categoriaHistorico, { color: tema.colores.textoSecundario }]}>
                            Histórico: {resultado.monedaBaseSimbolo}{s.montoHistorico.toFixed(0)} · {Math.round(s.proporcion * 100)}%
                          </Text>
                        </View>
                      </View>
                      <View style={styles.inputContainer}>
                        <Text style={[styles.simbolo, { color: tema.colores.textoSecundario }]}>
                          {resultado.monedaBaseSimbolo}
                        </Text>
                        <TextInput
                          style={[styles.inputMonto, { color: tema.colores.texto, borderColor: tema.colores.bordes }]}
                          keyboardType="numeric"
                          value={montosEditados[s.categoriaId] ?? s.montoSugerido.toString()}
                          onChangeText={v => setMontosEditados(prev => ({ ...prev, [s.categoriaId]: v }))}
                          selectTextOnFocus
                        />
                      </View>
                    </View>
                  );
                })}
              </>
            )}
          </ScrollView>

          {/* Botones */}
          <View style={styles.botones}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.botonSecundario, { borderColor: tema.colores.bordes }]}
            >
              <Text style={[styles.botonSecundarioTexto, { color: tema.colores.textoSecundario }]}>
                Ignorar
              </Text>
            </TouchableOpacity>

            {resultado.sugerencias.length > 0 && (
              <TouchableOpacity
                onPress={handleConfirmar}
                style={[styles.botonPrimario, { backgroundColor: tema.colores.primario }]}
              >
                <Text style={styles.botonPrimarioTexto}>Aplicar presupuesto</Text>
              </TouchableOpacity>
            )}
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: '92%',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  cerrar: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  subtituloMes: {
    fontSize: 13,
    marginBottom: 14,
  },
  advertencia: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  advertenciaTexto: {
    fontSize: 13,
    lineHeight: 18,
  },
  contenido: {
    flex: 1,
  },
  resumenCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 8,
  },
  resumenTitulo: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  resumenFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resumenLabel: {
    fontSize: 13,
  },
  resumenValor: {
    fontSize: 13,
    fontWeight: '600',
  },
  resumenLabelDestacado: {
    fontSize: 14,
    fontWeight: '700',
  },
  resumenValorDestacado: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resumenSeparador: {
    height: 1,
    marginVertical: 4,
  },
  seccionTitulo: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  categoriaFila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  categoriaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  categoriaEmoji: {
    fontSize: 24,
  },
  categoriaHeaderFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  categoriaNombre: {
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  categoriaHistorico: {
    fontSize: 11,
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  simbolo: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputMonto: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 15,
    fontWeight: '600',
    width: 90,
    textAlign: 'right',
  },
  sinDatos: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  sinDatosTexto: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  botones: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  botonSecundario: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botonSecundarioTexto: {
    fontSize: 15,
    fontWeight: '600',
  },
  botonPrimario: {
    flex: 2,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botonPrimarioTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
