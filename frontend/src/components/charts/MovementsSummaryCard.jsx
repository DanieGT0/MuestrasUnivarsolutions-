import React from 'react';
import { TrendingUp, TrendingDown, BarChart3, Activity } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const MovementsSummaryCard = ({ data, title = "Resumen de Movimientos" }) => {
  const { isDarkMode } = useTheme();
  console.log('MovementsSummaryCard data:', data);
  
  if (!data) {
    return (
      <div className={`rounded-lg shadow-lg p-6 w-full ${
        isDarkMode ? 'glass-card' : 'bg-white'
      }`}>
        <h3 className={`text-lg font-semibold mb-6 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          {title}
        </h3>
        <div className="flex items-center justify-center h-48">
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No hay datos disponibles
          </p>
        </div>
      </div>
    );
  }

  const {
    total_entradas = 0,
    total_salidas = 0,
    total_ajustes = 0,
    diferencia_neta = 0,
    total_movimientos = 0
  } = data || {};

  // Calcular porcentajes
  const totalMovs = total_entradas + total_salidas + total_ajustes;
  const entradasPct = totalMovs > 0 ? (total_entradas / totalMovs * 100) : 0;
  const salidasPct = totalMovs > 0 ? (total_salidas / totalMovs * 100) : 0;
  const ajustesPct = totalMovs > 0 ? (total_ajustes / totalMovs * 100) : 0;

  const isPositiveDifference = diferencia_neta >= 0;

  return (
    <div className={`rounded-lg shadow-lg p-6 w-full ${
      isDarkMode ? 'glass-card' : 'bg-white'
    }`}>
      <h3 className={`text-lg font-semibold mb-6 ${
        isDarkMode ? 'text-white' : 'text-gray-800'
      }`}>
        {title}
      </h3>
      
      {/* Métricas principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Entradas */}
        <div className={`rounded-lg p-4 ${
          isDarkMode ? 'bg-green-900/20 border border-green-600/30' : 'bg-green-50'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Entradas</p>
              <p className="text-2xl font-bold text-green-700">
                {total_entradas.toLocaleString()}
              </p>
              <p className="text-xs text-green-500">
                {entradasPct.toFixed(1)}% del total
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        {/* Total Salidas */}
        <div className={`rounded-lg p-4 ${
          isDarkMode ? 'bg-red-900/20 border border-red-600/30' : 'bg-red-50'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Salidas</p>
              <p className="text-2xl font-bold text-red-700">
                {total_salidas.toLocaleString()}
              </p>
              <p className="text-xs text-red-500">
                {salidasPct.toFixed(1)}% del total
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        {/* Total Ajustes */}
        <div className={`rounded-lg p-4 ${
          isDarkMode ? 'bg-yellow-900/20 border border-yellow-600/30' : 'bg-yellow-50'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Ajustes</p>
              <p className="text-2xl font-bold text-yellow-700">
                {total_ajustes.toLocaleString()}
              </p>
              <p className="text-xs text-yellow-500">
                {ajustesPct.toFixed(1)}% del total
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        {/* Total Movimientos */}
        <div className={`rounded-lg p-4 ${
          isDarkMode ? 'bg-blue-900/20 border border-blue-600/30' : 'bg-blue-50'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total</p>
              <p className="text-2xl font-bold text-blue-700">
                {total_movimientos.toLocaleString()}
              </p>
              <p className="text-xs text-blue-500">movimientos</p>
            </div>
            <Activity className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>
      
      {/* Diferencia neta destacada */}
      <div className={`rounded-lg p-4 mb-6 border ${
        isPositiveDifference 
          ? isDarkMode
            ? 'bg-green-900/20 border-green-600/30'
            : 'bg-green-50 border-green-200'
          : isDarkMode
            ? 'bg-red-900/20 border-red-600/30'
            : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${
              isPositiveDifference ? 'text-green-600' : 'text-red-600'
            }`}>
              Diferencia Neta (Entradas - Salidas)
            </p>
            <p className={`text-3xl font-bold ${
              isPositiveDifference ? 'text-green-700' : 'text-red-700'
            }`}>
              {isPositiveDifference ? '+' : ''}{diferencia_neta.toLocaleString()}
            </p>
            <p className={`text-xs ${
              isPositiveDifference ? 'text-green-500' : 'text-red-500'
            }`}>
              {isPositiveDifference 
                ? 'Stock incrementado' 
                : 'Stock decrementado'
              }
            </p>
          </div>
          {isPositiveDifference ? (
            <TrendingUp className="h-12 w-12 text-green-500" />
          ) : (
            <TrendingDown className="h-12 w-12 text-red-500" />
          )}
        </div>
      </div>
      
      {/* Gráfico de barras horizontales */}
      <div className="space-y-3">
        <div className={`text-sm font-medium mb-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Distribución de Movimientos
        </div>
        
        {/* Barra de Entradas */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600 w-16">Entradas</span>
          <div className="flex-1 bg-gray-200 rounded-full h-3">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${entradasPct}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-600 w-12 text-right">
            {entradasPct.toFixed(0)}%
          </span>
        </div>
        
        {/* Barra de Salidas */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600 w-16">Salidas</span>
          <div className="flex-1 bg-gray-200 rounded-full h-3">
            <div 
              className="bg-red-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${salidasPct}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-600 w-12 text-right">
            {salidasPct.toFixed(0)}%
          </span>
        </div>
        
        {/* Barra de Ajustes */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600 w-16">Ajustes</span>
          <div className="flex-1 bg-gray-200 rounded-full h-3">
            <div 
              className="bg-yellow-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${ajustesPct}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-600 w-12 text-right">
            {ajustesPct.toFixed(0)}%
          </span>
        </div>
      </div>
      
      {/* Período */}
      {data.periodo && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            {data.periodo.fecha_desde && data.periodo.fecha_hasta ? (
              <>
                Período: {new Date(data.periodo.fecha_desde).toLocaleDateString('es-ES')} - {' '}
                {new Date(data.periodo.fecha_hasta).toLocaleDateString('es-ES')}
              </>
            ) : (
              'Último mes'
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MovementsSummaryCard;