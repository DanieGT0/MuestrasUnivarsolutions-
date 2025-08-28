import React, { useState, useEffect, useRef } from 'react';
import { Search, Package, ChevronDown, X } from 'lucide-react';
import productService from '../../services/productService';

const ProductSearch = ({ 
  selectedProduct, 
  onSelectProduct, 
  placeholder = "Buscar producto por codigo o nombre...",
  showStock = true,
  filterWithStock = false // Si true, solo muestra productos con stock > 0
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts();
  }, []);

  // Filtrar productos basado en el termino de busqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts([]);
      setIsOpen(false);
      return;
    }

    const filtered = products.filter(product => {
      const matchesSearch = 
        product.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      
      const hasStock = filterWithStock ? product.cantidad > 0 : true;
      
      return matchesSearch && hasStock;
    });

    setFilteredProducts(filtered.slice(0, 10)); // Limitar a 10 resultados
    setIsOpen(filtered.length > 0);
  }, [searchTerm, products, filterWithStock]);

  // Actualizar input cuando se selecciona un producto
  useEffect(() => {
    if (selectedProduct) {
      setSearchTerm(`${selectedProduct.codigo} - ${selectedProduct.nombre}`);
      setIsOpen(false);
    }
  }, [selectedProduct]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts();
      
      let productList = [];
      if (response && typeof response === 'object' && response.items) {
        productList = response.items;
      } else if (Array.isArray(response)) {
        productList = response;
      }

      setProducts(productList);
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Si se borra completamente, deseleccionar producto
    if (!value.trim()) {
      onSelectProduct(null);
    }
  };

  const handleSelectProduct = (product) => {
    onSelectProduct(product);
    setSearchTerm(`${product.codigo} - ${product.nombre}`);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSelectProduct(null);
    setIsOpen(false);
    searchInputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {error && (
        <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>
        
        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm && setIsOpen(filteredProducts.length > 0)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          autoComplete="off"
        />

        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Dropdown de resultados */}
      {isOpen && filteredProducts.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              onClick={() => handleSelectProduct(product)}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Package className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {product.codigo}
                    </div>
                    <div className="text-sm text-gray-600">
                      {product.nombre}
                    </div>
                  </div>
                </div>
                {showStock && (
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Stock</div>
                    <div className={`text-sm font-medium ${
                      product.cantidad > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {product.cantidad}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {searchTerm && filteredProducts.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No se encontraron productos
            </div>
          )}
        </div>
      )}

      {/* Mensaje cuando no hay productos con stock (solo si filterWithStock=true) */}
      {filterWithStock && searchTerm && filteredProducts.length === 0 && products.some(p => 
        (p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) || 
         p.nombre.toLowerCase().includes(searchTerm.toLowerCase())) && p.cantidad === 0
      ) && (
        <div className="mt-1 text-sm text-orange-600">
          Se encontraron productos pero sin stock disponible
        </div>
      )}
    </div>
  );
};

export default ProductSearch;