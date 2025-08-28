// src/adapters/productAdapter.js

export class ProductAdapter {
  // Transform backend product data to frontend format
  static fromBackend(backendProduct) {
    return {
      id: backendProduct.id,
      codigo: backendProduct.codigo,
      nombre: backendProduct.nombre,
      lote: backendProduct.lote,
      cantidad: backendProduct.cantidad,
      peso_unitario: backendProduct.peso_unitario,
      peso_total: backendProduct.peso_total,
      fecha_registro: backendProduct.fecha_registro,
      fecha_vencimiento: backendProduct.fecha_vencimiento,
      proveedor: backendProduct.proveedor,
      responsable: backendProduct.responsable,
      comentarios: backendProduct.comentarios || '',
      categoria: backendProduct.categoria_nombre || backendProduct.categoria,
      categoria_id: backendProduct.categoria_id,
      pais: backendProduct.country_nombre || backendProduct.pais || 'N/A',
      country_id: backendProduct.country_id,
      created_by: backendProduct.created_by,
      created_at: backendProduct.created_at,
      updated_at: backendProduct.updated_at,
      // Computed fields
      codigo_pais: backendProduct.codigo_pais,
      numero_secuencial: backendProduct.numero_secuencial,
      dias_para_vencer: backendProduct.dias_para_vencer,
      estado_vencimiento: backendProduct.estado_vencimiento,
      // Additional info
      categoria_nombre: backendProduct.categoria_nombre,
      country_nombre: backendProduct.country_nombre,
      creator_nombre: backendProduct.creator_nombre
    };
  }

  // Helper function to fix timezone issues with dates
  static fixDateForBackend(dateString) {
    if (!dateString) return dateString;
    
    // If it's already a date string in YYYY-MM-DD format, keep it as-is
    // This prevents timezone conversion issues
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      console.log(`[ProductAdapter] Keeping date as-is: ${dateString}`);
      return dateString;
    }
    
    // If it's a Date object or other format, convert to YYYY-MM-DD
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn(`[ProductAdapter] Invalid date: ${dateString}`);
      return dateString;
    }
    
    // Use local timezone to format the date
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const fixedDate = `${year}-${month}-${day}`;
    
    console.log(`[ProductAdapter] Converted date from ${dateString} to ${fixedDate}`);
    return fixedDate;
  }

  // Transform frontend product data to backend format for creation
  static toBackendCreate(frontendProduct) {
    const backendData = {
      nombre: frontendProduct.nombre,
      lote: frontendProduct.lote,
      cantidad: parseInt(frontendProduct.cantidad),
      peso_unitario: parseFloat(frontendProduct.peso_unitario),
      peso_total: parseFloat(frontendProduct.peso_total),
      fecha_registro: this.fixDateForBackend(frontendProduct.fecha_registro),
      fecha_vencimiento: this.fixDateForBackend(frontendProduct.fecha_vencimiento),
      proveedor: frontendProduct.proveedor,
      responsable: frontendProduct.responsable,
      comentarios: frontendProduct.comentarios || null,
      categoria_id: frontendProduct.categoria_id || this.getCategoryIdByName(frontendProduct.categoria),
      country_id: frontendProduct.country_id
    };
    
    console.log('[ProductAdapter] Final backend data:', backendData);
    return backendData;
  }

  // Transform frontend product data to backend format for updates
  static toBackendUpdate(frontendProduct) {
    const updateData = {};
    
    if (frontendProduct.nombre !== undefined) updateData.nombre = frontendProduct.nombre;
    if (frontendProduct.lote !== undefined) updateData.lote = frontendProduct.lote;
    if (frontendProduct.cantidad !== undefined) updateData.cantidad = parseInt(frontendProduct.cantidad);
    if (frontendProduct.peso_unitario !== undefined) updateData.peso_unitario = parseFloat(frontendProduct.peso_unitario);
    if (frontendProduct.peso_total !== undefined) updateData.peso_total = parseFloat(frontendProduct.peso_total);
    if (frontendProduct.fecha_vencimiento !== undefined) updateData.fecha_vencimiento = this.fixDateForBackend(frontendProduct.fecha_vencimiento);
    if (frontendProduct.proveedor !== undefined) updateData.proveedor = frontendProduct.proveedor;
    if (frontendProduct.responsable !== undefined) updateData.responsable = frontendProduct.responsable;
    if (frontendProduct.comentarios !== undefined) updateData.comentarios = frontendProduct.comentarios || null;
    if (frontendProduct.categoria_id !== undefined) updateData.categoria_id = frontendProduct.categoria_id;
    if (frontendProduct.categoria !== undefined) updateData.categoria_id = this.getCategoryIdByName(frontendProduct.categoria);
    if (frontendProduct.country_id !== undefined) updateData.country_id = frontendProduct.country_id;

    console.log('[ProductAdapter] Final update data:', updateData);
    return updateData;
  }

  // Transform array of backend products to frontend format
  static fromBackendList(backendProducts) {
    return backendProducts.map(product => this.fromBackend(product));
  }

  // Helper to get category ID from category name
  static getCategoryIdByName(categoryName) {
    const categoryMap = {
      'HIC': 3,
      'BIC': 7,
      'CASE': 8,
      'FOOD': 9,
      'PHARMA': 10,
      'OTROS': 11
    };
    return categoryMap[categoryName] || 3;
  }

  // Helper to get category name from category ID
  static getCategoryNameById(categoryId) {
    const categoryMap = {
      3: 'HIC',
      7: 'BIC',
      8: 'CASE',
      9: 'FOOD',
      10: 'PHARMA',
      11: 'OTROS'
    };
    return categoryMap[categoryId] || 'HIC';
  }

  // Transform backend search/filter parameters
  static toBackendFilters(frontendFilters) {
    const backendFilters = {};
    
    if (frontendFilters.search) backendFilters.search = frontendFilters.search;
    if (frontendFilters.categoria) backendFilters.categoria_id = this.getCategoryIdByName(frontendFilters.categoria);
    if (frontendFilters.estado_vencimiento) backendFilters.estado_vencimiento = frontendFilters.estado_vencimiento;
    if (frontendFilters.skip) backendFilters.skip = frontendFilters.skip;
    if (frontendFilters.limit) backendFilters.limit = frontendFilters.limit;

    return backendFilters;
  }

  // Transform backend stats to frontend format
  static fromBackendStats(backendStats) {
    return {
      total_productos: backendStats.total_productos,
      productos_vigentes: backendStats.productos_vigentes,
      productos_por_vencer: backendStats.productos_por_vencer,
      productos_vencidos: backendStats.productos_vencidos,
      productos_este_mes: backendStats.productos_este_mes
    };
  }
}

export default ProductAdapter;