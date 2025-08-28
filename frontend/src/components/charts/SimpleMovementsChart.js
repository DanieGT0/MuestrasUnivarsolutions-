import React from 'react';
import { TrendingUp, TrendingDown, RotateCcw, Activity } from 'lucide-react';

const SimpleMovementsChart = ({ data, groupBy = 'day', loading = false }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-gray-500">Cargando datos...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-gray-500">No hay datos disponibles</div>
      </div>
    );
  }

  const formatPeriodo = (periodo, groupBy) => {
    if (groupBy === 'month') {
      return new Date(periodo).toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });
    } else if (groupBy === 'week') {
      return periodo;
    } else {
      return new Date(periodo).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    }
  };

  const maxValue = Math.max(
    ...data.map(item => Math.max(item.entradas, item.salidas, item.ajustes))
  );

  const totalEntradas = data.reduce((sum, item) => sum + item.entradas, 0);
  const totalSalidas = data.reduce((sum, item) => sum + item.salidas, 0);
  const totalAjustes = data.reduce((sum, item) => sum + item.ajustes, 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-blue-600" />
          Timeline de Movimientos ({groupBy === 'day' ? 'Diario' : groupBy === 'week' ? 'Semanal' : 'Mensual'})
        </h3>
      </div>

      {/* Gráfico de líneas simple */}
      <div className="mb-6">
        <div className="flex items-end justify-between h-64 bg-gray-50 rounded-lg p-4">
          {data.map((item, index) => {
            const entradaHeight = (item.entradas / maxValue) * 100;
            const salidaHeight = (item.salidas / maxValue) * 100;
            const ajusteHeight = (item.ajustes / maxValue) * 100;
            
            return (
              <div key={index} className="flex flex-col items-center space-y-1 flex-1">
                <div className="flex items-end space-x-1 h-48">
                  {/* Barra de entradas */}
                  <div
                    className="bg-green-500 w-3 rounded-t transition-all duration-500"
                    style={{ height: `${entradaHeight}%` }}
                    title={`Entradas: ${item.entradas}`}
                  ></div>
                  {/* Barra de salidas */}
                  <div
                    className="bg-red-500 w-3 rounded-t transition-all duration-500"
                    style={{ height: `${salidaHeight}%` }}
                    title={`Salidas: ${item.salidas}`}
                  ></div>
                  {/* Barra de ajustes */}
                  <div
                    className="bg-yellow-500 w-3 rounded-t transition-all duration-500"
                    style={{ height: `${ajusteHeight}%` }}
                    title={`Ajustes: ${item.ajustes}`}
                  ></div>
                </div>
                <div className="text-xs text-gray-600 transform -rotate-45 whitespace-nowrap">
                  {formatPeriodo(item.periodo, groupBy)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex items-center justify-center space-x-6 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-600">Entradas</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-sm text-gray-600">Salidas</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span className="text-sm text-gray-600">Ajustes</span>
        </div>
      </div>

      {/* Resumen de totales */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <div className="text-sm text-green-600">Total Entradas</div>
              <div className="text-xl font-bold text-green-700">{totalEntradas.toLocaleString()}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
          <div className="flex items-center">
            <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <div className="text-sm text-red-600">Total Salidas</div>
              <div className="text-xl font-bold text-red-700">{totalSalidas.toLocaleString()}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
          <div className="flex items-center">
            <RotateCcw className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <div className="text-sm text-yellow-600">Total Ajustes</div>
              <div className="text-xl font-bold text-yellow-700">{totalAjustes.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Balance neto */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-sm text-gray-600">Balance Neto del Período</div>
          <div className={`text-2xl font-bold ${(totalEntradas - totalSalidas) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {(totalEntradas - totalSalidas).toLocaleString()} unidades
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleMovementsChart;