import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../redux/axiosConfig';
import { FaArrowLeft, FaExchangeAlt, FaSearch } from 'react-icons/fa';

const TransaccionesGlobales = () => {
  const navigate = useNavigate();
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTransacciones = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/transacciones/all?page=${pageNum}&limit=20`);
      setTransacciones(res.data.data);
      setTotalPages(res.data.totalPages);
      setPage(res.data.page);
    } catch (err) {
      console.error('Error fetching global transacciones:', err);
      setError('No se pudieron cargar las transacciones globales.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransacciones();
  }, []);

  return (
    <div className="bg-background min-h-screen flex flex-col font-inter">
      <header className="bg-primary text-white px-8 py-5 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold font-montserrat tracking-tight">
            Transacciones Globales
          </h1>
        </div>
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 p-2 px-4 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all font-semibold"
        >
          <FaArrowLeft /> Volver al Dashboard
        </button>
      </header>

      <main className="flex-grow p-8 max-w-7xl mx-auto w-full">
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-level-2 p-6 overflow-hidden">
          {error && (
            <div className="bg-error-container text-error px-4 py-3 rounded-lg mb-6 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-on-surface">
              <thead className="bg-surface-container border-b border-outline-variant text-xs uppercase text-primary font-bold">
                <tr>
                  <th className="px-4 py-4 min-w-[100px]">Fecha</th>
                  <th className="px-4 py-4 min-w-[150px]">Vendedor</th>
                  <th className="px-4 py-4 min-w-[150px]">Comprador</th>
                  <th className="px-4 py-4 min-w-[150px]">Bien Mueble</th>
                  <th className="px-4 py-4 min-w-[150px]">Detalles</th>
                  <th className="px-4 py-4 min-w-[100px]">Tipo</th>
                  <th className="px-4 py-4 min-w-[100px] text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-outline">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      Cargando transacciones...
                    </td>
                  </tr>
                ) : transacciones.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-outline">
                      No hay transacciones registradas.
                    </td>
                  </tr>
                ) : (
                  transacciones.map((tx) => {
                    const vendedor = tx.empresaVendedora ? tx.empresaVendedora.razonSocial : (tx.vendedorTransaccion ? `${tx.vendedorTransaccion.nombre} ${tx.vendedorTransaccion.apellido}` : 'Desconocido');
                    const comprador = tx.empresaCompradora ? tx.empresaCompradora.razonSocial : (tx.compradorTransaccion ? `${tx.compradorTransaccion.nombre} ${tx.compradorTransaccion.apellido}` : 'Desconocido');
                    const bien = tx.bienTransaccion ? `${tx.bienTransaccion.marca} ${tx.bienTransaccion.modelo}` : 'Desconocido';
                    const isVenta = tx.tipo === 'Venta' || tx.tipo === 'venta' || !tx.tipo;
                    
                    return (
                      <tr key={tx.uuid} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-4 py-4 font-medium text-xs">
                          {new Date(tx.fecha).toLocaleString()}
                        </td>
                        <td className="px-4 py-4">{vendedor}</td>
                        <td className="px-4 py-4">{comprador}</td>
                        <td className="px-4 py-4 font-semibold text-primary">{bien}</td>
                        <td className="px-4 py-4 text-xs">
                          {tx.detallesVendidos?.length > 0 ? (
                            <div className="space-y-1">
                              {tx.detallesVendidos.map(d => (
                                <div key={d.identificador_unico} className="font-mono bg-surface-container px-2 py-0.5 rounded text-[11px] font-bold border border-outline-variant inline-block mr-1">
                                  {d.identificador_unico}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-outline italic">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${isVenta ? 'bg-secondary-container text-secondary' : 'bg-tertiary-container text-tertiary'}`}>
                            {tx.tipo || 'Operación'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {tx.bienTransaccion?.uuid && (
                            <button
                              onClick={() => navigate(`/bienes/trazabilidad/${tx.bienTransaccion.uuid}`)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                            >
                              🔍 Trazabilidad
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <button 
                disabled={page === 1 || loading}
                onClick={() => fetchTransacciones(page - 1)}
                className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-lg text-primary font-medium disabled:opacity-50 transition-colors"
              >
                Anterior
              </button>
              <span className="text-sm font-medium text-on-surface-variant">Página {page} de {totalPages}</span>
              <button 
                disabled={page === totalPages || loading}
                onClick={() => fetchTransacciones(page + 1)}
                className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-lg text-primary font-medium disabled:opacity-50 transition-colors"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TransaccionesGlobales;
