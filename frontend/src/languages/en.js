// English Translations - Univar Inventory Management System
export const en = {
  // Navigation and Menu
  navigation: {
    dashboard: 'Control Dashboard',
    themes: 'Visual Settings',
    languages: 'Languages',
    products: 'Product Catalog',
    movements: 'Stock Movements',
    kardex: 'Stock Records',
    users: 'User Management',
    reports: 'Reports & Analytics',
    settings: 'Configuration'
  },

  // Common
  common: {
    // Actions
    save: 'Save Changes',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    create: 'Create New',
    update: 'Update',
    search: 'Search...',
    filter: 'Filter',
    export: 'Export Data',
    filter: 'Filters',
    import: 'Import',
    refresh: 'Refresh',
    close: 'Close',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    loading: 'Loading...',
    
    // States
    active: 'Active',
    inactive: 'Inactive',
    status: 'Status',
    expired: 'Expired',
    expiringSoon: 'Expiring Soon',
    actions: 'Actions',
    enabled: 'Enabled',
    disabled: 'Disabled',
    available: 'Available',
    unavailable: 'Not Available',
    notAvailable: 'N/A',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    lowStock: 'Low Stock',
    
    // Time
    today: 'Today',
    unknown: 'Unknown',
    yesterday: 'Yesterday',
    lastWeek: 'Last Week',
    lastMonth: 'Last Month',
    thisMonth: 'This Month',
    date: 'Date',
    error: 'Error',
    time: 'Time',
    
    // Languages
    spanish: 'Spanish',
    english: 'English',
    
    // Measures
    optional: 'Optional',
    units: 'Units',
    quantity: 'Quantity',
    total: 'Total',
    subtotal: 'Subtotal',
    saving: 'Saving...',
    create: 'Create',
    update: 'Update',
    confirm: 'Confirm',
    processing: 'Processing...'
  },

  // Dashboard
  dashboard: {
    title: 'Univar Control Dashboard',
    welcome: 'Welcome back, {{name}}',
    commercialPanel: 'Commercial Dashboard',
    commercialWelcome: 'Hello {{name}}, click "Reports" to view your data.',
    goToReports: 'Go to Reports',
    
    // Statistics
    stats: {
      totalProducts: 'Total Products',
      totalStock: 'Total Inventory',
      lowStockItems: 'Low Stock',
      totalMovements: 'Monthly Movements',
      recentMovements: 'Recent Movements',
      stockValue: 'Inventory Value',
      categories: 'Active Categories'
    }
  },

  // Products
  products: {
    title: 'Product Management',
    subtitle: 'Complete Univar product catalog',
    addProduct: 'Add Product',
    editProduct: 'Edit Product',
    productDetails: 'Product Details',
    
    // Fields
    code: 'Product Code',
    name: 'Product Name',
    description: 'Description',
    category: 'Category',
    stock: 'Current Stock',
    minStock: 'Minimum Stock',
    maxStock: 'Maximum Stock',
    price: 'Unit Price',
    supplier: 'Supplier',
    location: 'Location',
    status: 'Product Status',
    expirationDate: 'Expiration Date',
    batchNumber: 'Batch Number',
    
    // States
    available: 'Available',
    discontinued: 'Discontinued',
    expired: 'Expired',
    
    // Actions
    viewDetails: 'View Details',
    adjustStock: 'Adjust Stock',
    generateReport: 'Generate Report',
    details: 'Details',
    inventory: 'Inventory',
    loading: 'Loading products...',
    noProductsFound: 'No products found',
    adjustSearchFilter: 'Try adjusting your search or filter criteria',
    confirmDelete: 'Are you sure you want to delete this product?',
    exportLimitWarning: '⚠️ Exported first 1,000 records (export limit). Consider applying filters to reduce the dataset.',
    noCategory: 'No Category',
    notSpecified: 'Not specified',
    notAssigned: 'Not assigned',
    lotNumber: 'Lot Number',
    supplierAndResponsibility: 'Supplier & Responsibility',
    responsiblePerson: 'Responsible Person',
    inventoryInformation: 'Inventory Information',
    currentStock: 'Current Stock',
    allCategories: 'All Categories',
    registrationDate: 'Registration Date',
    
    // Categories
    categories: {
      others: 'Others'
    },
    
    // Statistics
    stats: {
      totalProducts: 'Total Products',
      activeProducts: 'Active Products',
      expiringSoon: 'Expiring Soon',
      expired: 'Expired',
      inGoodCondition: 'In Good Condition',
      within30Days: 'Within 30 Days',
      needAttention: 'Need Attention'
    },
    
    // Validations
    validation: {
      codeRequired: 'Code is required',
      nameRequired: 'Name is required',
      lotRequired: 'Lot is required',
      quantityGreaterThanZero: 'Quantity must be greater than 0',
      unitWeightGreaterThanZero: 'Unit weight must be greater than 0',
      expirationDateRequired: 'Expiration date is required',
      supplierRequired: 'Supplier is required',
      responsibleRequired: 'Responsible is required',
      categoryRequired: 'Category is required',
      countryRequired: 'Must select a country',
      noCountriesAssigned: 'No countries assigned. Contact administrator.'
    }
  },

  // Movements
  movements: {
    title: 'Inventory Movements',
    subtitle: 'Complete record of entries and exits',
    addMovement: 'Register Movement',
    
    // Types
    entry: 'Entry',
    exit: 'Exit',
    adjustment: 'Adjustment',
    transfer: 'Transfer',
    
    // Fields
    type: 'Movement Type',
    product: 'Product',
    quantity: 'Quantity',
    reason: 'Reason',
    reference: 'Reference',
    user: 'Responsible User',
    date: 'Movement Date',
    notes: 'Notes',
    
    // Reasons
    reasons: {
      purchase: 'Purchase',
      sale: 'Sale',
      return: 'Return',
      damaged: 'Damaged Product',
      expired: 'Expired Product',
      stockAdjustment: 'Inventory Adjustment',
      transfer: 'Location Transfer',
    
    // New translations
    initialStock: 'Initial Stock',
    loading: 'Loading movements...',
    errorLoading: 'Error loading movements',
    errorExporting: 'Error exporting data',
    exportLimitWarning: '⚠️ Exported 25,000 records (maximum limit). There may be more movements not included. Consider applying date filters to reduce the dataset.',
    totalMovements: 'Total Movements',
    searchPlaceholder: 'Search products, codes, or responsible person...',
    clearFilters: 'Clear Filters',
    type: 'Type',
    previousStock: 'Previous Stock',
    newStock: 'New Stock',
    responsible: 'Responsible',
    reason: 'Reason',
    notes: 'Notes',
    
    // Additional movement translations
    noMovementsFound: 'No movements found',
    adjustSearchFilter: 'Try adjusting your search or filter criteria',
    inventoryMovements: 'Inventory Movements',
    trackManageDescription: 'Track and manage product entries, exits, and stock adjustments across global locations',
    globalOperations: 'Global Operations',
    newEntry: 'New Entry',
    newExit: 'New Exit',
    entries: 'Entries',
    exits: 'Exits',
    adjustments: 'Adjustments',
    stockAdditions: 'Stock additions',
    stockReductions: 'Stock reductions',
    stockCorrections: 'Stock corrections',
    change: 'Change',
    stockUpdate: 'Stock Update',
    quantityChange: 'Quantity Change',
    movementDetails: 'Movement Details',
    movementType: 'Movement Type',
    allTypes: 'All Types',
    allCountries: 'All Countries',
    fromDate: 'From Date',
    toDate: 'To Date',
    qty: 'Qty',
    showing: 'Showing',
    to: 'to',
    of: 'of',
    movements: 'movements',
    previous: 'Previous',
    next: 'Next'
    }
  },

  // Kardex
  kardex: {
    title: 'Inventory Records',
    subtitle: 'Detailed movement control by product',
    selectProduct: 'Select Product',
    dateRange: 'Date Range',
    
    // Columns
    date: 'Date',
    movement: 'Movement',
    entries: 'Entries',
    exits: 'Exits',
    balance: 'Balance',
    reference: 'Reference',
    user: 'User'
  },

  // Users
  users: {
    title: 'User Management',
    subtitle: 'System user administration',
    addUser: 'Add User',
    editUser: 'Edit User',
    
    // Fields
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email Address',
    role: 'User Role',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    lastLogin: 'Last Login',
    
    // Roles
    roles: {
      admin: 'Administrator',
      user: 'User',
      commercial: 'Commercial',
      viewer: 'View Only'
    }
  },

  // Reports
  reports: {
    title: 'Reports & Analytics',
    subtitle: 'Strategic information for decision making',
    
    // Report types
    inventory: 'Inventory Report',
    movements: 'Movement Report',
    rotation: 'Rotation Analysis',
    valuation: 'Inventory Valuation',
    commercial: 'Commercial Dashboard',
    
    // Metrics
    totalValue: 'Total Value',
    averageRotation: 'Average Rotation',
    fastMoving: 'Fast Moving Products',
    slowMoving: 'Slow Moving Products',
    stockByCategory: 'Stock by Category',
    movementsSummary: 'Movement Summary',
    
    // Filters
    category: 'Category',
    dateFrom: 'From',
    dateTo: 'To',
    groupBy: 'Group by',
    period: 'Period'
  },

  // Settings
  settings: {
    title: 'System Configuration',
    subtitle: 'Inventory system management and configuration',
    
    // Tabs
    tabs: {
      import: {
        name: 'Import Data',
        description: 'Import products from Excel',
        title: 'Import Products',
        subtitle: 'Import product data from Excel files into the Univar Solutions system',
        platform: 'Global Platform',
        quickStart: 'Quick Start Guide',
        selectFile: 'Select File',
        uploadFile: 'Upload File',
        processImport: 'Process Import',
        downloadTemplate: 'Download Template',
        selectCountry: 'Select Country',
        importMode: 'Import Mode',
        addMode: 'Add Data',
        replaceMode: 'Replace Data',
        preview: 'Preview',
        errors: 'Errors',
        noErrors: 'No Errors',
        loading: 'Loading...',
        uploading: 'Uploading...',
        processing: 'Processing...',
        fileUpload: 'File Upload',
        selectExcelFile: 'Select your Excel file for import',
        addNewOnly: 'Add new products only',
        updateExisting: 'Update existing products',
        replaceByCode: 'Replace products by code',
        handleExisting: 'Choose how to handle existing products during import',
        followSteps: 'Follow these steps to import your product data',
        allCountries: 'All countries (as per Excel)',
        countriesAvailable: 'countries available',
        unableLoadCountries: 'Unable to load countries',
        overrideCountry: 'Override country assignment for all imported products',
        getTemplate: 'Get the Excel template with proper formatting and examples',
        fillData: 'Fill Data',
        completeFields: 'Complete all required fields following the provided format',
        uploadImport: 'Upload & Import',
        uploadPreviewImport: 'Upload your file, preview the data, and import to the system',
        importConfiguration: 'Import Configuration',
        configureSettings: 'Configure import settings and target destination',
        supportsXlsx: 'Supports .xlsx files up to 10MB',
        fileSelected: 'File selected',
        importProgress: 'Import Progress',
        validationErrors: 'Validation Errors',
        dataPreview: 'Data Preview',
        productsReady: 'products ready for import',
        row: 'Row',
        lot: 'Lot',
        moreProducts: '... and {{count}} more products',
        invalidFileType: 'Please select an Excel file (.xlsx or .xls)',
        generatedCode: 'Generated Code',
        unitWeight: 'Unit Weight',
        totalWeight: 'Total Weight',
        expirationDate: 'Exp. Date',
        responsible: 'Responsible',
        comments: 'Comments',
        codesAutoGenerated: 'Auto-Generated Codes',
        codeGenerationInfo: 'Product codes will be automatically generated on import:',
        codeFormat: 'Format',
        codeExample: 'Example',
        codeExplanation: 'COUNTRY + Day + Month + Year (2 dig.) + Sequential (3 dig.)'
      },
      delete: {
        name: 'Delete Data',
        description: 'Delete data by country',
        dangerZone: '⚠️ DANGER ZONE - MASS DATA DELETION',
        warningMessage: 'This action will PERMANENTLY delete all selected data from the specified country. This operation CANNOT BE UNDONE.',
        backupWarning: 'Make sure you have updated backups before proceeding',
        verifyCountry: 'Double-check the selected country',
        requiresPassword: 'This action requires administrator password',
        configTitle: 'Deletion Configuration',
        countryToDelete: 'Country to delete',
        selectCountryOption: 'Select a country',
        dataTypeLabel: 'Type of data to delete',
        onlyProducts: 'Products only',
        onlyMovements: 'Movements only',
        productsAndMovements: 'Products and movements',
        includeAssociatedMovements: 'Include movements associated with products',
        adminPasswordLabel: 'Administrator password',
        confirmPasswordLabel: 'Confirm password',
        enterPasswordPlaceholder: 'Enter password',
        confirmPasswordPlaceholder: 'Confirm password',
        previewTitle: 'Preview',
        selectedCountry: 'Selected country',
        lastActivity: 'Last activity',
        toBeDeleted: 'Will be deleted',
        selectCountryStats: 'Select a country to view deletion statistics',
        deleteData: 'Delete Data',
        finalConfirmation: 'Final Confirmation',
        confirmationQuestion: 'Are you absolutely sure you want to delete all {{dataType}} from country {{country}}',
        irreversibleWarning: 'This action is IRREVERSIBLE and will permanently delete the selected data.',
        deleting: 'Deleting...',
        confirmDelete: 'YES, DELETE PERMANENTLY',
        selectCountry: 'Please select a country',
        enterPassword: 'Please enter administrator password',
        incorrectPassword: 'Incorrect password',
        passwordMismatch: 'Password confirmation does not match',
        deleteError: 'Error during deletion. Please try again.'
      },
      countries: {
        name: 'Countries',
        description: 'Manage system countries',
        title: 'Countries Management',
        new: 'New Country',
        createTitle: 'Create New Country',
        nameLabel: 'Name',
        codeLabel: 'Code',
        country: 'Country',
        code: 'Code',
        created: 'Created',
        actions: 'Actions',
        loading: 'Loading countries...',
        errorLoading: 'Error loading countries. Check server connection.',
        nameRequired: 'Name is required',
        codeRequired: 'Code is required',
        codeMaxLength: 'Code must be maximum 5 characters',
        codeExists: 'This code already exists',
        createdSuccess: 'Country created successfully',
        createError: 'Error creating country',
        updatedSuccess: 'Country updated successfully',
        updateError: 'Error updating country',
        deleteConfirm: 'Are you sure you want to delete this country?\n\nNOTE: Can only be deleted if it has no associated products.',
        deletedSuccess: 'Country deleted successfully',
        deleteError: 'Error deleting country',
        toggleError: 'Error changing country status',
        noCountries: 'No countries configured',
        createFirst: 'Create the first country',
        importantInfo: 'Important Information',
        inactiveInfo: 'Inactive countries will not appear in product creation forms',
        deleteInfo: 'Cannot delete a country that has associated products',
        codeInfo: 'Country code must be unique and is used in product code generation'
      },
      categories: {
        name: 'Categories',
        description: 'Manage product categories'
      },
      system: {
        name: 'System',
        description: 'System configuration'
      }
    },
    
    // Sections
    general: 'General Settings',
    security: 'Security',
    notifications: 'Notifications',
    backup: 'Backup & Recovery',
    
    // Settings
    companyName: 'Company Name',
    systemName: 'System Name',
    timezone: 'Timezone',
    currency: 'Currency',
    language: 'System Language',
    dateFormat: 'Date Format',
    
    // Alerts
    lowStockAlert: 'Low Stock Alert',
    expirationAlert: 'Expiration Alert',
    emailNotifications: 'Email Notifications'
  },

  // Themes
  themes: {
    title: 'Visual Customization',
    subtitle: 'Customize system colors and appearance',
    customColors: 'Custom Colors',
    livePreview: 'Live Preview',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    
    // Colors
    primaryColor: 'Primary Color',
    secondaryColor: 'Secondary Color',
    accentColor: 'Accent Color',
    backgroundColor: 'Background Color',
    textColor: 'Text Color'
  },

  // Languages
  languages: {
    title: 'Language Configuration',
    subtitle: 'Select the system interface language',
    currentLanguage: 'Current Language',
    availableLanguages: 'Available Languages',
    changeLanguage: 'Change Language',
    systemLanguage: 'System Language',
    userPreference: 'User Preference',
    
    // Description
    description: 'The language change will be applied immediately throughout the system interface. This setting will be saved for future sessions.',
    
    // Messages
    languageChanged: 'Language changed successfully',
    languageChangeError: 'Error changing language',
    restartRequired: 'It is recommended to refresh the page to apply all changes'
  },

  // System Messages
  messages: {
    success: {
      saved: 'Changes saved successfully',
      created: 'Item created successfully',
      updated: 'Information updated',
      deleted: 'Item deleted',
      imported: 'Data imported successfully',
      exported: 'Data exported successfully'
    },
    
    error: {
      generic: 'An unexpected error occurred',
      network: 'Connection error. Check your internet connection',
      validation: 'Please complete all required fields',
      permissions: 'You do not have permission to perform this action',
      notFound: 'The requested item was not found',
      serverError: 'Internal server error'
    },
    
    confirmation: {
      delete: 'Are you sure you want to delete this item?',
      save: 'Do you want to save the changes made?',
      logout: 'Are you sure you want to log out?',
      discard: 'Unsaved changes will be lost'
    }
  },

  // Authentication
  auth: {
    login: 'Sign In',
    logout: 'Sign Out',
    email: 'Email Address',
    password: 'Password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password',
    welcome: 'Welcome to Univar System',
    invalidCredentials: 'Invalid credentials',
    sessionExpired: 'Your session has expired',
    loginError: 'Error signing in',
    emailRequired: 'Email is required',
    emailInvalid: 'Email is not valid',
    passwordRequired: 'Password is required',
    passwordMinLength: 'Password must be at least 6 characters'
  },

  // Modal
  modal: {
    confirmAction: 'Confirm Action',
    confirmMessage: 'Are you sure you want to continue?'
  }
};