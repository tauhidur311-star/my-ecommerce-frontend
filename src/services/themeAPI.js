import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with auth
const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const themeAPI = {
  // Theme management
  getThemes: async () => {
    const response = await api.get('/api/admin/themes');
    return response.data.data;
  },

  createTheme: async (themeData) => {
    const response = await api.post('/api/admin/themes', themeData);
    return response.data.data;
  },

  // Template management
  getTemplates: async (themeId) => {
    const response = await api.get(`/api/admin/themes/${themeId}/templates`);
    return response.data.data;
  },

  getTemplate: async (templateId) => {
    const response = await api.get(`/api/admin/themes/templates/${templateId}`);
    return response.data.data;
  },

  updateTemplate: async (templateId, templateData) => {
    const response = await api.put(`/api/admin/themes/templates/${templateId}`, templateData);
    return response.data.data;
  },

  publishTemplate: async (templateId) => {
    const response = await api.post(`/api/admin/themes/templates/${templateId}/publish`);
    return response.data.data;
  },

  rollbackTemplate: async (templateId, versionIndex) => {
    const response = await api.post(`/api/admin/themes/templates/${templateId}/rollback`, {
      versionIndex
    });
    return response.data.data;
  },

  exportTemplate: async (templateId) => {
    const response = await api.get(`/api/admin/themes/templates/${templateId}/export`, {
      responseType: 'blob'
    });
    return response.data;
  },

  importTemplate: async (templateData, themeId, overwrite = false) => {
    const response = await api.post('/api/admin/themes/import', {
      templateData,
      themeId,
      overwrite
    });
    return response.data.data;
  }
};

export const assetAPI = {
  // Asset management
  getAssets: async (params = {}) => {
    const response = await api.get('/api/admin/assets', { params });
    return response.data;
  },

  uploadAsset: async (file, metadata = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });

    const response = await api.post('/api/admin/assets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  deleteAsset: async (assetId) => {
    const response = await api.delete(`/api/admin/assets/${assetId}`);
    return response.data;
  },

  updateAsset: async (assetId, updates) => {
    const response = await api.put(`/api/admin/assets/${assetId}`, updates);
    return response.data.data;
  },

  getFolders: async () => {
    const response = await api.get('/api/admin/assets/folders');
    return response.data.data;
  }
};

export const reusableBlockAPI = {
  // Reusable blocks management
  getBlocks: async (params = {}) => {
    const response = await api.get('/api/admin/reusable-blocks', { params });
    return response.data.data;
  },

  createBlock: async (blockData) => {
    const response = await api.post('/api/admin/reusable-blocks', blockData);
    return response.data.data;
  },

  getBlock: async (blockId) => {
    const response = await api.get(`/api/admin/reusable-blocks/${blockId}`);
    return response.data.data;
  },

  updateBlock: async (blockId, blockData) => {
    const response = await api.put(`/api/admin/reusable-blocks/${blockId}`, blockData);
    return response.data.data;
  },

  deleteBlock: async (blockId) => {
    const response = await api.delete(`/api/admin/reusable-blocks/${blockId}`);
    return response.data;
  }
};

export const publicAPI = {
  // Public theme access
  getPublishedTheme: async (pageType, slug = null) => {
    const url = slug 
      ? `/api/public/theme/custom/${slug}`
      : `/api/public/theme/${pageType}`;
    const response = await axios.get(`${API_URL}${url}`);
    return response.data.data;
  },

  getPublishedPages: async () => {
    const response = await axios.get(`${API_URL}/api/public/pages`);
    return response.data.data;
  }
};

export default {
  theme: themeAPI,
  asset: assetAPI,
  reusableBlock: reusableBlockAPI,
  public: publicAPI
};