import React from 'react';
import { AlertTriangle, AlertCircle, Package } from 'lucide-react';

const LowStockAlertsChart = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-gray-500">Cargando datos...</div>
      </div>
    );
  }

  if (!data || !data.alerts || data.alerts.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-center h-40 bg-green-50 rounded-lg">
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-green-500 mb-2" />
            <div className="text-green-700 font-medium">¡Excelente!</div>
            <div className="text-green-600 text-sm">No hay alertas de stock bajo</div>
          </div>
        </div>
      </div>
    );
  }

  const { alerts, total_alerts, critical_count, warning_count } = data;

  const criticalAlerts = alerts.filter(alert => alert.alert_level === 'critical');
  const warningAlerts = alerts.filter(alert => alert.alert_level === 'warning');

  const getAlertIcon = (level) => {
    return level === 'critical' ? (
      <AlertTriangle className="h-4 w-4 text-red-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-yellow-500" />
    );
  };

  const getAlertColor = (level) => {
    return level === 'critical' 
      ? 'border-red-200 bg-red-50' 
      : 'border-yellow-200 bg-yellow-50';
  };

  const getTextColor = (level) => {
    return level === 'critical' ? 'text-red-700' : 'text-yellow-700';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Alertas de Stock Bajo</h3>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {critical_count} Críticas
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            {warning_count} Advertencias
          </span>
        </div>
      </div>

      {/* Resumen de alertas */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-gray-900">{total_alerts}</div>
          <div className="text-sm text-gray-600">Total Alertas</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center border-l-4 border-red-500">
          <div className="text-2xl font-bold text-red-700">{critical_count}</div>
          <div className="text-sm text-red-600">Críticas (≤5)</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg text-center border-l-4 border-yellow-500">
          <div className="text-2xl font-bold text-yellow-700">{warning_count}</div>
          <div className="text-sm text-yellow-600">Advertencias (≤10)</div>
        </div>
      </div>

      {/* Lista de alertas críticas */}
      {criticalAlerts.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-1" />
            Alertas Críticas
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {criticalAlerts.slice(0, 5).map((alert) => (
              <div key={alert.product_id} className={`p-3 border rounded-lg ${getAlertColor(alert.alert_level)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getAlertIcon(alert.alert_level)}
                    <div>
                      <div className={`font-medium text-sm ${getTextColor(alert.alert_level)}`}>
                        {alert.product_nombre}
                      </div>
                      <div className="text-xs text-gray-600">
                        {alert.product_codigo} - {alert.category_name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${getTextColor(alert.alert_level)}`}>
                      {alert.current_stock} unidades
                    </div>
                    <div className="text-xs text-gray-600">{alert.country_name}</div>
                  </div>
                </div>
              </div>
            ))}
            {criticalAlerts.length > 5 && (
              <div className="text-center text-sm text-gray-500 py-2">
                +{criticalAlerts.length - 5} alertas críticas más
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lista de alertas de advertencia */}
      {warningAlerts.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-yellow-700 mb-2 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            Advertencias
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {warningAlerts.slice(0, 3).map((alert) => (
              <div key={alert.product_id} className={`p-3 border rounded-lg ${getAlertColor(alert.alert_level)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getAlertIcon(alert.alert_level)}
                    <div>
                      <div className={`font-medium text-sm ${getTextColor(alert.alert_level)}`}>
                        {alert.product_nombre}
                      </div>
                      <div className="text-xs text-gray-600">
                        {alert.product_codigo} - {alert.category_name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${getTextColor(alert.alert_level)}`}>
                      {alert.current_stock} unidades
                    </div>
                    <div className="text-xs text-gray-600">{alert.country_name}</div>
                  </div>
                </div>
              </div>
            ))}
            {warningAlerts.length > 3 && (
              <div className="text-center text-sm text-gray-500 py-2">
                +{warningAlerts.length - 3} advertencias más
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LowStockAlertsChart;