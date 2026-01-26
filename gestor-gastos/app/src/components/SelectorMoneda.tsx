/**
 * Selector de moneda para formularios de gastos/ingresos
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTema } from '../context/TemaContext';
import { useMonedas } from '../context/MonedasContext';
import { obtenerMonedaPorCodigo } from '../constants/monedas';

interface Props {
  monedaSeleccionada: string;
  onSeleccionar: (codigo: string) => void;
}

export const SelectorMoneda = ({ monedaSeleccionada, onSeleccionar }: Props) => {
  const { tema } = useTema();
  const { monedas, monedaBase } = useMonedas();

  // Si solo hay una moneda, no mostrar el selector
  if (monedas.length === 1) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: tema.colores.textoSecundario }]}>
        Moneda:
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {monedas.map(moneda => {
          const info = obtenerMonedaPorCodigo(moneda.codigo);
          const seleccionada = monedaSeleccionada === moneda.codigo;

          return (
            <TouchableOpacity
              key={moneda.codigo}
              style={[
                styles.opcion,
                {
                  backgroundColor: seleccionada
                    ? tema.colores.primario
                    : tema.colores.fondoSecundario,
                  borderColor: seleccionada
                    ? tema.colores.primario
                    : tema.colores.bordes,
                },
              ]}
              onPress={() => onSeleccionar(moneda.codigo)}
            >
              <Text style={styles.emoji}>{info?.emoji || '💱'}</Text>
              <Text
                style={[
                  styles.codigo,
                  {
                    color: seleccionada ? '#fff' : tema.colores.texto,
                    fontWeight: seleccionada ? 'bold' : 'normal',
                  },
                ]}
              >
                {moneda.codigo}
              </Text>
              {moneda.esMonedaBase && (
                <Text style={styles.estrella}>⭐</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  scrollView: {
    flexGrow: 0,
  },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    marginRight: 8,
    minWidth: 80,
  },
  emoji: {
    fontSize: 18,
    marginRight: 6,
  },
  codigo: {
    fontSize: 14,
  },
  estrella: {
    fontSize: 10,
    marginLeft: 4,
  },
});
