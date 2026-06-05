import React, { useState } from 'react';
import { api } from '../api';

export default function Products({ products, onReload, addToast }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setName('');
    setSku('');
    setPrice('');
    setQuantity('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setName(product.name);
    setSku(product.sku);
    setPrice(product.price);
    setQuantity(product.quantity);
    setIsEditModalOpen(true);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) {
      addToast('Name and SKU are required', 'warning');
      return;
    }
    const numPrice = parseFloat(price);
    const numQty = parseInt(quantity);
    if (isNaN(numPrice) || numPrice < 0) {
      addToast('Price must be a positive number', 'warning');
      return;
    }
    if (isNaN(numQty) || numQty < 0) {
      addToast('Stock quantity cannot be negative', 'warning');
      return;
    }

    try {
      await api.createProduct({
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        price: numPrice,
        quantity: numQty
      });
      addToast('Product added successfully!', 'success');
      setIsAddModalOpen(false);
      onReload();
    } catch (err) {
      addToast(err.message, 'danger');
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) {
      addToast('Name and SKU are required', 'warning');
      return;
    }
    const numPrice = parseFloat(price);
    const numQty = parseInt(quantity);
    if (isNaN(numPrice) || numPrice < 0) {
      addToast('Price must be a positive number', 'warning');
      return;
    }
    if (isNaN(numQty) || numQty < 0) {
      addToast('Stock quantity cannot be negative', 'warning');
      return;
    }

    try {
      await api.updateProduct(selectedProduct.id, {
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        price: numPrice,
        quantity: numQty
      });
      addToast('Product updated successfully!', 'success');
      setIsEditModalOpen(false);
      onReload();
    } catch (err) {
      addToast(err.message, 'danger');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(id);
      addToast('Product deleted successfully!', 'success');
      onReload();
    } catch (err) {
      addToast(err.message, 'danger');
    }
  };

  return (
    <div>
      <div className="actions-bar">
        <div className="search-wrapper">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <span>+</span> Add Product
        </button>
      </div>

      <div className="panel">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlignment: 'center', color: 'var(--text-secondary)' }}>
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: '600', color: 'var(--secondary)' }}>{p.sku}</td>
                    <td style={{ fontWeight: '500' }}>{p.name}</td>
                    <td style={{ fontWeight: '600' }}>₹{p.price.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${p.quantity === 0 ? 'danger' : p.quantity <= 5 ? 'warning' : 'success'}`}>
                        {p.quantity} units
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(p)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteProduct(p.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Add New Product</h3>
              <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddProduct}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Mechanical Keyboard"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">SKU / Code</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. KB-MECH-87"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    placeholder="99.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity in Stock</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="50"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Edit Product Details</h3>
              <button className="modal-close" onClick={() => setIsEditModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleEditProduct}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">SKU / Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity in Stock</label>
                  <input
                    type="number"
                    className="form-control"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
