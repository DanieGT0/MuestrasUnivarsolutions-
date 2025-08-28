import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Package, FileText, MessageSquare, BarChart3 } from 'lucide-react';
import movementService from '../../services/movementService';

const MovementDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movement, setMovement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadMovement();
    }
  }, [id]);

  const loadMovement = async () => {
    try {
      setLoading(true);
      const response = await movementService.getMovementById(id);
      setMovement(response);
    } catch (error) {
      console.error('Error loading movement:', error);
      setError('Error al cargar el movimiento');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMovementTypeIcon = (tipo) => {
    switch (tipo) {
      case 'entrada':
        return <BarChart3 className="h-8 w-8 text-green-600" />;
      case 'salida':
        return <BarChart3 className="h-8 w-8 text-red-600" />;
      case 'ajuste':
        return <BarChart3 className="h-8 w-8 text-blue-600" />;
      default:
        return <BarChart3 className="h-8 w-8 text-gray-600" />;
    }
  };

  const getMovementTypeColor = (tipo) => {
    switch (tipo) {
      case 'entrada':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'salida':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ajuste':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'inicial':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDiferencia = () => {
    if (!movement) return 0;
    switch (movement.tipo) {
      case 'entrada':
        return movement.cantidad;
      case 'salida':
        return -movement.cantidad;
      case 'ajuste':
        return movement.cantidad_nueva - movement.cantidad_anterior;
      case 'inicial':
        return movement.cantidad;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando movimiento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/movements')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver a Movimientos
          </button>
        </div>
      </div>
    );
  }

  if (!movement) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Movimiento no encontrado</p>
          <button
            onClick={() => navigate('/movements')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver a Movimientos
          </button>
        </div>
      </div>
    );
  }

  const diferencia = getDiferencia();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/movements')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detalle del Movimiento</h1>
          <p className="text-gray-600">Información completa del movimiento #{movement.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tipo y fecha */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4 mb-6">
              {getMovementTypeIcon(movement.tipo)}
              <div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getMovementTypeColor(movement.tipo)}`}>
                  {movementService.MOVEMENT_TYPE_LABELS[movement.tipo]}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{formatDate(movement.fecha_movimiento)}</span>
                </div>
              </div>
            </div>

            {/* Información del producto */}
            <div className="border-t pt-6">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Información del Producto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Código</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{movement.product_codigo}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <p className="mt-1 text-sm text-gray-900">{movement.product_nombre}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detalles del movimiento */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detalles del Movimiento
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Responsable</label>
                <div className="mt-1 flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{movement.responsable}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Usuario Sistema</label>
                <p className="mt-1 text-sm text-gray-900">{movement.user_full_name}</p>
                <p className="text-xs text-gray-500">{movement.user_email}</p>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">Motivo</label>
              <p className="mt-1 text-sm text-gray-900">{movement.motivo}</p>
            </div>

            {movement.observaciones && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Observaciones
                </label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{movement.observaciones}</p>
              </div>
            )}
          </div>
        </div>

        {/* Panel lateral - Resumen de cantidades */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h3 className="font-medium text-gray-900 mb-4">Resumen de Cantidades</h3>
            
            <div className="space-y-4">
              {/* Cantidad del movimiento */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{movement.cantidad}</div>
                  <div className="text-sm text-gray-600">Cantidad del movimiento</div>
                </div>
              </div>

              {/* Stock anterior */}
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Stock anterior:</span>
                <span className="font-medium text-gray-900">{movement.cantidad_anterior}</span>
              </div>

              {/* Diferencia */}
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Diferencia:</span>
                <span className={`font-medium ${
                  diferencia > 0 ? 'text-green-600' : diferencia < 0 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {diferencia > 0 ? '+' : ''}{diferencia}
                </span>
              </div>

              {/* Stock nuevo */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Stock nuevo:</span>
                <span className="font-bold text-lg text-gray-900">{movement.cantidad_nueva}</span>
              </div>

              {/* Indicador visual */}
              <div className="mt-4">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <div className="w-16 text-center py-2 bg-gray-100 rounded">
                    {movement.cantidad_anterior}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    diferencia > 0 ? 'bg-green-100 text-green-600' : 
                    diferencia < 0 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {diferencia > 0 ? '+' : ''}{diferencia}
                  </div>
                  <div className="w-16 text-center py-2 bg-blue-50 rounded font-medium">
                    {movement.cantidad_nueva}
                  </div>
                </div>
              </div>
            </div>

            {/* Metadatos */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>ID:</span>
                <span className="font-mono">#{movement.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Creado:</span>
                <span>{new Date(movement.created_at).toLocaleDateString('es-ES')}</span>
              </div>
              {movement.updated_at !== movement.created_at && (
                <div className="flex justify-between">
                  <span>Modificado:</span>
                  <span>{new Date(movement.updated_at).toLocaleDateString('es-ES')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovementDetail;