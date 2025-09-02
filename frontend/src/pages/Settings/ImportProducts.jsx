import React, { useState, useEffect } from 'react';
import { 
  Upload, Download, FileSpreadsheet, Eye, Globe2, 
  Cloud, Database, ArrowRight, Settings, Filter, Building, Info
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useTranslation } from '../../hooks/useTranslation';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Card, CardHeader, CardContent, Button, Badge, Alert, ProgressBar 
} from '../../components/ui';
import api from '../../services/api';
import { buildApiUrl } from '../../config/api';

const ImportProducts = () => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewData, setPreviewData] = useState(null);
  const [errors, setErrors] = useState([]);
  const [countries, setCountries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [importMode, setImportMode] = useState('add');
  const [loadingData, setLoadingData] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingData(true);
      try {
        await Promise.all([loadCountries(), loadCategories()]);
      } finally {
        setLoadingData(false);
      }
    };
    
    loadInitialData();
  }, []);

  const loadCountries = async () => {
    try {
      const response = await api.get('/products/available-countries');
      setCountries(response.data);
    } catch (error) {
      console.error('Error loading countries:', error);
      // Fallback countries
      setCountries([
        { id: 1, code: 'GT', name: 'Guatemala' },
        { id: 2, code: 'SV', name: 'El Salvador' },
        { id: 3, code: 'HN', name: 'Honduras' }
      ]);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback categories
      setCategories([
        { id: 3, name: 'HIC' },
        { id: 7, name: 'BIC' },
        { id: 8, name: 'CASE' },
        { id: 9, name: 'FOOD' },
        { id: 10, name: 'PHARMA' },
        { id: 11, name: 'OTROS' }
      ]);
    }
  };

  // Generate Excel template
  const generateTemplate = () => {
    const templateData = [
      ['PLANTILLA DE IMPORTACIÓN DE PRODUCTOS - UNIVAR SOLUTIONS'],
      [''],
      ['INSTRUCCIONES IMPORTANTES:'],
      ['1. Complete todos los campos obligatorios (marcados con *)'],
      ['2. Use el formato de fecha DD/MM/YYYY para fecha de vencimiento'],
      ['3. Los códigos se generarán automáticamente con formato: PAÍS + Fecha + Correlativo'],
      ['4. La fecha de registro será automática (fecha actual del sistema)'],
      ['5. Las categorías deben coincidir exactamente con las disponibles'],
      ['6. Los pesos se registran en kilogramos (Kg)'],
      ['7. Si selecciona un país arriba, todos los productos se asignarán a ese país'],
      [''],
      ['PAÍSES DISPONIBLES:'],
      ...countries.map(country => [`- ${country.code}: ${country.name}`]),
      [''],
      ['CATEGORÍAS DISPONIBLES (usar nombre exacto):'],
      ...categories.map(category => [`- ${category.name}`]),
      [''],
      ['DATOS DE PRODUCTOS (Inicie desde la fila siguiente):'],
      [
        '*Nombre', '*Lote', '*Cantidad', '*Peso Unitario (Kg)', 
        '*Peso Total (Kg)', '*Fecha Vencimiento (DD/MM/YYYY)', 
        '*Proveedor', '*Responsable', '*Categoría', 'Comentarios'
      ],
      [
        'Polímero PVC Tipo A', 'L2024001', '100', '25.5', 
        '2550', '01/08/2026', 'Univar Solutions', 
        'Juan Pérez', categories.length > 0 ? categories[0].name : 'HIC', 'Muestra para evaluación'
      ],
      [
        'Aditivo Estabilizador UV', 'L2024002', '50', '10.0', 
        '500', '15/08/2025', 'Specialchem', 
        'María García', categories.length > 1 ? categories[1].name : 'BIC', 'Producto premium'
      ]
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(templateData);
    
    const columnWidths = [
      { wch: 30 }, { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 15 },
      { wch: 18 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 30 }
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla Productos');

    const fileName = `Plantilla_Productos_Univar_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    console.log('File selection triggered'); // Debug
    const selectedFile = event.target.files[0];
    
    if (selectedFile) {
      console.log('File selected:', selectedFile.name, selectedFile.type); // Debug
      
      // Validar tipos de archivo Excel más permisivo
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'application/excel',
        'application/x-excel',
        'application/x-msexcel'
      ];
      
      const fileExtension = selectedFile.name.toLowerCase().split('.').pop();
      const validExtensions = ['xlsx', 'xls'];
      
      if (!validTypes.includes(selectedFile.type) && !validExtensions.includes(fileExtension)) {
        alert(t('settings.tabs.import.invalidFileType', 'Por favor, seleccione un archivo Excel (.xlsx o .xls)'));
        event.target.value = ''; // Limpiar input
        return;
      }
      
      setFile(selectedFile);
      setPreviewData(null);
      setErrors([]);
      console.log('File set successfully'); // Debug
    } else {
      console.log('No file selected'); // Debug
    }
  };

  // File preview logic
  const previewFile = async () => {
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      let headerRowIndex = -1;
      for (let i = 0; i < jsonData.length; i++) {
        if (jsonData[i] && jsonData[i][0] && jsonData[i][0].includes('Nombre')) {
          headerRowIndex = i;
          break;
        }
      }

      if (headerRowIndex === -1) {
        setErrors(['No se encontró la fila de encabezados. Asegúrese de usar la plantilla correcta.']);
        return;
      }

      const headers = jsonData[headerRowIndex];
      const dataRows = jsonData.slice(headerRowIndex + 1).filter(row => 
        row && row.length > 0 && row[0] && row[0].toString().trim() !== ''
      );

      const processedData = dataRows.map((row, index) => ({
        rowNumber: headerRowIndex + index + 2,
        codigo_generado: generateProductCode(selectedCountry, index), // Código automático
        nombre: row[0] || '',
        lote: row[1] || '',
        cantidad: row[2] || '',
        peso_unitario: row[3] || '',
        peso_total: row[4] || '',
        fecha_vencimiento: row[5] || '',
        proveedor: row[6] || '',
        responsable: row[7] || '',
        categoria: row[8] || '',
        comentarios: row[9] || ''
      }));

      setPreviewData({
        headers,
        data: processedData,
        totalRows: processedData.length
      });

      validateData(processedData);

    } catch (error) {
      console.error('Error procesando archivo:', error);
      setErrors(['Error procesando el archivo. Verifique que sea un archivo Excel válido.']);
    }
  };

  // Data validation
  const validateData = (data) => {
    const validationErrors = [];
    const requiredFields = [
      'nombre', 'lote', 'cantidad', 'peso_unitario', 
      'peso_total', 'fecha_vencimiento', 
      'proveedor', 'responsable', 'categoria'
    ];

    const validCategoryNames = categories.map(cat => cat.name);

    data.forEach((row) => {
      requiredFields.forEach(field => {
        if (!row[field] || row[field].toString().trim() === '') {
          validationErrors.push(
            `Fila ${row.rowNumber}: ${field.replace('_', ' ')} es obligatorio`
          );
        }
      });

      if (row.categoria && validCategoryNames.length > 0 && !validCategoryNames.includes(row.categoria)) {
        validationErrors.push(
          `Fila ${row.rowNumber}: Categoría '${row.categoria}' no es válida. Use: ${validCategoryNames.join(', ')}`
        );
      }

      // Fecha de registro se genera automáticamente, no se valida
      if (row.fecha_vencimiento && !isValidDate(row.fecha_vencimiento)) {
        validationErrors.push(
          `Fila ${row.rowNumber}: Formato de fecha de vencimiento inválido (use DD/MM/YYYY)`
        );
      }

      if (row.cantidad && isNaN(parseInt(row.cantidad))) {
        validationErrors.push(`Fila ${row.rowNumber}: Cantidad debe ser un número`);
      }
      if (row.peso_unitario && isNaN(parseFloat(row.peso_unitario))) {
        validationErrors.push(`Fila ${row.rowNumber}: Peso unitario debe ser un número`);
      }
      if (row.peso_total && isNaN(parseFloat(row.peso_total))) {
        validationErrors.push(`Fila ${row.rowNumber}: Peso total debe ser un número`);
      }
    });

    setErrors(validationErrors);
  };

  // Date validation
  const isValidDate = (dateString) => {
    const regex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    if (!regex.test(dateString)) return false;
    
    const parts = dateString.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  };

  // Helper functions
  const convertDateFormat = (ddmmyyyy) => {
    if (!ddmmyyyy) return null;
    const parts = ddmmyyyy.split('/');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const getCategoryIdByName = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.id : 3;
  };

  // Generar código automático basado en país y fecha actual
  // Formato: [PAIS][DD][MM][YY][NNN]
  // Ejemplo: SV270825001 = El Salvador, 27 de agosto de 2025, correlativo 001
  const generateProductCode = (countrySelection, index) => {
    let countryCode = 'XX'; // Default
    
    if (selectedCountry) {
      // Si hay país seleccionado en el formulario
      const country = countries.find(c => c.id == selectedCountry);
      countryCode = country?.code || 'XX';
    } else {
      // Si no hay país seleccionado, usar 'GL' de Global
      countryCode = 'GL';
    }
    
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');        // 27
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 08 (getMonth() es 0-based)
    const year = String(now.getFullYear()).slice(-2);          // 25 (últimos 2 dígitos de 2025)
    const sequence = String(index + 1).padStart(3, '0');       // 001
    
    return `${countryCode}${day}${month}${year}${sequence}`;
  };

  // Process import
  const processImport = async () => {
    if (!previewData || errors.length > 0) {
      alert('Corrija los errores antes de continuar con la importación');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(25);

      const processedProducts = previewData.data.map((row, index) => ({
        codigo: row.codigo_generado, // Código automático generado
        nombre: row.nombre.trim(),
        lote: row.lote.trim(),
        cantidad: parseInt(row.cantidad),
        peso_unitario: parseFloat(row.peso_unitario),
        peso_total: parseFloat(row.peso_total),
        fecha_registro: new Date().toISOString().split('T')[0], // Fecha actual automática
        fecha_vencimiento: convertDateFormat(row.fecha_vencimiento),
        proveedor: row.proveedor.trim(),
        responsable: row.responsable.trim(),
        comentarios: row.comentarios ? row.comentarios.trim() : null,
        categoria_id: getCategoryIdByName(row.categoria),
      }));

      setUploadProgress(50);

      const response = await api.post('/products/bulk-import', {
        products: processedProducts,
        import_mode: importMode,
        selected_country: selectedCountry ? parseInt(selectedCountry) : null
      });

      setUploadProgress(75);

      const results = response.data;
      setUploadProgress(100);

      let message = `Importación completada:\n`;
      message += `✓ ${results.created} productos creados\n`;
      message += `✓ ${results.updated} productos actualizados\n`;
      message += `⚠ ${results.skipped} productos omitidos\n`;
      
      if (results.errors && results.errors.length > 0) {
        message += `\nErrores (${results.errors.length}):\n`;
        message += results.errors.slice(0, 5).join('\n');
        if (results.errors.length > 5) {
          message += `\n... y ${results.errors.length - 5} errores más.`;
        }
      }
      
      alert(message);
      
      if (results.created > 0 || results.updated > 0) {
        setFile(null);
        setPreviewData(null);
        setErrors([]);
        document.getElementById('file-upload').value = '';
      }

    } catch (error) {
      console.error('Error en importación:', error);
      alert(`Error durante la importación: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {t('settings.tabs.import.title')}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {t('settings.tabs.import.subtitle')}
                </p>
              </div>
            </div>
            <Badge variant="info" className="flex items-center space-x-1">
              <Globe2 className="h-3 w-3" />
              <span>{t('settings.tabs.import.platform')}</span>
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Quick Start Guide */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Info className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('settings.tabs.import.quickStart')}</h3>
                  <p className="text-sm text-gray-600 mt-1">{t('settings.tabs.import.followSteps')}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{t('settings.tabs.import.downloadTemplate')}</h4>
                    <p className="text-sm text-gray-600 mt-1">{t('settings.tabs.import.getTemplate')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{t('settings.tabs.import.fillData')}</h4>
                    <p className="text-sm text-gray-600 mt-1">{t('settings.tabs.import.completeFields')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{t('settings.tabs.import.uploadImport')}</h4>
                    <p className="text-sm text-gray-600 mt-1">{t('settings.tabs.import.uploadPreviewImport')}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button 
                  onClick={generateTemplate}
                  disabled={loadingData}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>{t('settings.tabs.import.downloadTemplate')}</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Configuration Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Settings className="h-5 w-5 text-gray-700" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('settings.tabs.import.importConfiguration')}</h3>
                  <p className="text-sm text-gray-600 mt-1">{t('settings.tabs.import.configureSettings')}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <Building className="inline h-4 w-4 mr-2" />
                    {t('settings.tabs.import.selectCountry')}
                    <span className="text-gray-500 font-normal ml-1">({t('common.optional')})</span>
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    disabled={loadingData}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {loadingData ? t('settings.tabs.import.loading') : t('settings.tabs.import.allCountries')}
                    </option>
                    {countries.map(country => (
                      <option key={country.id} value={country.id}>
                        {country.code} - {country.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500">
                    {t('settings.tabs.import.overrideCountry')}
                    {!loadingData && (
                      <span className="block mt-1 text-gray-400">
                        {countries.length > 0 
                          ? `${countries.length} ${t('settings.tabs.import.countriesAvailable')}` 
                          : t('settings.tabs.import.unableLoadCountries')
                        }
                      </span>
                    )}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <Filter className="inline h-4 w-4 mr-2" />
                    {t('settings.tabs.import.importMode')}
                  </label>
                  <select
                    value={importMode}
                    onChange={(e) => setImportMode(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="add">{t('settings.tabs.import.addNewOnly')}</option>
                    <option value="update">{t('settings.tabs.import.updateExisting')}</option>
                    <option value="replace">{t('settings.tabs.import.replaceByCode')}</option>
                  </select>
                  <p className="text-xs text-gray-500">
                    {t('settings.tabs.import.handleExisting')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Upload Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Cloud className="h-5 w-5 text-gray-700" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('settings.tabs.import.fileUpload')}</h3>
                  <p className="text-sm text-gray-600 mt-1">{t('settings.tabs.import.selectExcelFile')}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileSpreadsheet className="h-6 w-6 text-gray-600" />
                  </div>
                  
                  <div>
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors mb-2"
                    >
                      <Upload className="h-5 w-5 mr-2" />
                      {t('settings.tabs.import.selectFile')}
                    </label>
                    
                    {/* Input de archivo oculto */}
                    <input
                      id="file-upload"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    {/* Botón alternativo si el label no funciona */}
                    <button
                      type="button"
                      onClick={() => document.getElementById('file-upload').click()}
                      className="ml-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      style={{ display: 'none' }} // Oculto por defecto
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Alternativo
                    </button>
                    <p className="text-sm text-gray-500">
                      {t('settings.tabs.import.supportsXlsx')}
                    </p>
                  </div>

                  {file && (
                    <Alert variant="info">
                      <div>
                        <p className="font-medium">{t('settings.tabs.import.fileSelected')}:</p>
                        <p className="text-sm mt-1">
                          <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
                        </p>
                      </div>
                    </Alert>
                  )}
                </div>
              </div>

              {file && (
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={previewFile}
                    disabled={isUploading}
                    variant="secondary"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {t('settings.tabs.import.preview')}
                  </Button>
                  
                  {previewData && errors.length === 0 && (
                    <Button
                      onClick={processImport}
                      disabled={isUploading}
                      loading={isUploading}
                      variant="success"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      {isUploading ? `${t('settings.tabs.import.uploading')} ${uploadProgress}%` : t('settings.tabs.import.processImport')}
                    </Button>
                  )}
                </div>
              )}

              {isUploading && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>{t('settings.tabs.import.importProgress')}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <ProgressBar value={uploadProgress} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Validation Errors */}
          {errors.length > 0 && (
            <Card>
              <CardContent>
                <Alert variant="error">
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <h4 className="font-semibold">
                        {t('settings.tabs.import.validationErrors')} ({errors.length})
                      </h4>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Preview Data */}
          {previewData && errors.length === 0 && (
            <Card>
              <CardContent>
                <Alert variant="success">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">
                        {t('settings.tabs.import.dataPreview')} - {previewData.totalRows} {t('settings.tabs.import.productsReady')}
                      </h4>
                      <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {t('settings.tabs.import.codesAutoGenerated')}
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <div className="flex items-start space-x-2">
                        <div className="text-blue-600">ℹ️</div>
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-1">{t('settings.tabs.import.codeGenerationInfo')}</p>
                          <ul className="text-xs list-disc list-inside space-y-1">
                            <li>{t('settings.tabs.import.codeFormat')}: [PAÍS][DD][MM][AA][NNN]</li>
                            <li>{t('settings.tabs.import.codeExample')}: {generateProductCode(null, 0)}</li>
                            <li>{t('settings.tabs.import.codeExplanation')}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="overflow-x-auto max-h-80">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('settings.tabs.import.row')}</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('settings.tabs.import.generatedCode')}</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('products.name')}</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('settings.tabs.import.lot')}</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.quantity')}</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('settings.tabs.import.unitWeight')}</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('settings.tabs.import.totalWeight')}</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('settings.tabs.import.expirationDate')}</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('products.supplier')}</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('settings.tabs.import.responsible')}</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('products.category')}</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('settings.tabs.import.comments')}</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {previewData.data.slice(0, 5).map((row, index) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-3 py-2 text-xs font-medium text-gray-900">{row.rowNumber}</td>
                                <td className="px-3 py-2 text-xs text-blue-600 font-mono">{row.codigo_generado}</td>
                                <td className="px-3 py-2 text-xs text-gray-600 max-w-32 truncate" title={row.nombre}>{row.nombre}</td>
                                <td className="px-3 py-2 text-xs text-gray-600">{row.lote}</td>
                                <td className="px-3 py-2 text-xs text-gray-600">{row.cantidad}</td>
                                <td className="px-3 py-2 text-xs text-gray-600">{row.peso_unitario} Kg</td>
                                <td className="px-3 py-2 text-xs text-gray-600">{row.peso_total} Kg</td>
                                <td className="px-3 py-2 text-xs text-gray-600">{row.fecha_vencimiento}</td>
                                <td className="px-3 py-2 text-xs text-gray-600 max-w-24 truncate" title={row.proveedor}>{row.proveedor}</td>
                                <td className="px-3 py-2 text-xs text-gray-600 max-w-20 truncate" title={row.responsable}>{row.responsable}</td>
                                <td className="px-3 py-2 text-xs">
                                  <Badge variant="default" className="text-xs px-1 py-0">{row.categoria}</Badge>
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-600 max-w-24 truncate" title={row.comentarios}>{row.comentarios}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {previewData.data.length > 5 && (
                        <div className="px-4 py-3 bg-gray-50 text-center text-sm text-gray-500">
                          {t('settings.tabs.import.moreProducts', { count: previewData.data.length - 5 })}
                        </div>
                      )}
                    </div>
                  </div>
                </Alert>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportProducts;