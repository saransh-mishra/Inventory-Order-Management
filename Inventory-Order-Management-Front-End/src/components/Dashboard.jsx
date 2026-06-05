import React from 'react';

export default function Dashboard({ products, customers, orders, onNavigate }) {
  const lowStockThreshold = 5;
  const lowStockProducts = products.filter(p => p.quantity <= lowStockThreshold);
  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  return (
    <div>
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Products</div>
          <div className="metric-value">{products.length}</div>
          <div className="metric-desc">Registered items in catalog</div>
        </div>

        <div className="metric-card secondary">
          <div className="metric-label">Total Customers</div>
          <div className="metric-value">{customers.length}</div>
          <div className="metric-desc">Active customer database</div>
        </div>

        <div className="metric-card success">
          <div className="metric-label">Total Orders</div>
          <div className="metric-value">{orders.length}</div>
          <div className="metric-desc">Completed order transactions</div>
        </div>

        <div className="metric-card warning">
          <div className="metric-label">Low Stock Alerts</div>
          <div className="metric-value">{lowStockProducts.length}</div>
          <div className="metric-desc">Quantity &le; {lowStockThreshold} units</div>
        </div>
      </div>

      <div className="grid-2col">
        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge danger" style={{ borderRadius: '4px' }}>ALERT</span>
              Low Stock Products
            </h3>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('products')}>
              Manage Catalog
            </button>
          </div>
          
          {lowStockProducts.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>All products are sufficiently stocked.</p>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Product Name</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: '600' }}>{p.sku}</td>
                      <td>{p.name}</td>
                      <td>
                        <span className={`badge ${p.quantity === 0 ? 'danger' : 'warning'}`}>
                          {p.quantity} left
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">Recent Orders</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('orders')}>
              View All
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>No orders placed yet.</p>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(o => (
                    <tr key={o.id}>
                      <td style={{ fontWeight: '600' }}>#{o.id}</td>
                      <td>{o.customer ? o.customer.name : `ID: ${o.customer_id}`}</td>
                      <td style={{ color: 'var(--success)', fontWeight: '600' }}>
                        ₹{o.total_amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
