const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = 'An error occurred';
    try {
      const errBody = await response.json();
      errorDetail = errBody.detail || errorDetail;
    } catch {
      errorDetail = response.statusText || errorDetail;
    }
    throw new Error(errorDetail);
  }
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  // Products
  async getProducts() {
    const res = await fetch(`${API_BASE_URL}/products/`);
    return handleResponse(res);
  },
  async getProduct(id) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`);
    return handleResponse(res);
  },
  async createProduct(data) {
    const res = await fetch(`${API_BASE_URL}/products/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  async updateProduct(id, data) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  async deleteProduct(id) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Customers
  async getCustomers() {
    const res = await fetch(`${API_BASE_URL}/customers/`);
    return handleResponse(res);
  },
  async getCustomer(id) {
    const res = await fetch(`${API_BASE_URL}/customers/${id}`);
    return handleResponse(res);
  },
  async createCustomer(data) {
    const res = await fetch(`${API_BASE_URL}/customers/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  async deleteCustomer(id) {
    const res = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Orders
  async getOrders() {
    const res = await fetch(`${API_BASE_URL}/orders/`);
    return handleResponse(res);
  },
  async getOrder(id) {
    const res = await fetch(`${API_BASE_URL}/orders/${id}`);
    return handleResponse(res);
  },
  async createOrder(data) {
    const res = await fetch(`${API_BASE_URL}/orders/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  async deleteOrder(id) {
    const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },
};
