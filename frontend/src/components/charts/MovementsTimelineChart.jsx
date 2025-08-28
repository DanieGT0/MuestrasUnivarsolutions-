import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart3, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const MovementsTimelineChart = ({ data, title = "Timeline de Movimientos" }) => {
  const { isDarkMode } = useTheme();
  const [viewMode, setViewMode] = useState('bars'); // 'bars' | 'lines'
  const [showTooltips, setShowTooltips] = useState(true);
  const [timelinePosition, setTimelinePosition] = useState(0); // Position in the timeline (0-100)
  const [visibleDataCount, setVisibleDataCount] = useState(12); // Number of periods to show

  // Calculate timeline data and default position
  const { visibleData, totalPeriods, currentMonthIndex } = useMemo(() => {
    if (!data || data.length === 0) return { visibleData: [], totalPeriods: 0, currentMonthIndex: 0 };
    
    // Sort data by date
    const sortedData = [...data].sort((a, b) => new Date(a.periodo) - new Date(b.periodo));
    const totalPeriods = sortedData.length;
    
    // Find current month index (default position)
    const currentDate = new Date();
    const currentMonthStr = currentDate.toISOString().slice(0, 7); // YYYY-MM format
    
    let currentMonthIndex = sortedData.findIndex(item => {
      const itemDate = new Date(item.periodo);
      return itemDate.toISOString().slice(0, 7) === currentMonthStr;
    });
    
    // If current month not found, default to last available period
    if (currentMonthIndex === -1) {
      currentMonthIndex = Math.max(0, totalPeriods - visibleDataCount);
    }
    
    // Calculate visible data window based on timeline position
    const maxStartIndex = Math.max(0, totalPeriods - visibleDataCount);
    const startIndex = Math.round((timelinePosition / 100) * maxStartIndex);
    const endIndex = Math.min(startIndex + visibleDataCount, totalPeriods);
    const visibleData = sortedData.slice(startIndex, endIndex);
    
    return { visibleData, totalPeriods, currentMonthIndex };
  }, [data, timelinePosition, visibleDataCount]);

  // Set default position to current month when data changes
  useEffect(() => {
    if (data && data.length > 0 && timelinePosition === 0) {
      const maxStartIndex = Math.max(0, totalPeriods - visibleDataCount);
      const defaultPosition = maxStartIndex > 0 ? (currentMonthIndex / maxStartIndex) * 100 : 0;
      setTimelinePosition(Math.min(100, Math.max(0, defaultPosition)));
    }
  }, [data, totalPeriods, currentMonthIndex, visibleDataCount]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!data || data.length <= visibleDataCount) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setTimelinePosition(prev => Math.max(0, prev - 5));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setTimelinePosition(prev => Math.min(100, prev + 5));
      } else if (e.key === 'Home') {
        e.preventDefault();
        setTimelinePosition(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setTimelinePosition(100);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [data, visibleDataCount]);

  if (!data || data.length === 0) {
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

  // Encontrar valores máximos para escalar el gráfico
  const maxValue = Math.max(
    ...visibleData.map(item => Math.max(item.entradas, item.salidas))
  );

  // Calcular altura de las barras (máximo 120px)
  const getBarHeight = (value) => {
    return maxValue > 0 ? (value / maxValue) * 120 : 0;
  };

  // Calcular análisis de tendencias
  const calculateTrends = () => {
    if (!visibleData || visibleData.length < 2) return { trend: 'stable', percentage: 0 };
    
    const recent = visibleData.slice(-3); // Últimos 3 períodos
    const previous = visibleData.slice(-6, -3); // 3 períodos anteriores
    
    const recentAvg = recent.reduce((sum, item) => sum + item.total_movimientos, 0) / recent.length;
    const previousAvg = previous.length > 0 ? previous.reduce((sum, item) => sum + item.total_movimientos, 0) / previous.length : recentAvg;
    
    const percentageChange = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;
    
    return {
      trend: percentageChange > 5 ? 'up' : percentageChange < -5 ? 'down' : 'stable',
      percentage: Math.abs(percentageChange)
    };
  };

  const trends = calculateTrends();

  // Formatear fecha para mostrar
  const formatPeriod = (periodo) => {
    if (periodo.includes('Semana')) {
      return periodo;
    }
    const date = new Date(periodo);
    return date.toLocaleDateString('es-ES', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Generar puntos para línea de tendencia
  const generateLinePoints = (values, chartHeight, chartWidth) => {
    const maxVal = Math.max(...values);
    return values.map((value, index) => {
      const x = (index / (values.length - 1)) * chartWidth;
      const y = chartHeight - (value / maxVal) * chartHeight;
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <div className={`rounded-lg shadow-lg p-6 w-full ${
      isDarkMode ? 'glass-card' : 'bg-white'
    }`}>
      {/* Header con controles */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h3 className={`text-lg font-semibold flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            <Activity className={`h-5 w-5 ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
            {title}
          </h3>
          
          {/* Indicador de tendencia */}
          <div className="flex items-center gap-2 mt-1">
            {trends.trend === 'up' && (
              <div className="flex items-center text-green-600 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>↗️ Creciendo {trends.percentage.toFixed(1)}%</span>
              </div>
            )}
            {trends.trend === 'down' && (
              <div className="flex items-center text-red-600 text-sm">
                <TrendingDown className="h-4 w-4 mr-1" />
                <span>↘️ Disminuyendo {trends.percentage.toFixed(1)}%</span>
              </div>
            )}
            {trends.trend === 'stable' && (
              <div className="flex items-center text-blue-600 text-sm">
                <Activity className="h-4 w-4 mr-1" />
                <span>➡️ Estable</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Controles */}
        <div className="flex items-center gap-3 mt-4 lg:mt-0">
          <div className={`flex rounded-lg p-1 ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <button
              onClick={() => setViewMode('bars')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'bars'
                  ? isDarkMode
                    ? 'bg-gray-600 text-blue-400 shadow-sm'
                    : 'bg-white text-blue-600 shadow-sm'
                  : isDarkMode
                    ? 'text-gray-300 hover:text-gray-100'
                    : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <BarChart3 className="h-3 w-3 mr-1 inline" />
              Barras
            </button>
            <button
              onClick={() => setViewMode('lines')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'lines'
                  ? isDarkMode
                    ? 'bg-gray-600 text-blue-400 shadow-sm'
                    : 'bg-white text-blue-600 shadow-sm'
                  : isDarkMode
                    ? 'text-gray-300 hover:text-gray-100'
                    : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📈 Líneas
            </button>
          </div>
          
          <button
            onClick={() => setShowTooltips(!showTooltips)}
            className={`p-2 rounded-lg transition-colors ${
              showTooltips
                ? isDarkMode
                  ? 'bg-blue-900/30 text-blue-400'
                  : 'bg-blue-100 text-blue-600'
                : isDarkMode
                  ? 'bg-gray-700 text-gray-400'
                  : 'bg-gray-100 text-gray-600'
            }`}
            title="Mostrar/ocultar tooltips"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Timeline Navigation */}
      {data && data.length > visibleDataCount && (
        <div className={`mb-6 rounded-lg p-4 ${
          isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`text-sm font-medium ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              📅 Navegación Temporal
            </div>
            <div className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Mostrando {visibleData.length} de {totalPeriods} períodos | ⌨️ Use ←→ para navegar
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Previous button */}
            <button
              onClick={() => setTimelinePosition(Math.max(0, timelinePosition - 10))}
              disabled={timelinePosition <= 0}
              className={`p-1 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                isDarkMode
                  ? 'bg-gray-600 border-gray-500 hover:bg-gray-500 text-gray-200'
                  : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
              title="Período anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {/* Timeline slider */}
            <div className="flex-1 relative">
              <input
                type="range"
                min="0"
                max="100"
                value={timelinePosition}
                onChange={(e) => setTimelinePosition(parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                style={{
                  background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${timelinePosition}%, #E5E7EB ${timelinePosition}%, #E5E7EB 100%)`
                }}
              />
              <div className={`flex justify-between text-xs mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <span>{visibleData[0]?.periodo ? formatPeriod(visibleData[0].periodo) : ''}</span>
                <span>🎯 Línea de Tiempo</span>
                <span>{visibleData[visibleData.length - 1]?.periodo ? formatPeriod(visibleData[visibleData.length - 1].periodo) : ''}</span>
              </div>
            </div>
            
            {/* Next button */}
            <button
              onClick={() => setTimelinePosition(Math.min(100, timelinePosition + 10))}
              disabled={timelinePosition >= 100}
              className={`p-1 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                isDarkMode
                  ? 'bg-gray-600 border-gray-500 hover:bg-gray-500 text-gray-200'
                  : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
              title="Período siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            
            {/* Current month button */}
            <button
              onClick={() => {
                const maxStartIndex = Math.max(0, totalPeriods - visibleDataCount);
                const defaultPosition = maxStartIndex > 0 ? (currentMonthIndex / maxStartIndex) * 100 : 0;
                setTimelinePosition(Math.min(100, Math.max(0, defaultPosition)));
              }}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                isDarkMode
                  ? 'bg-blue-900/30 hover:bg-blue-900/50 text-blue-400'
                  : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
              }`}
              title="Ir al mes actual"
            >
              📍 Actual
            </button>
          </div>
        </div>
      )}
      
      {/* Leyenda */}
      <div className="flex justify-center space-x-6 mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className={`text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>Entradas</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className={`text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>Salidas</span>
        </div>
        {viewMode === 'lines' && (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 bg-blue-500 rounded"></div>
            <span className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>Tendencia</span>
          </div>
        )}
      </div>
      
      {/* Área del gráfico */}
      <div className="relative transition-all duration-300 ease-in-out">
        {/* Líneas de referencia horizontales */}
        <div className="absolute inset-0 flex flex-col justify-between h-32 opacity-20">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`border-t ${
              isDarkMode ? 'border-gray-600' : 'border-gray-300'
            }`}></div>
          ))}
        </div>
        
        {/* Etiquetas del eje Y */}
        <div className={`absolute left-0 top-0 h-32 flex flex-col justify-between text-xs -ml-8 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {[...Array(5)].map((_, i) => (
            <span key={i}>
              {Math.round((maxValue * (4 - i)) / 4)}
            </span>
          ))}
        </div>
        
        {viewMode === 'bars' ? (
          /* Vista de barras */
          <div className="flex items-end justify-between h-32 px-8 transition-all duration-300 ease-in-out">
            {visibleData.map((item, index) => (
              <div key={index} className="flex flex-col items-center space-y-1 min-w-0 flex-1">
                {/* Barras */}
                <div className="flex items-end space-x-1 h-full">
                  {/* Barra de entradas */}
                  <div className="relative group">
                    <div 
                      className="w-6 bg-green-500 rounded-t transition-all duration-300 hover:bg-green-600"
                      style={{ height: `${getBarHeight(item.entradas)}px` }}
                    ></div>
                    {/* Tooltip */}
                    {showTooltips && (
                      <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 ${
                        isDarkMode
                          ? 'bg-gray-700 text-gray-200 border border-gray-600'
                          : 'bg-gray-800 text-white'
                      }`}>
                        Entradas: {item.entradas}
                      </div>
                    )}
                  </div>
                  
                  {/* Barra de salidas */}
                  <div className="relative group">
                    <div 
                      className="w-6 bg-red-500 rounded-t transition-all duration-300 hover:bg-red-600"
                      style={{ height: `${getBarHeight(item.salidas)}px` }}
                    ></div>
                    {/* Tooltip */}
                    {showTooltips && (
                      <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 ${
                        isDarkMode
                          ? 'bg-gray-700 text-gray-200 border border-gray-600'
                          : 'bg-gray-800 text-white'
                      }`}>
                        Salidas: {item.salidas}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Etiqueta del periodo */}
                <span className={`text-xs text-center transform -rotate-45 origin-center mt-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {formatPeriod(item.periodo)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          /* Vista de líneas */
          <div className="h-32 px-8 relative transition-all duration-300 ease-in-out">
            <svg width="100%" height="128" className="absolute inset-0">
              {/* Línea de entradas */}
              <polyline
                fill="none"
                stroke="#10B981"
                strokeWidth="3"
                points={generateLinePoints(visibleData.map(d => d.entradas), 128, 100)}
                className="drop-shadow-sm"
              />
              {/* Línea de salidas */}
              <polyline
                fill="none"
                stroke="#EF4444"
                strokeWidth="3"
                points={generateLinePoints(visibleData.map(d => d.salidas), 128, 100)}
                className="drop-shadow-sm"
              />
              
              {/* Puntos de datos */}
              {visibleData.map((item, index) => {
                const x = (index / (visibleData.length - 1)) * 100;
                const yEntrada = 128 - (item.entradas / maxValue) * 128;
                const ySalida = 128 - (item.salidas / maxValue) * 128;
                
                return (
                  <g key={index}>
                    {/* Punto de entrada */}
                    <circle
                      cx={`${x}%`}
                      cy={yEntrada}
                      r="4"
                      fill="#10B981"
                      className="hover:r-6 transition-all cursor-pointer"
                    />
                    {/* Punto de salida */}
                    <circle
                      cx={`${x}%`}
                      cy={ySalida}
                      r="4"
                      fill="#EF4444"
                      className="hover:r-6 transition-all cursor-pointer"
                    />
                  </g>
                );
              })}
            </svg>
            
            {/* Etiquetas de período para vista de líneas */}
            <div className="absolute bottom-0 left-8 right-8 flex justify-between">
              {visibleData.map((item, index) => (
                <span key={index} className={`text-xs text-center transform -rotate-45 origin-center ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {formatPeriod(item.periodo)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Estadísticas detalladas */}
      <div className={`mt-8 pt-4 border-t ${
        isDarkMode ? 'border-gray-600' : 'border-gray-200'
      }`}>
        {/* Estadísticas principales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {data.reduce((sum, item) => sum + item.entradas, 0).toLocaleString()}
            </div>
            <div className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>Total Entradas</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">
              {data.reduce((sum, item) => sum + item.salidas, 0).toLocaleString()}
            </div>
            <div className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>Total Salidas</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${
              isDarkMode ? 'text-gray-200' : 'text-gray-800'
            }`}>
              {data.reduce((sum, item) => sum + item.total_movimientos, 0).toLocaleString()}
            </div>
            <div className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>Total Movimientos</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {data.length > 0 ? Math.round(data.reduce((sum, item) => sum + item.total_movimientos, 0) / data.length) : 0}
            </div>
            <div className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>Promedio Diario</div>
          </div>
        </div>
        
        {/* Análisis adicional */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Diferencia neta */}
          <div className="text-center">
            {(() => {
              const totalEntradas = data.reduce((sum, item) => sum + item.entradas, 0);
              const totalSalidas = data.reduce((sum, item) => sum + item.salidas, 0);
              const diferencia = totalEntradas - totalSalidas;
              const isPositive = diferencia >= 0;
              
              return (
                <div className={`p-3 rounded-lg ${
                  isDarkMode
                    ? 'bg-blue-900/20 border border-blue-600/30'
                    : 'bg-blue-50'
                }`}>
                  <div className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}{diferencia.toLocaleString()}
                  </div>
                  <div className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {isPositive ? '📈 Crecimiento Neto' : '📉 Reducción Neta'}
                  </div>
                </div>
              );
            })()}
          </div>
          
          {/* Período más activo */}
          <div className="text-center">
            {(() => {
              const maxPeriod = data.reduce((max, item) => 
                item.total_movimientos > max.total_movimientos ? item : max
              );
              
              return (
                <div className={`p-3 rounded-lg ${
                  isDarkMode
                    ? 'bg-blue-900/20 border border-blue-600/30'
                    : 'bg-blue-50'
                }`}>
                  <div className="text-lg font-bold text-blue-600">
                    {maxPeriod.total_movimientos}
                  </div>
                  <div className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    🔥 Pico: {formatPeriod(maxPeriod.periodo)}
                  </div>
                </div>
              );
            })()}
          </div>
          
          {/* Ratio Entrada/Salida */}
          <div className="text-center">
            {(() => {
              const totalEntradas = data.reduce((sum, item) => sum + item.entradas, 0);
              const totalSalidas = data.reduce((sum, item) => sum + item.salidas, 0);
              const ratio = totalSalidas > 0 ? (totalEntradas / totalSalidas).toFixed(2) : '∞';
              
              return (
                <div className={`p-3 rounded-lg ${
                  isDarkMode
                    ? 'bg-blue-900/20 border border-blue-600/30'
                    : 'bg-blue-50'
                }`}>
                  <div className="text-lg font-bold text-blue-600">
                    {ratio}
                  </div>
                  <div className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    ⚖️ Ratio E/S
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovementsTimelineChart;