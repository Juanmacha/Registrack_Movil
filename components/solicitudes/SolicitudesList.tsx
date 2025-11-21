import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { colors } from '@/styles/authStyles';
import { Solicitud } from '@/types/solicitudes';

import ErrorMessage from '../dashboard/ErrorMessage';
import LoadingSpinner from '../dashboard/LoadingSpinner';
import SolicitudCard from './SolicitudCard';

interface SolicitudesListProps {
  solicitudes: Solicitud[];
  loading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
  onSolicitudPress: (solicitud: Solicitud) => void;
}

const REGISTROS_POR_PAGINA = 5;

export default function SolicitudesList({
  solicitudes,
  loading,
  error,
  onRefresh,
  onSolicitudPress,
}: SolicitudesListProps) {
  const [busqueda, setBusqueda] = useState('');
  const [servicioFiltro, setServicioFiltro] = useState('Todos');
  const [estadoFiltro, setEstadoFiltro] = useState('Todos');
  const [paginaActual, setPaginaActual] = useState(1);

  // Obtener servicios únicos para el filtro
  const serviciosUnicos = useMemo(() => {
    const servicios = solicitudes.map((s) => s.tipoSolicitud);
    return ['Todos', ...Array.from(new Set(servicios))];
  }, [solicitudes]);

  // Obtener estados únicos para el filtro
  const estadosUnicos = useMemo(() => {
    const estados = solicitudes.map((s) => s.estado);
    return ['Todos', ...Array.from(new Set(estados))];
  }, [solicitudes]);

  // Filtrar y buscar
  const datosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    
    return solicitudes.filter((item) => {
      // Filtro por servicio
      const coincideServicio = servicioFiltro === 'Todos' || item.tipoSolicitud === servicioFiltro;
      
      // Filtro por estado
      const coincideEstado = estadoFiltro === 'Todos' || item.estado === estadoFiltro;
      
      // Búsqueda global
      const coincideTexto =
        !texto ||
        (item.titular && item.titular.toLowerCase().includes(texto)) ||
        (item.marca && item.marca.toLowerCase().includes(texto)) ||
        (item.email && item.email.toLowerCase().includes(texto)) ||
        (item.expediente && item.expediente.toLowerCase().includes(texto)) ||
        (item.encargado && item.encargado.toLowerCase().includes(texto));
      
      return coincideServicio && coincideEstado && coincideTexto;
    });
  }, [solicitudes, busqueda, servicioFiltro, estadoFiltro]);

  // Paginación
  const totalPaginas = Math.ceil(datosFiltrados.length / REGISTROS_POR_PAGINA);
  const inicio = (paginaActual - 1) * REGISTROS_POR_PAGINA;
  const fin = inicio + REGISTROS_POR_PAGINA;
  const datosPagina = datosFiltrados.slice(inicio, fin);

  // Resetear página cuando cambian los filtros
  const handleFiltroChange = (tipo: 'servicio' | 'estado', valor: string) => {
    if (tipo === 'servicio') {
      setServicioFiltro(valor);
    } else {
      setEstadoFiltro(valor);
    }
    setPaginaActual(1);
  };

  if (loading && solicitudes.length === 0) {
    return <LoadingSpinner message="Cargando solicitudes..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={onRefresh} />;
  }

  return (
    <View style={styles.container}>
      {/* Búsqueda */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por expediente, cliente, marca, email..."
          placeholderTextColor={colors.gray}
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Servicio:</Text>
          <View style={styles.filterButtons}>
            {serviciosUnicos.slice(0, 3).map((servicio) => (
              <TouchableOpacity
                key={servicio}
                style={[
                  styles.filterButton,
                  servicioFiltro === servicio && styles.filterButtonActive,
                ]}
                onPress={() => handleFiltroChange('servicio', servicio)}>
                <Text
                  style={[
                    styles.filterButtonText,
                    servicioFiltro === servicio && styles.filterButtonTextActive,
                  ]}>
                  {servicio}
                </Text>
              </TouchableOpacity>
            ))}
            {serviciosUnicos.length > 3 && (
              <Text style={styles.filterMore}>+{serviciosUnicos.length - 3} más</Text>
            )}
          </View>
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Estado:</Text>
          <View style={styles.filterButtons}>
            {estadosUnicos.slice(0, 3).map((estado) => (
              <TouchableOpacity
                key={estado}
                style={[
                  styles.filterButton,
                  estadoFiltro === estado && styles.filterButtonActive,
                ]}
                onPress={() => handleFiltroChange('estado', estado)}>
                <Text
                  style={[
                    styles.filterButtonText,
                    estadoFiltro === estado && styles.filterButtonTextActive,
                  ]}>
                  {estado}
                </Text>
              </TouchableOpacity>
            ))}
            {estadosUnicos.length > 3 && (
              <Text style={styles.filterMore}>+{estadosUnicos.length - 3} más</Text>
            )}
          </View>
        </View>
      </View>

      {/* Resultados */}
      <Text style={styles.resultsText}>
        {datosFiltrados.length} {datosFiltrados.length === 1 ? 'solicitud encontrada' : 'solicitudes encontradas'}
      </Text>

      {/* Lista */}
      {datosPagina.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No se encontraron solicitudes</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={datosPagina}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SolicitudCard solicitud={item} onPress={() => onSolicitudPress(item)} />
            )}
            refreshing={loading}
            onRefresh={onRefresh}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
          />

          {/* Paginación */}
          {totalPaginas > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[styles.paginationButton, paginaActual === 1 && styles.paginationButtonDisabled]}
                onPress={() => setPaginaActual((p) => Math.max(1, p - 1))}
                disabled={paginaActual === 1}>
                <Text style={styles.paginationButtonText}>Anterior</Text>
              </TouchableOpacity>

              <Text style={styles.paginationText}>
                Página {paginaActual} de {totalPaginas}
              </Text>

              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  paginaActual === totalPaginas && styles.paginationButtonDisabled,
                ]}
                onPress={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas}>
                <Text style={styles.paginationButtonText}>Siguiente</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.primaryDark,
  },
  filtersContainer: {
    marginBottom: 16,
    gap: 12,
  },
  filterGroup: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  filterMore: {
    fontSize: 12,
    color: colors.gray,
    alignSelf: 'center',
    paddingVertical: 6,
  },
  resultsText: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 12,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  paginationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primaryDark,
  },
  paginationButtonDisabled: {
    backgroundColor: colors.border,
    opacity: 0.5,
  },
  paginationButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  paginationText: {
    fontSize: 14,
    color: colors.gray,
    fontWeight: '500',
  },
});

