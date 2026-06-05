import React, { useState, useEffect } from 'react';
import { api } from './api';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Customers from './components/Customers';
import Orders from './components/Orders';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, custs, ords] = await Promise.all([
        api.getProducts(),
        api.getCustomers(),
        api.getOrders()
      ]);
      setProducts(prods);
      setCustomers(custs);
      setOrders(ords);
    } catch (err) {
      addToast(`Error loading data: ${err.message}`, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <span style={{ color: 'var(--text-secondary)' }}>Loading catalog...</span>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            products={products}
            customers={customers}
            orders={orders}
            onNavigate={setActiveTab}
          />
        );
      case 'products':
        return (
          <Products
            products={products}
            onReload={loadData}
            addToast={addToast}
          />
        );
      case 'customers':
        return (
          <Customers
            customers={customers}
            onReload={loadData}
            addToast={addToast}
          />
        );
      case 'orders':
        return (
          <Orders
            orders={orders}
            products={products}
            customers={customers}
            onReload={loadData}
            addToast={addToast}
          />
        );
      default:
        return <div>Page not found.</div>;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'products': return 'Product Catalog';
      case 'customers': return 'Customer Registry';
      case 'orders': return 'Sales Orders';
      default: return 'Management System';
    }
  };

  const getPageSubtitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Real-time catalog metrics and alerts';
      case 'products': return 'Manage system inventory, SKU levels, and unit pricing';
      case 'customers': return 'Manage active customers, contact records, and registration';
      case 'orders': return 'Register customer sales, track quantities, and cancel invoices';
      default: return '';
    }
  };

  return (
    <div className="app-container">
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>

      <aside className="sidebar">
        <div className="brand-section">
          <div className="brand-logo">IO</div>
          <span className="brand-name">InvOrder</span>
        </div>

        <nav>
          <ul className="nav-menu">
            <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}>
              <button onClick={() => setActiveTab('dashboard')}>
                📊 Dashboard
              </button>
            </li>
            <li className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}>
              <button onClick={() => setActiveTab('products')}>
                📦 Products
              </button>
            </li>
            <li className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}>
              <button onClick={() => setActiveTab('customers')}>
                👥 Customers
              </button>
            </li>
            <li className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}>
              <button onClick={() => setActiveTab('orders')}>
                🛒 Orders
              </button>
            </li>
          </ul>
        </nav>
        
        <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Status: <span style={{ color: 'var(--success)', fontWeight: '600' }}>Connected</span></p>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>API: FastAPI + PG</p>
        </div>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div>
            <h1 className="page-title">{getPageTitle()}</h1>
            <p className="page-subtitle">{getPageSubtitle()}</p>
          </div>
          <div>
            <button className="btn btn-secondary btn-sm" onClick={loadData}>
              🔄 Refresh Data
            </button>
          </div>
        </header>

        {renderContent()}
      </main>

      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <span>
              {toast.type === 'success' ? '✅' : toast.type === 'danger' ? '❌' : '⚠️'}
            </span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
