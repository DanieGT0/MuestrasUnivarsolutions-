import React, { useState, useEffect } from 'react';
import { Plus, Package, User, FileText, MessageSquare } from 'lucide-react';
import movementService from '../../services/movementService';
import productService from '../../services/productService';
import ProductSearch from '../ui/ProductSearch';

const EntradaForm = ({ productId = null, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    product_id: productId || '',
    cantidad: '',
    responsable: '',
    motivo: '',
    observaciones: ''
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (productId) {
      loadSelectedProduct(productId);
    }
  }, [productId]);

  const loadSelectedProduct = async (id) => {
    try {
      const product = await productService.getProductById(id);
      setSelectedProduct(product);
      setFormData(prev => ({
        ...prev,
        product_id: product.id
      }));
    } catch (error) {
      console.error('Error loading product:', error);
      setError('Error al cargar producto');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    if (product) {
      setFormData(prev => ({
        ...prev,
        product_id: product.id
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        product_id: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const dataToSubmit = {
        ...formData,
        product_id: parseInt(formData.product_id),
        cantidad: parseInt(formData.cantidad)
      };

      await movementService.registrarEntrada(dataToSubmit);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error registering entrada:', error);
      setError(error.response?.data?.detail || 'Error al registrar entrada');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <Plus className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Registrar Entrada</h2>
          <p className="text-gray-600">Agregar inventario a un producto</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Búsqueda de producto */}
        {!productId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Package className="inline h-4 w-4 mr-1" />
              Producto
            </label>
            <ProductSearch
              selectedProduct={selectedProduct}
              onSelectProduct={handleProductSelect}
              placeholder="Buscar producto por codigo o nombre..."
              showStock={true}
              filterWithStock={false}
            />
          </div>
        )}

        {/* Información del producto seleccionado */}
        {selectedProduct && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Producto seleccionado:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Código:</span>
                <span className="font-medium ml-2">{selectedProduct.codigo}</span>
              </div>
              <div>
                <span className="text-gray-600">Stock actual:</span>
                <span className="font-medium ml-2">{selectedProduct.cantidad}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Nombre:</span>
                <span className="font-medium ml-2">{selectedProduct.nombre}</span>
              </div>
            </div>
          </div>
        )}

        {/* Cantidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cantidad a agregar
          </label>
          <input
            type="number"
            name="cantidad"
            value={formData.cantidad}
            onChange={handleInputChange}
            min="1"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Ej: 10"
          />
        </div>

        {/* Responsable */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline h-4 w-4 mr-1" />
            Responsable
          </label>
          <input
            type="text"
            name="responsable"
            value={formData.responsable}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Nombre del responsable"
          />
        </div>

        {/* Motivo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="inline h-4 w-4 mr-1" />
            Motivo
          </label>
          <input
            type="text"
            name="motivo"
            value={formData.motivo}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Ej: Compra, Devolución, Reposición"
          />
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MessageSquare className="inline h-4 w-4 mr-1" />
            Observaciones (opcional)
          </label>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Observaciones adicionales..."
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-white ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500'
            }`}
          >
            {loading ? 'Registrando...' : 'Registrar Entrada'}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default EntradaForm;