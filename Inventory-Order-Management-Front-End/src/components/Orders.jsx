import React, { useState } from 'react';
import { api } from '../api';

export default function Orders({ orders, products, customers, onReload, addToast }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [customerId, setCustomerId] = useState('');
  const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: 1 }]);

  const openCreateModal = () => {
    if (customers.length === 0) {
      addToast('Please add at least one customer first', 'warning');
      return;
    }
    if (products.length === 0) {
      addToast('Please add at least one product first', 'warning');
      return;
    }
    setCustomerId('');
    setOrderItems([{ product_id: '', quantity: 1 }]);
    setIsCreateModalOpen(true);
  };

  const openDetailsModal = (order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const addOrderItemRow = () => {
    setOrderItems([...orderItems, { product_id: '', quantity: 1 }]);
  };

  const removeOrderItemRow = (index) => {
    const updated = [...orderItems];
    updated.splice(index, 1);
    setOrderItems(updated);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...orderItems];
    updated[index][field] = value;
    setOrderItems(updated);
  };

  const calculateLiveTotal = () => {
    let total = 0;
    orderItems.forEach(item => {
      const prod = products.find(p => p.id === parseInt(item.product_id));
      const qty = parseInt(item.quantity) || 0;
      if (prod && qty > 0) {
        total += prod.price * qty;
      }
    });
    return total;
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!customerId) {
      addToast('Please select a customer', 'warning');
      return;
    }

    const validItems = [];
    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i];
      if (!item.product_id) {
        addToast(`Please select a product for row ${i + 1}`, 'warning');
        return;
      }
      const prodId = parseInt(item.product_id);
      const qty = parseInt(item.quantity);
      if (isNaN(qty) || qty <= 0) {
        addToast(`Quantity must be greater than zero for row ${i + 1}`, 'warning');
        return;
      }

      // Check stock locally before sending to API
      const product = products.find(p => p.id === prodId);
      if (!product) {
        addToast(`Invalid product selected at row ${i + 1}`, 'warning');
        return;
      }
      if (product.quantity < qty) {
        addToast(`Insufficient stock for product '${product.name}' in row ${i + 1}. Available: ${product.quantity}`, 'danger');
        return;
      }

      validItems.push({ product_id: prodId, quantity: qty });
    }

    if (validItems.length === 0) {
      addToast('Please add at least one product to the order', 'warning');
      return;
    }

    try {
      await api.createOrder({
        customer_id: parseInt(customerId),
        items: validItems
      });
      addToast('Order created successfully!', 'success');
      setIsCreateModalOpen(false);
      onReload();
    } catch (err) {
      addToast(err.message, 'danger');
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('Are you sure you want to cancel/delete this order? Deleting this order will RESTORE stock back to the catalog inventory!')) return;
    try {
      await api.deleteOrder(id);
      addToast('Order cancelled and deleted successfully. Stock restored.', 'success');
      onReload();
    } catch (err) {
      addToast(err.message, 'danger');
    }
  };

  return (
    <div>
      <div className="actions-bar">
        <div></div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <span>+</span> Create New Order
        </button>
      </div>

      <div className="panel">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Order Date</th>
                <th>Items Count</th>
                <th>Total Amount</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No orders placed yet.
                  </td>
                </tr>
              ) : (
                orders.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: '600' }}>#{o.id}</td>
                    <td style={{ fontWeight: '500' }}>{o.customer ? o.customer.name : `ID: ${o.customer_id}`}</td>
                    <td>{new Date(o.created_at).toLocaleString()}</td>
                    <td>{o.items ? o.items.length : 0} lines</td>
                    <td style={{ color: 'var(--success)', fontWeight: '600' }}>
                      ₹{o.total_amount.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openDetailsModal(o)}>
                          View Details
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteOrder(o.id)}>
                          Cancel Order
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

      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Order</h3>
              <button className="modal-close" onClick={() => setIsCreateModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateOrder}>
              
              <div className="form-group">
                <label className="form-label">Select Customer</label>
                <select
                  className="form-control"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Products Ordered</label>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addOrderItemRow}>
                    + Add Product Line
                  </button>
                </div>

                {orderItems.map((item, index) => {
                  const selectedProd = products.find(p => p.id === parseInt(item.product_id));
                  const isStockInsufficient = selectedProd && selectedProd.quantity < item.quantity;
                  const itemSubtotal = selectedProd ? selectedProd.price * (parseInt(item.quantity) || 0) : 0;

                  return (
                    <div key={index} className="order-item-row">
                      <div>
                        <select
                          className="form-control"
                          value={item.product_id}
                          onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                          required
                        >
                          <option value="">-- Choose Product --</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} (SKU: {p.sku}) — ₹{p.price.toFixed(2)} [Stock: {p.quantity}]
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <input
                          type="number"
                          min="1"
                          className="form-control"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                          required
                        />
                      </div>

                      <div>
                        <button
                          type="button"
                          className="btn btn-danger btn-icon-only"
                          onClick={() => removeOrderItemRow(index)}
                          disabled={orderItems.length === 1}
                          style={{ minHeight: '41px' }}
                        >
                          &times;
                        </button>
                      </div>
                      
                      <div style={{ flexBasis: '100%', display: 'flex', justifyContent: 'space-between', paddingLeft: '0.25rem', marginTop: '0.25rem', fontSize: '0.85rem' }}>
                        <span>
                          {isStockInsufficient && (
                            <span className="badge danger">INSUFFICIENT STOCK (Available: {selectedProd.quantity})</span>
                          )}
                        </span>
                        <span>
                          {selectedProd && (
                            <span style={{ color: 'var(--text-secondary)' }}>
                              Subtotal: <strong style={{ color: 'var(--text-primary)' }}>₹{itemSubtotal.toFixed(2)}</strong>
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Calculated Order Total:</span>
                <span style={{ fontSize: '1.5rem', color: 'var(--success)', fontWeight: '700' }}>
                  ₹{calculateLiveTotal().toFixed(2)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={calculateLiveTotal() === 0}>
                  Place Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDetailsModalOpen && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Order Summary
                <span className="badge info">#{selectedOrder.id}</span>
              </h3>
              <button className="modal-close" onClick={() => setIsDetailsModalOpen(false)}>&times;</button>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Customer Info</h4>
              <p style={{ fontWeight: '600', fontSize: '1.05rem', marginBottom: '0.25rem' }}>
                {selectedOrder.customer ? selectedOrder.customer.name : 'Unknown Customer'}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                Email: {selectedOrder.customer ? selectedOrder.customer.email : 'N/A'}
              </p>
              {selectedOrder.customer && selectedOrder.customer.phone && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Phone: {selectedOrder.customer.phone}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Order Logistics</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Placed On: {new Date(selectedOrder.created_at).toLocaleString()}
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Line Items</h4>
              <div className="table-container" style={{ border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                <table className="custom-table" style={{ fontSize: '0.9rem' }}>
                  <thead style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
                    <tr>
                      <th>Product</th>
                      <th style={{ textAlign: 'center' }}>Qty</th>
                      <th style={{ textAlign: 'right' }}>Price</th>
                      <th style={{ textAlign: 'right' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items && selectedOrder.items.map(item => (
                      <tr key={item.id}>
                        <td>
                          <div style={{ fontWeight: '500' }}>
                            {item.product ? item.product.name : `Product ID: ${item.product_id}`}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            SKU: {item.product ? item.product.sku : 'N/A'}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ textAlign: 'right' }}>₹{item.price.toFixed(2)}</td>
                        <td style={{ textAlign: 'right', fontWeight: '600' }}>
                          ₹{(item.quantity * item.price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Total Invoice Amount:</span>
              <span style={{ fontSize: '1.65rem', color: 'var(--success)', fontWeight: '700' }}>
                ₹{selectedOrder.total_amount.toFixed(2)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button className="btn btn-secondary" onClick={() => setIsDetailsModalOpen(false)}>
                Close Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
