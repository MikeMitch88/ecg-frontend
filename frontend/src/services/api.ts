<<<<<<< HEAD
import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ecg_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('ecg_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: number;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface ECGRecord {
  id: number;
  user_id: number;
  original_filename: string;
  file_path: string;
  file_size: number;
  file_type: string;
  status: 'uploaded' | 'processing' | 'completed' | 'failed';
  processed_data_path?: string;
  processing_started_at?: string;
  processing_completed_at?: string;
  error_message?: string;
  created_at: string;
  updated_at?: string;
}

export interface ProcessingResult {
  id: number;
  ecg_record_id: number;
  waveform_data?: {
    signal: number[];
    time_axis: number[];
    heart_rate: number;
    anomalies: any[];
    sampling_rate: number;
    signal_length: number;
  };
  signal_quality_score?: number;
  heart_rate?: number;
  rhythm_type?: string;
  anomalies_detected?: any[];
  processing_metadata?: any;
  created_at: string;
}

export interface ProcessingJob {
  id: number;
  ecg_record_id: number;
  job_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  created_at: string;
}

export interface ExportRequest {
  ecg_record_id: number;
  format: 'csv' | 'json' | 'numpy' | 'excel';
  include_metadata?: boolean;
  include_anomalies?: boolean;
}

export interface ExportResponse {
  download_url: string;
  filename: string;
  format: string;
  file_size: number;
  expires_at: string;
}

// Auth API
export const authService = {
  login: async (email: string, password: string) => {
    const response: AxiosResponse = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  register: async (email: string, password: string, fullName?: string) => {
    const response: AxiosResponse = await api.post('/auth/register', {
      email,
      password,
      full_name: fullName,
    });
    return response.data;
  },

  getCurrentUser: async (token?: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response: AxiosResponse = await api.get('/auth/me', { headers });
    return response.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
  },
};

// ECG API
export const ecgService = {
  uploadECG: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response: AxiosResponse = await api.post('/ecg/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getRecords: async (): Promise<ECGRecord[]> => {
    const response: AxiosResponse = await api.get('/ecg/records');
    return response.data;
  },

  getRecord: async (id: number): Promise<ECGRecord> => {
    const response: AxiosResponse = await api.get(`/ecg/records/${id}`);
    return response.data;
  },

  deleteRecord: async (id: number) => {
    await api.delete(`/ecg/records/${id}`);
  },

  getPreview: async (id: number) => {
    const response: AxiosResponse = await api.get(`/ecg/records/${id}/preview`);
    return response.data;
  },
};

// Processing API
export const processingService = {
  startProcessing: async (ecgRecordId: number, options?: any) => {
    const response: AxiosResponse = await api.post('/process/start', {
      ecg_record_id: ecgRecordId,
      processing_options: options,
    });
    return response.data;
  },

  getJob: async (jobId: string): Promise<ProcessingJob> => {
    const response: AxiosResponse = await api.get(`/process/job/${jobId}`);
    return response.data;
  },

  getResults: async (ecgRecordId: number): Promise<ProcessingResult[]> => {
    const response: AxiosResponse = await api.get(`/process/results/${ecgRecordId}`);
    return response.data;
  },

  reprocess: async (ecgRecordId: number) => {
    const response: AxiosResponse = await api.post(`/process/reprocess/${ecgRecordId}`);
    return response.data;
  },

  getStatus: async (ecgRecordId: number) => {
    const response: AxiosResponse = await api.get(`/process/status/${ecgRecordId}`);
    return response.data;
  },
};

// Export API
export const exportService = {
  exportData: async (request: ExportRequest): Promise<ExportResponse> => {
    const response: AxiosResponse = await api.post('/export/', request);
    return response.data;
  },

  downloadFile: async (filename: string) => {
    const response: AxiosResponse = await api.get(`/export/download/${filename}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  getFormats: async () => {
    const response: AxiosResponse = await api.get('/export/formats');
    return response.data;
  },
};

// Utility functions
export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default api;


=======
import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ecg_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('ecg_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: number;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface ECGRecord {
  id: number;
  user_id: number;
  original_filename: string;
  file_path: string;
  file_size: number;
  file_type: string;
  status: 'uploaded' | 'processing' | 'completed' | 'failed';
  processed_data_path?: string;
  processing_started_at?: string;
  processing_completed_at?: string;
  error_message?: string;
  created_at: string;
  updated_at?: string;
}

export interface ProcessingResult {
  id: number;
  ecg_record_id: number;
  waveform_data?: {
    signal: number[];
    time_axis: number[];
    heart_rate: number;
    anomalies: any[];
    sampling_rate: number;
    signal_length: number;
  };
  signal_quality_score?: number;
  heart_rate?: number;
  rhythm_type?: string;
  anomalies_detected?: any[];
  processing_metadata?: any;
  created_at: string;
}

export interface ProcessingJob {
  id: number;
  ecg_record_id: number;
  job_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  created_at: string;
}

export interface ExportRequest {
  ecg_record_id: number;
  format: 'csv' | 'json' | 'numpy' | 'excel';
  include_metadata?: boolean;
  include_anomalies?: boolean;
}

export interface ExportResponse {
  download_url: string;
  filename: string;
  format: string;
  file_size: number;
  expires_at: string;
}

// Auth API
export const authService = {
  login: async (email: string, password: string) => {
    const response: AxiosResponse = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  register: async (email: string, password: string, fullName?: string) => {
    const response: AxiosResponse = await api.post('/auth/register', {
      email,
      password,
      full_name: fullName,
    });
    return response.data;
  },

  getCurrentUser: async (token?: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response: AxiosResponse = await api.get('/auth/me', { headers });
    return response.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
  },
};

// ECG API
export const ecgService = {
  uploadECG: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response: AxiosResponse = await api.post('/ecg/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getRecords: async (): Promise<ECGRecord[]> => {
    const response: AxiosResponse = await api.get('/ecg/records');
    return response.data;
  },

  getRecord: async (id: number): Promise<ECGRecord> => {
    const response: AxiosResponse = await api.get(`/ecg/records/${id}`);
    return response.data;
  },

  deleteRecord: async (id: number) => {
    await api.delete(`/ecg/records/${id}`);
  },

  getPreview: async (id: number) => {
    const response: AxiosResponse = await api.get(`/ecg/records/${id}/preview`);
    return response.data;
  },
};

// Processing API
export const processingService = {
  startProcessing: async (ecgRecordId: number, options?: any) => {
    const response: AxiosResponse = await api.post('/process/start', {
      ecg_record_id: ecgRecordId,
      processing_options: options,
    });
    return response.data;
  },

  getJob: async (jobId: string): Promise<ProcessingJob> => {
    const response: AxiosResponse = await api.get(`/process/job/${jobId}`);
    return response.data;
  },

  getResults: async (ecgRecordId: number): Promise<ProcessingResult[]> => {
    const response: AxiosResponse = await api.get(`/process/results/${ecgRecordId}`);
    return response.data;
  },

  reprocess: async (ecgRecordId: number) => {
    const response: AxiosResponse = await api.post(`/process/reprocess/${ecgRecordId}`);
    return response.data;
  },

  getStatus: async (ecgRecordId: number) => {
    const response: AxiosResponse = await api.get(`/process/status/${ecgRecordId}`);
    return response.data;
  },
};

// Export API
export const exportService = {
  exportData: async (request: ExportRequest): Promise<ExportResponse> => {
    const response: AxiosResponse = await api.post('/export/', request);
    return response.data;
  },

  downloadFile: async (filename: string) => {
    const response: AxiosResponse = await api.get(`/export/download/${filename}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  getFormats: async () => {
    const response: AxiosResponse = await api.get('/export/formats');
    return response.data;
  },
};

// Utility functions
export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default api;


>>>>>>> 9163bc16ccf897faeceb43da7f02dfc306ca84a6
