import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchBienesPorPropietario } from '../redux/actions/bienes';

const useInfiniteBienesPorPropietario = (propietarioUuid, pageSize = 50) => {
  const dispatch = useDispatch();
  const [bienes, setBienes] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNextPage = async () => {
    if (!propietarioUuid || isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const res = await dispatch(fetchBienesPorPropietario(propietarioUuid, page, pageSize));
      if (res?.success && Array.isArray(res.data)) {
        setBienes(prev => [...prev, ...res.data]);
        setPage(prev => prev + 1);
        if (res.data.length < pageSize) setHasMore(false);
      } else {
        setHasMore(false);
        setError(res?.message || 'Error al cargar bienes.');
      }
    } catch (err) {
      setError(err.message || 'Error al cargar bienes.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetBienes = () => {
    setBienes([]);
    setPage(1);
    setHasMore(true);
  };

  // Cargar la primera página al cambiar de propietario
  useEffect(() => {
    if (propietarioUuid) {
      resetBienes();
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propietarioUuid]);

  return {
    bienes,
    error,
    isLoading,
    hasMore,
    fetchNextPage,
    resetBienes,
  };
};

export default useInfiniteBienesPorPropietario;
