import { SectionList, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { memo, useMemo } from 'react';
import { Gasto } from '../types';
import { useTema } from '../context/TemaContext';
import { useCategorias } from '../context/CategoriasContext';
import { useMonedas } from '../context/MonedasContext';
import { useTarjetas } from '../context/TarjetasContext';
import { EstadoVacio } from './EstadoVacio';
import { obtenerMonedaPorCodigo } from '../constants/monedas';

interface Props {
  gastos: Gasto[];
  onEditar?: (gasto: Gasto) => void;
}

type Seccion = {
  title: string;
  dateKey: string;
  data: Gasto[];
  totalGastos: number;
  totalIngresos: number;
};

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const etiquetaDia = (fechaISO: string): string => {
  const f = new Date(fechaISO);
  const hoy = new Date();
  const ayer = new Date(hoy);
  ayer.setDate(hoy.getDate() - 1);

  if (f.toDateString() === hoy.toDateString()) return 'Hoy';
  if (f.toDateString() === ayer.toDateString()) return 'Ayer';

  const diaSemana = DIAS[f.getDay()];
  const mismoAnio = f.getFullYear() === hoy.getFullYear();
  return mismoAnio
    ? `${diaSemana} ${f.getDate()} de ${MESES[f.getMonth()]}`
    : `${f.getDate()} de ${MESES[f.getMonth()]} ${f.getFullYear()}`;
};

const dateKey = (fechaISO: string): string => {
  const f = new Date(fechaISO);
  return `${f.getFullYear()}-${f.getMonth()}-${f.getDate()}`;
};

export const ListaGastos = memo(({ gastos, onEditar }: Props) => {
  const { tema } = useTema();
  const c = tema.colores;
  const { categorias } = useCategorias();
  const { monedaBase } = useMonedas();
  const { tarjetas } = useTarjetas();

  const secciones = useMemo<Seccion[]>(() => {
    const mapa = new Map<string, Gasto[]>();
    for (const g of gastos) {
      const k = dateKey(g.fecha);
      if (!mapa.has(k)) mapa.set(k, []);
      mapa.get(k)!.push(g);
    }
    return Array.from(mapa.entries()).map(([k, items]) => ({
      title: etiquetaDia(items[0].fecha),
      dateKey: k,
      data: items,
      totalGastos: items.filter(g => g.tipo === 'gasto').reduce((s, g) => s + (g.montoEnMonedaBase ?? g.monto), 0),
      totalIngresos: items.filter(g => g.tipo === 'ingreso').reduce((s, g) => s + (g.montoEnMonedaBase ?? g.monto), 0),
    }));
  }, [gastos]);

  const sim = monedaBase?.simbolo || '$';

  return (
    <SectionList
      sections={secciones}
      keyExtractor={item => item.id}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled={false}
      initialNumToRender={15}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
      renderSectionHeader={({ section }) => (
        <View style={[styles.diaHeader, { borderBottomColor: c.bordes + '60' }]}>
          <Text style={[styles.diaLabel, { color: c.textoSecundario }]}>
            {section.title}
          </Text>
          <View style={styles.diaTotales}>
            {section.totalIngresos > 0 && (
              <Text style={[styles.diaTotalIngreso]}>
                +{sim}{section.totalIngresos.toFixed(2)}
              </Text>
            )}
            {section.totalGastos > 0 && (
              <Text style={[styles.diaTotalGasto]}>
                -{sim}{section.totalGastos.toFixed(2)}
              </Text>
            )}
          </View>
        </View>
      )}
      renderItem={({ item }) => {
        const categoria = categorias.find(cat => cat.id === item.categoria) || categorias[0];
        const codigoMoneda = item.moneda || monedaBase?.codigo || 'GTQ';
        const simbolo = obtenerMonedaPorCodigo(codigoMoneda)?.simbolo || sim;
        const tarjeta = item.tarjetaId ? tarjetas.find(t => t.id === item.tarjetaId) : null;
        const esIngreso = item.tipo === 'ingreso';

        return (
          <TouchableOpacity
            style={[styles.item, { backgroundColor: c.fondoSecundario, borderColor: c.bordes }]}
            onPress={() => onEditar && onEditar(item)}
            activeOpacity={0.7}
          >
            {/* Icono de categoría */}
            <View style={[styles.iconoCirculo, { backgroundColor: categoria.color + '22' }]}>
              <Text style={styles.iconoEmoji}>{categoria.emoji}</Text>
            </View>

            {/* Contenido */}
            <View style={styles.contenido}>
              <Text style={[styles.descripcion, { color: c.texto }]} numberOfLines={1}>
                {item.descripcion}
              </Text>
              <View style={styles.metaRow}>
                <Text style={[styles.metaTexto, { color: c.textoSecundario }]} numberOfLines={1}>
                  {categoria.nombre}
                  {tarjeta ? ` · 💳 ${tarjeta.nombre}` : ''}
                </Text>
              </View>
              {item.nota ? (
                <Text style={[styles.nota, { color: c.textoSecundario }]} numberOfLines={1}>
                  📝 {item.nota}
                </Text>
              ) : null}
            </View>

            {/* Monto */}
            <Text style={[styles.monto, { color: esIngreso ? '#10b981' : '#ef4444' }]}>
              {esIngreso ? '+' : '-'}{simbolo}{item.monto.toFixed(2)}
            </Text>
          </TouchableOpacity>
        );
      }}
      ListEmptyComponent={
        <EstadoVacio
          emoji="📭"
          titulo="Sin movimientos"
          subtitulo="Registra tu primer gasto o ingreso del mes"
        />
      }
      contentContainerStyle={secciones.length === 0 ? { flex: 1 } : { paddingBottom: 100 }}
    />
  );
});

const styles = StyleSheet.create({
  diaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 2,
    marginTop: 6,
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  diaLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  diaTotales: {
    flexDirection: 'row',
    gap: 8,
  },
  diaTotalGasto: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ef4444',
  },
  diaTotalIngreso: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10b981',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
    gap: 10,
  },
  iconoCirculo: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconoEmoji: {
    fontSize: 20,
  },
  contenido: {
    flex: 1,
    minWidth: 0,
  },
  descripcion: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaTexto: {
    fontSize: 12,
  },
  nota: {
    fontSize: 11,
    marginTop: 2,
    fontStyle: 'italic',
  },
  monto: {
    fontSize: 15,
    fontWeight: 'bold',
    flexShrink: 0,
  },
});
