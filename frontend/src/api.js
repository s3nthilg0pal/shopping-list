const API_BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Lists
  getLists: (dateFilter) => {
    const params = dateFilter ? `?date_filter=${dateFilter}` : '';
    return request(`/lists${params}`);
  },
  getList: (id) => request(`/lists/${id}`),
  createList: (data) => request('/lists', { method: 'POST', body: JSON.stringify(data) }),
  updateList: (id, data) => request(`/lists/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteList: (id) => request(`/lists/${id}`, { method: 'DELETE' }),
  getDates: () => request('/lists/dates'),

  // Items
  addItem: (listId, data) => request(`/lists/${listId}/items`, { method: 'POST', body: JSON.stringify(data) }),
  updateItem: (listId, itemId, data) => request(`/lists/${listId}/items/${itemId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteItem: (listId, itemId) => request(`/lists/${listId}/items/${itemId}`, { method: 'DELETE' }),

  // Item images
  uploadItemImage: async (listId, itemId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/lists/${listId}/items/${itemId}/image`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${res.status}`);
    }
    return res.json();
  },
  deleteItemImage: (listId, itemId) =>
    request(`/lists/${listId}/items/${itemId}/image`, { method: 'DELETE' }),
  getItemImageUrl: (listId, itemId) => `${API_BASE}/lists/${listId}/items/${itemId}/image`,
};
