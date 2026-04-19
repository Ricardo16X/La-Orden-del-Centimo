import { View, Text, StyleSheet } from 'react-native';
import { useState } from 'react';
import Svg, { Path, G, Circle } from 'react-native-svg';
import { useTema } from '../context/TemaContext';
import { useCategorias } from '../context/CategoriasContext';
import { useMonedas } from '../context/MonedasContext';

interface Props {
  datos: Array<{
    categoriaId: string;
    total: number;
  }>;
  onSelect?: (categoriaId: string | null) => void;
}

const COLORES = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

export const GraficaPastel = ({ datos, onSelect }: Props) => {
  const { tema } = useTema();
  const { categorias } = useCategorias();
  const { monedaBase } = useMonedas();
  const simbolo = monedaBase?.simbolo || '$';
  const [containerWidth, setContainerWidth] = useState(0);
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(null);

  const handlePress = (id: string) => {
    const next = seleccionadaId === id ? null : id;
    setSeleccionadaId(next);
    onSelect?.(next);
  };

  if (datos.length === 0) {
    return (
      <View style={styles.vacio}>
        <Text style={[styles.textoVacio, { color: tema.colores.textoSecundario }]}>
          No hay datos para mostrar
        </Text>
      </View>
    );
  }

  const total = datos.reduce((sum, d) => sum + d.total, 0);

  const items = [...datos]
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
    .map((item, index) => {
      const categoria = categorias.find(c => c.id === item.categoriaId);
      return {
        categoriaId: item.categoriaId,
        nombre: categoria?.nombre || 'Otros',
        emoji: categoria?.emoji || '📦',
        total: item.total,
        porcentaje: total > 0 ? (item.total / total) * 100 : 0,
        color: COLORES[index % COLORES.length],
      };
    });

  const size = containerWidth > 0 ? containerWidth : 260;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;

  let currentAngle = 0;
  const slices = items.map(item => {
    const angle = (item.total / total) * 360;
    const path = slicePath(cx, cy, r, currentAngle, currentAngle + angle);
    currentAngle += angle;
    return { ...item, path };
  });

  return (
    <View
      style={styles.container}
      onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {containerWidth > 0 && (
        <Svg width={size} height={size}>
          <G>
            {slices.map((slice, i) => {
              const seleccionada = seleccionadaId === slice.categoriaId;
              return (
                <Path
                  key={i}
                  d={slice.path}
                  fill={slice.color}
                  stroke={seleccionada ? '#fff' : tema.colores.fondoSecundario}
                  strokeWidth={seleccionada ? 4 : 2}
                  onPress={() => handlePress(slice.categoriaId)}
                />
              );
            })}
            {/* Círculo interior para efecto dona — tapa las colitas del centro */}
            <Circle cx={cx} cy={cy} r={r * 0.45} fill={tema.colores.fondoSecundario} />
          </G>
        </Svg>
      )}

      {/* Leyenda en grid de 2 columnas */}
      <View style={styles.leyenda}>
        {items.map((item, index) => {
          const seleccionada = seleccionadaId === item.categoriaId;
          return (
            <View key={index} style={styles.leyendaItem}>
              <View style={[styles.leyendaDot, { backgroundColor: item.color }]} />
              <View style={styles.leyendaTextos}>
                <Text
                  style={[styles.leyendaNombre, { color: tema.colores.texto, fontWeight: seleccionada ? 'bold' : '600' }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.emoji} {item.nombre}
                </Text>
                <Text style={[styles.leyendaMonto, { color: tema.colores.textoSecundario }]}>
                  {simbolo}{item.total.toFixed(2)} · {item.porcentaje.toFixed(1)}%
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  vacio: {
    padding: 30,
    alignItems: 'center',
  },
  textoVacio: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  leyenda: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  leyendaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '47%',
    gap: 6,
  },
  leyendaDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 3,
    flexShrink: 0,
  },
  leyendaTextos: {
    flex: 1,
  },
  leyendaNombre: {
    fontSize: 12,
    fontWeight: '600',
  },
  leyendaMonto: {
    fontSize: 11,
    marginTop: 1,
  },
});
