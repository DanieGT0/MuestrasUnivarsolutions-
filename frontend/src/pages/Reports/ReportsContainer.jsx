import React, { useState } from 'react';
import { BarChart3, Table, FileText } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import CommercialDashboard from './CommercialDashboard';
import InventoryTable from './InventoryTable';

const ReportsContainer = () => {
  const { isDarkMode } = useTheme();
  const [activeReport, setActiveReport] = useState('dashboard');

  const reportTypes = [
    {
      id: 'dashboard',
      label: 'Dashboard Comercial',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'Análisis y gráficos de stock y movimientos'
    },
    {
      id: 'inventory',
      label: 'Tabla de Inventarios',
      icon: <Table className="w-5 h-5" />,
      description: 'Vista detallada de productos y existencias'
    }
  ];

  const renderContent = () => {
    switch (activeReport) {
      case 'dashboard':
        return <CommercialDashboard />;
      case 'inventory':
        return <InventoryTable />;
      default:
        return <CommercialDashboard />;
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header con navegación de reportes */}
      <div className={`border-b ${
        isDarkMode 
          ? 'glass-card border-gray-600' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className={`text-2xl font-bold flex items-center space-x-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <FileText className={`h-7 w-7 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
                <span>Reportes</span>
              </h1>
              <p className={`mt-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Selecciona el tipo de reporte que deseas visualizar
              </p>
            </div>
          </div>
          
          {/* Navegación de tipos de reportes */}
          <div className="mt-6">
            <nav className="flex space-x-8">
              {reportTypes.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setActiveReport(report.id)}
                  className={`flex items-center space-x-2 pb-4 border-b-2 transition-colors ${
                    activeReport === report.id
                      ? isDarkMode 
                        ? 'border-blue-400 text-blue-400' 
                        : 'border-blue-500 text-blue-600'
                      : isDarkMode
                        ? 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {report.icon}
                  <div className="text-left">
                    <div className="font-medium">{report.label}</div>
                    <div className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {report.description}
                    </div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Contenido del reporte */}
      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default ReportsContainer;