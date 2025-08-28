// Traducciones en Español - Sistema Univar de Gestión de Inventarios
export const es = {
  // Navegación y Menú
  navigation: {
    dashboard: 'Panel de Control',
    themes: 'Apariencia',
    languages: 'Idiomas',
    products: 'Catálogo de Productos',
    movements: 'Movimientos de Stock',
    kardex: 'Kardex',
    users: 'Gestión de Usuarios',
    reports: 'Reportes y Análisis',
    settings: 'Configuración'
  },

  // Común
  common: {
    // Acciones
    save: 'Guardar Cambios',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    create: 'Crear Nuevo',
    update: 'Actualizar',
    search: 'Buscar...',
    filter: 'Filtrar',
    export: 'Exportar Datos',
    filter: 'Filtros',
    import: 'Importar',
    refresh: 'Actualizar',
    close: 'Cerrar',
    confirm: 'Confirmar',
    yes: 'Sí',
    no: 'No',
    loading: 'Cargando...',
    
    // Estados
    active: 'Activo',
    inactive: 'Inactivo',
    status: 'Estado',
    expired: 'Vencido',
    expiringSoon: 'Por Vencer',
    actions: 'Acciones',
    enabled: 'Habilitado',
    disabled: 'Deshabilitado',
    available: 'Disponible',
    unavailable: 'No Disponible',
    notAvailable: 'N/A',
    inStock: 'En Stock',
    outOfStock: 'Agotado',
    lowStock: 'Stock Bajo',
    
    // Tiempo
    today: 'Hoy',
    unknown: 'Desconocido',
    yesterday: 'Ayer',
    lastWeek: 'Última Semana',
    lastMonth: 'Último Mes',
    thisMonth: 'Este Mes',
    date: 'Fecha',
    error: 'Error',
    time: 'Hora',
    
    // Idiomas
    spanish: 'Español',
    english: 'Inglés',
    
    // Medidas
    optional: 'Opcional',
    units: 'Unidades',
    quantity: 'Cantidad',
    total: 'Total',
    subtotal: 'Subtotal',
    saving: 'Guardando...',
    create: 'Crear',
    update: 'Actualizar',
    confirm: 'Confirmar',
    processing: 'Procesando...'
  },

  // Dashboard
  dashboard: {
    title: 'Panel de Control Univar',
    welcome: 'Bienvenido de nuevo, {{name}}',
    commercialPanel: 'Panel Comercial',
    commercialWelcome: 'Hola {{name}}, haz clic en "Reportes" para ver tus datos.',
    goToReports: 'Ir a Reportes',
    
    // Estadísticas
    stats: {
      totalProducts: 'Total Productos',
      totalStock: 'Inventario Total',
      lowStockItems: 'Stock Bajo',
      totalMovements: 'Movimientos del Mes',
      recentMovements: 'Movimientos Recientes',
      stockValue: 'Valor del Inventario',
      categories: 'Categorías Activas'
    }
  },

  // Productos
  products: {
    title: 'Gestión de Productos',
    subtitle: 'Catálogo completo de productos Univar',
    addProduct: 'Agregar Producto',
    editProduct: 'Editar Producto',
    productDetails: 'Detalles del Producto',
    
    // Campos
    code: 'Código de Producto',
    name: 'Nombre del Producto',
    description: 'Descripción',
    category: 'Categoría',
    stock: 'Stock Actual',
    minStock: 'Stock Mínimo',
    maxStock: 'Stock Máximo',
    price: 'Precio Unitario',
    supplier: 'Proveedor',
    location: 'Ubicación',
    status: 'Estado del Producto',
    expirationDate: 'Fecha de Vencimiento',
    batchNumber: 'Número de Lote',
    
    // Estados
    available: 'Disponible',
    discontinued: 'Descontinuado',
    expired: 'Vencido',
    
    // Acciones
    viewDetails: 'Ver Detalles',
    adjustStock: 'Ajustar Stock',
    generateReport: 'Generar Reporte',
    details: 'Detalles',
    inventory: 'Inventario',
    loading: 'Cargando productos...',
    noProductsFound: 'No se encontraron productos',
    adjustSearchFilter: 'Intente ajustar su búsqueda o criterios de filtro',
    confirmDelete: '¿Está seguro de que desea eliminar este producto?',
    exportLimitWarning: '⚠️ Se exportaron los primeros 1,000 registros (límite de exportación). Considere aplicar filtros para reducir el conjunto de datos.',
    noCategory: 'Sin Categoría',
    notSpecified: 'No especificado',
    notAssigned: 'No asignado',
    lotNumber: 'Número de Lote',
    supplierAndResponsibility: 'Proveedor y Responsabilidad',
    responsiblePerson: 'Persona Responsable',
    inventoryInformation: 'Información de Inventario',
    currentStock: 'Stock Actual',
    allCategories: 'Todas las Categorías',
    registrationDate: 'Fecha de Registro',
    
    // Categorías
    categories: {
      others: 'Otros'
    },
    
    // Estadísticas
    stats: {
      totalProducts: 'Total Productos',
      activeProducts: 'Productos Activos',
      expiringSoon: 'Por Vencer Pronto',
      expired: 'Vencidos',
      inGoodCondition: 'En Buen Estado',
      within30Days: 'Dentro de 30 días',
      needAttention: 'Necesitan Atención'
    },
    
    // Validaciones
    validation: {
      codeRequired: 'El código es requerido',
      nameRequired: 'El nombre es requerido',
      lotRequired: 'El lote es requerido',
      quantityGreaterThanZero: 'La cantidad debe ser mayor a 0',
      unitWeightGreaterThanZero: 'El peso unitario debe ser mayor a 0',
      expirationDateRequired: 'La fecha de vencimiento es requerida',
      supplierRequired: 'El proveedor es requerido',
      responsibleRequired: 'El responsable es requerido',
      categoryRequired: 'La categoría es requerida',
      countryRequired: 'Debe seleccionar un país',
      noCountriesAssigned: 'No tiene países asignados. Contacte al administrador.'
    }
  },

  // Movimientos
  movements: {
    title: 'Movimientos de Inventario',
    subtitle: 'Registro completo de entradas y salidas',
    addMovement: 'Registrar Movimiento',
    
    // Tipos
    entry: 'Entrada',
    exit: 'Salida', 
    adjustment: 'Ajuste',
    transfer: 'Transferencia',
    
    // Campos
    type: 'Tipo de Movimiento',
    product: 'Producto',
    quantity: 'Cantidad',
    reason: 'Motivo',
    reference: 'Referencia',
    user: 'Usuario Responsable',
    date: 'Fecha del Movimiento',
    notes: 'Observaciones',
    
    // Motivos
    reasons: {
      purchase: 'Compra',
      sale: 'Venta',
      return: 'Devolución',
      damaged: 'Producto Dañado',
      expired: 'Producto Vencido',
      stockAdjustment: 'Ajuste de Inventario',
      transfer: 'Transferencia entre Ubicaciones',
    
    // Nuevas traducciones
    initialStock: 'Stock Inicial',
    loading: 'Cargando movimientos...',
    errorLoading: 'Error al cargar movimientos',
    errorExporting: 'Error al exportar datos',
    exportLimitWarning: '⚠️ Se exportaron 25,000 registros (límite máximo). Puede haber más movimientos no incluidos. Considere aplicar filtros de fecha para reducir el conjunto de datos.',
    totalMovements: 'Total de Movimientos',
    searchPlaceholder: 'Buscar productos, códigos o persona responsable...',
    clearFilters: 'Limpiar Filtros',
    type: 'Tipo',
    previousStock: 'Stock Anterior',
    newStock: 'Stock Nuevo',
    responsible: 'Responsable',
    reason: 'Motivo',
    notes: 'Observaciones',
    
    // Traducciones adicionales para movimientos
    noMovementsFound: 'No se encontraron movimientos',
    adjustSearchFilter: 'Intente ajustar su búsqueda o criterios de filtro',
    inventoryMovements: 'Movimientos de Inventario',
    trackManageDescription: 'Seguimiento y gestión de entradas, salidas y ajustes de inventario en ubicaciones globales',
    globalOperations: 'Operaciones Globales',
    newEntry: 'Nueva Entrada',
    newExit: 'Nueva Salida',
    entries: 'Entradas',
    exits: 'Salidas',
    adjustments: 'Ajustes',
    stockAdditions: 'Adiciones de stock',
    stockReductions: 'Reducciones de stock',
    stockCorrections: 'Correcciones de stock',
    change: 'Cambio',
    stockUpdate: 'Actualización de Stock',
    quantityChange: 'Cambio de Cantidad',
    movementDetails: 'Detalles del Movimiento',
    movementType: 'Tipo de Movimiento',
    allTypes: 'Todos los Tipos',
    allCountries: 'Todos los Países',
    fromDate: 'Fecha Desde',
    toDate: 'Fecha Hasta',
    qty: 'Cant.',
    showing: 'Mostrando',
    to: 'a',
    of: 'de',
    movements: 'movimientos',
    previous: 'Anterior',
    next: 'Siguiente'
    }
  },

  // Kardex
  kardex: {
    title: 'Kardex de Inventarios',
    subtitle: 'Control detallado de movimientos por producto',
    selectProduct: 'Seleccionar Producto',
    dateRange: 'Rango de Fechas',
    
    // Columnas
    date: 'Fecha',
    movement: 'Movimiento',
    entries: 'Entradas',
    exits: 'Salidas',
    balance: 'Saldo',
    reference: 'Referencia',
    user: 'Usuario'
  },

  // Usuarios
  users: {
    title: 'Gestión de Usuarios',
    subtitle: 'Administración de usuarios del sistema',
    addUser: 'Agregar Usuario',
    editUser: 'Editar Usuario',
    
    // Campos
    firstName: 'Nombres',
    lastName: 'Apellidos',
    email: 'Correo Electrónico',
    role: 'Rol de Usuario',
    password: 'Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    lastLogin: 'Último Acceso',
    
    // Roles
    roles: {
      admin: 'Administrador',
      user: 'Usuario',
      commercial: 'Comercial',
      viewer: 'Solo Consulta'
    }
  },

  // Reportes
  reports: {
    title: 'Reportes y Análisis',
    subtitle: 'Información estratégica para la toma de decisiones',
    
    // Tipos de reportes
    inventory: 'Reporte de Inventario',
    movements: 'Reporte de Movimientos',
    rotation: 'Análisis de Rotación',
    valuation: 'Valoración de Inventario',
    commercial: 'Dashboard Comercial',
    
    // Métricas
    totalValue: 'Valor Total',
    averageRotation: 'Rotación Promedio',
    fastMoving: 'Productos de Alta Rotación',
    slowMoving: 'Productos de Baja Rotación',
    stockByCategory: 'Stock por Categoría',
    movementsSummary: 'Resumen de Movimientos',
    
    // Filtros
    category: 'Categoría',
    dateFrom: 'Desde',
    dateTo: 'Hasta',
    groupBy: 'Agrupar por',
    period: 'Período'
  },

  // Configuración
  settings: {
    title: 'Configuración del Sistema',
    subtitle: 'Gestión y configuración del sistema de inventarios',
    
    // Tabs/Pestañas
    tabs: {
      import: {
        name: 'Importar Datos',
        description: 'Importar productos desde Excel',
        title: 'Importar Productos',
        subtitle: 'Importar datos de productos desde archivos Excel al sistema Univar Solutions',
        platform: 'Plataforma Global',
        quickStart: 'Guía de Inicio Rápido',
        selectFile: 'Seleccionar Archivo',
        uploadFile: 'Subir Archivo',
        processImport: 'Procesar Importación',
        downloadTemplate: 'Descargar Plantilla',
        selectCountry: 'Seleccionar País',
        importMode: 'Modo de Importación',
        addMode: 'Agregar Datos',
        replaceMode: 'Reemplazar Datos',
        preview: 'Vista Previa',
        errors: 'Errores',
        noErrors: 'Sin Errores',
        loading: 'Cargando...',
        uploading: 'Subiendo...',
        processing: 'Procesando...',
        fileUpload: 'Subida de Archivo',
        selectExcelFile: 'Seleccione su archivo Excel para importar',
        addNewOnly: 'Agregar solo productos nuevos',
        updateExisting: 'Actualizar productos existentes',
        replaceByCode: 'Reemplazar productos por código',
        handleExisting: 'Elija cómo manejar productos existentes durante la importación',
        followSteps: 'Siga estos pasos para importar sus datos de productos',
        allCountries: 'Todos los países (según Excel)',
        countriesAvailable: 'países disponibles',
        unableLoadCountries: 'No se pudieron cargar países',
        overrideCountry: 'Sobrescribir asignación de país para todos los productos importados',
        getTemplate: 'Obtener la plantilla Excel con el formato adecuado y ejemplos',
        fillData: 'Completar Datos',
        completeFields: 'Complete todos los campos requeridos siguiendo el formato proporcionado',
        uploadImport: 'Subir e Importar',
        uploadPreviewImport: 'Suba su archivo, previsualice los datos e importe al sistema',
        importConfiguration: 'Configuración de Importación',
        configureSettings: 'Configure los ajustes de importación y destino',
        supportsXlsx: 'Admite archivos .xlsx hasta 10MB',
        fileSelected: 'Archivo seleccionado',
        importProgress: 'Progreso de Importación',
        validationErrors: 'Errores de Validación',
        dataPreview: 'Vista Previa de Datos',
        productsReady: 'productos listos para importar',
        row: 'Fila',
        lot: 'Lote',
        moreProducts: '... y {{count}} productos más',
        invalidFileType: 'Por favor, seleccione un archivo Excel (.xlsx o .xls)',
        generatedCode: 'Código Generado',
        unitWeight: 'Peso Unitario',
        totalWeight: 'Peso Total',
        expirationDate: 'F. Vencimiento',
        responsible: 'Responsable',
        comments: 'Comentarios',
        codesAutoGenerated: 'Códigos Automáticos',
        codeGenerationInfo: 'Los códigos se generarán automáticamente al importar:',
        codeFormat: 'Formato',
        codeExample: 'Ejemplo',
        codeExplanation: 'PAÍS + Día + Mes + Año (2 díg.) + Correlativo (3 díg.)'
      },
      delete: {
        name: 'Eliminar Datos',
        description: 'Eliminar datos por país',
        dangerZone: '⚠️ ZONA DE PELIGRO - ELIMINACIÓN MASIVA DE DATOS',
        warningMessage: 'Esta acción eliminará PERMANENTEMENTE todos los datos seleccionados del país especificado. Esta operación NO SE PUEDE DESHACER.',
        backupWarning: 'Asegúrese de tener backups actualizados antes de proceder',
        verifyCountry: 'Verifique dos veces el país seleccionado',
        requiresPassword: 'Esta acción requiere contraseña de administrador',
        configTitle: 'Configuración de Eliminación',
        countryToDelete: 'País a eliminar',
        selectCountryOption: 'Seleccione un país',
        dataTypeLabel: 'Tipo de datos a eliminar',
        onlyProducts: 'Solo productos',
        onlyMovements: 'Solo movimientos',
        productsAndMovements: 'Productos y movimientos',
        includeAssociatedMovements: 'Incluir movimientos asociados a los productos',
        adminPasswordLabel: 'Contraseña de administrador',
        confirmPasswordLabel: 'Confirmar contraseña',
        enterPasswordPlaceholder: 'Ingrese la contraseña',
        confirmPasswordPlaceholder: 'Confirme la contraseña',
        previewTitle: 'Vista Previa',
        selectedCountry: 'País seleccionado',
        lastActivity: 'Última actividad',
        toBeDeleted: 'Se eliminarán',
        selectCountryStats: 'Seleccione un país para ver las estadísticas de eliminación',
        deleteData: 'Eliminar Datos',
        finalConfirmation: 'Confirmación Final',
        confirmationQuestion: '¿Está absolutamente seguro de que desea eliminar todos los {{dataType}} del país {{country}}',
        irreversibleWarning: 'Esta acción es IRREVERSIBLE y eliminará permanentemente los datos seleccionados.',
        deleting: 'Eliminando...',
        confirmDelete: 'SÍ, ELIMINAR DEFINITIVAMENTE',
        selectCountry: 'Por favor, seleccione un país',
        enterPassword: 'Por favor, ingrese la contraseña de administrador',
        incorrectPassword: 'Contraseña incorrecta',
        passwordMismatch: 'La confirmación de contraseña no coincide',
        deleteError: 'Error durante la eliminación. Intente nuevamente.'
      },
      countries: {
        name: 'Países',
        description: 'Gestionar países del sistema',
        title: 'Gestión de Países',
        new: 'Nuevo País',
        createTitle: 'Crear Nuevo País',
        nameLabel: 'Nombre',
        codeLabel: 'Código',
        country: 'País',
        code: 'Código',
        created: 'Creado',
        actions: 'Acciones',
        loading: 'Cargando países...',
        errorLoading: 'Error al cargar países. Verifique la conexión con el servidor.',
        nameRequired: 'El nombre es obligatorio',
        codeRequired: 'El código es obligatorio',
        codeMaxLength: 'El código debe tener máximo 5 caracteres',
        codeExists: 'Este código ya existe',
        createdSuccess: 'País creado exitosamente',
        createError: 'Error al crear país',
        updatedSuccess: 'País actualizado exitosamente',
        updateError: 'Error al actualizar país',
        deleteConfirm: '¿Está seguro de que desea eliminar este país?\n\nNOTA: Solo se puede eliminar si no tiene productos asociados.',
        deletedSuccess: 'País eliminado exitosamente',
        deleteError: 'Error al eliminar país',
        toggleError: 'Error al cambiar estado del país',
        noCountries: 'No hay países configurados',
        createFirst: 'Crear el primer país',
        importantInfo: 'Información importante',
        inactiveInfo: 'Los países inactivos no aparecerán en formularios de creación de productos',
        deleteInfo: 'No se puede eliminar un país que tenga productos asociados',
        codeInfo: 'El código del país debe ser único y se usa en la generación de códigos de productos'
      },
      categories: {
        name: 'Categorías',
        description: 'Gestionar categorías de productos'
      },
      system: {
        name: 'Sistema',
        description: 'Configuración del sistema'
      }
    },
    
    // Secciones
    general: 'Configuración General',
    security: 'Seguridad',
    notifications: 'Notificaciones',
    backup: 'Respaldo y Recuperación',
    
    // Configuraciones
    companyName: 'Nombre de la Empresa',
    systemName: 'Nombre del Sistema',
    timezone: 'Zona Horaria',
    currency: 'Moneda',
    language: 'Idioma del Sistema',
    dateFormat: 'Formato de Fecha',
    
    // Alertas
    lowStockAlert: 'Alerta de Stock Bajo',
    expirationAlert: 'Alerta de Vencimiento',
    emailNotifications: 'Notificaciones por Email'
  },

  // Temas
  themes: {
    title: 'Personalización de Apariencia',
    subtitle: 'Personaliza los colores y aspecto del sistema',
    customColors: 'Colores Personalizados',
    livePreview: 'Vista Previa en Tiempo Real',
    darkMode: 'Modo Oscuro',
    lightMode: 'Modo Claro',
    
    // Colores
    primaryColor: 'Color Principal',
    secondaryColor: 'Color Secundario',
    accentColor: 'Color de Acento',
    backgroundColor: 'Color de Fondo',
    textColor: 'Color del Texto'
  },

  // Idiomas
  languages: {
    title: 'Configuración de Idioma',
    subtitle: 'Selecciona el idioma de la interfaz del sistema',
    currentLanguage: 'Idioma Actual',
    availableLanguages: 'Idiomas Disponibles',
    changeLanguage: 'Cambiar Idioma',
    systemLanguage: 'Idioma del Sistema',
    userPreference: 'Preferencia del Usuario',
    
    // Descripción
    description: 'El cambio de idioma se aplicará inmediatamente en toda la interfaz del sistema. Esta configuración se guardará para futuras sesiones.',
    
    // Mensajes
    languageChanged: 'Idioma cambiado exitosamente',
    languageChangeError: 'Error al cambiar el idioma',
    restartRequired: 'Es recomendable refrescar la página para aplicar todos los cambios'
  },

  // Mensajes del Sistema
  messages: {
    success: {
      saved: 'Cambios guardados exitosamente',
      created: 'Elemento creado correctamente',
      updated: 'Información actualizada',
      deleted: 'Elemento eliminado',
      imported: 'Datos importados correctamente',
      exported: 'Datos exportados exitosamente'
    },
    
    error: {
      generic: 'Ha ocurrido un error inesperado',
      network: 'Error de conexión. Verifique su conexión a internet',
      validation: 'Por favor complete todos los campos requeridos',
      permissions: 'No tiene permisos para realizar esta acción',
      notFound: 'El elemento solicitado no fue encontrado',
      serverError: 'Error interno del servidor'
    },
    
    confirmation: {
      delete: '¿Está seguro que desea eliminar este elemento?',
      save: '¿Desea guardar los cambios realizados?',
      logout: '¿Está seguro que desea cerrar sesión?',
      discard: 'Los cambios no guardados se perderán'
    }
  },

  // Autenticación
  auth: {
    login: 'Iniciar Sesión',
    logout: 'Cerrar Sesión',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    rememberMe: 'Recordarme',
    forgotPassword: 'Olvidé mi contraseña',
    welcome: 'Bienvenido al Sistema Univar',
    invalidCredentials: 'Credenciales inválidas',
    sessionExpired: 'Su sesión ha expirado',
    loginError: 'Error al iniciar sesión',
    emailRequired: 'El correo electrónico es requerido',
    emailInvalid: 'El correo electrónico no es válido',
    passwordRequired: 'La contraseña es requerida',
    passwordMinLength: 'La contraseña debe tener al menos 6 caracteres'
  },

  // Modal
  modal: {
    confirmAction: 'Confirmar Acción',
    confirmMessage: '¿Estás seguro de que deseas continuar?'
  }
};