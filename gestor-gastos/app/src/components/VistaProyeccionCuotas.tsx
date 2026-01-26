import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTema } from '../context/TemaContext';
import { useCuotas } from '../context/CuotasContext';

interface Props {
  variant?: 'widget' | 'full-width';
}

export const VistaProyeccionCuotas = ({ variant = 'widget' }: Props) => {
  const { tema } = useTema();
  const { obtenerProyeccionCuotas } = useCuotas();

  const proyecciones = obtenerProyeccionCuotas(6);

  // Si no hay proyecciones con montos, no mostrar nada
  const hayProyecciones = proyecciones.some(p => p.totalCuotas > 0);
  if (!hayProyecciones) {
    return null;
  }

  const containerStyles = variant === 'widget'
    ? [styles.container, styles.containerWidget, { backgroundColor: tema.colores.fondoSecundario, borderColor: tema.colores.bordes }]
    : [styles.container, styles.containerFullWidth, { backgroundColor: tema.colores.fondoSecundario }];

  return (
    <View style={containerStyles}>
      <View style={styles.header}>
        <Text style={[styles.titulo, { color: tema.colores.primario }]}>
          📊 Proyección de Cuotas
        </Text>
        <Text style={[styles.subtitulo, { color: tema.colores.textoSecundario }]}>
          Próximos 6 meses
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {proyecciones.map((proyeccion, index) => {
          const esEstesMes = index === 0;
          const tieneCuotas = proyeccion.totalCuotas > 0;

          return (
            <View
              key={index}
              style={[
                styles.mesCard,
                {
                  backgroundColor: esEstesMes
                    ? tema.colores.primario
                    : tieneCuotas
                      ? tema.colores.fondo
                      : 'transparent',
                  borderColor: tieneCuotas ? tema.colores.bordes : 'transparent',
                  opacity: tieneCuotas ? 1 : 0.4,
                }
              ]}
            >
              <Text style={[
                styles.mesNombre,
                { color: esEstesMes ? '#fff' : tema.colores.textoSecundario }
              ]}>
                {proyeccion.mes}
              </Text>

              {tieneCuotas ? (
                <>
                  <Text style={[
                    styles.mesMonto,
                    { color: esEstesMes ? '#fff' : tema.colores.texto }
                  ]}>
                    {tema.moneda}{proyeccion.totalCuotas.toFixed(2)}
                  </Text>

                  {proyeccion.cuotasQueFinal.length > 0 && (
                    <View style={[
                      styles.finalizaBadge,
                      { backgroundColor: esEstesMes ? 'rgba(255,255,255,0.2)' : tema.colores.primarioClaro }
                    ]}>
                      <Text style={[
                        styles.finalizaTexto,
                        { color: esEstesMes ? '#fff' : tema.colores.primario }
                      ]}>
                        ✓ {proyeccion.cuotasQueFinal.length} finaliza{proyeccion.cuotasQueFinal.length !== 1 ? 'n' : ''}
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <Text style={[styles.sinCuotas, { color: tema.colores.textoSecundario }]}>
                  Sin cuotas
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Lista de compras que finalizan */}
      {proyecciones.some(p => p.cuotasQueFinal.length > 0) && (
        <View style={[styles.finalizacionesContainer, { borderTopColor: tema.colores.bordes }]}>
          <Text style={[styles.finalizacionesTitulo, { color: tema.colores.primario }]}>
            🎉 Compras que finalizan pronto:
          </Text>
          {proyecciones.map((proyeccion, index) =>
            proyeccion.cuotasQueFinal.map(cuota => (
              <View key={cuota.id} style={[styles.finalizacionItem, { backgroundColor: tema.colores.fondo }]}>
                <Text style={[styles.finalizacionDescripcion, { color: tema.colores.texto }]}>
                  {cuota.descripcion}
                </Text>
                <Text style={[styles.finalizacionMes, { color: tema.colores.textoSecundario }]}>
                  Finaliza en {proyeccion.mes}
                </Text>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  containerWidget: {
    borderRadius: 15,
    borderWidth: 2,
    padding: 15,
  },
  containerFullWidth: {
    paddingVertical: 15,
  },
  header: {
    marginBottom: 15,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 13,
  },
  scrollContainer: {
    paddingVertical: 5,
    gap: 12,
  },
  mesCard: {
    width: 140,
    borderRadius: 12,
    borderWidth: 2,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  mesNombre: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
    marginBottom: 8,
    textAlign: 'center',
  },
  mesMonto: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sinCuotas: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  finalizaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  finalizaTexto: {
    fontSize: 10,
    fontWeight: '600',
  },
  finalizacionesContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 2,
  },
  finalizacionesTitulo: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  finalizacionItem: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  finalizacionDescripcion: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  finalizacionMes: {
    fontSize: 11,
  },
});
