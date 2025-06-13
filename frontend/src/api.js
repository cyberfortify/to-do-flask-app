import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication and logging
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log the request
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    // Log the response
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    // Log the error
    console.error('API Response Error:', error);

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });

      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        // Remove token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error Details:', error.request);
      // Check if server is running
      checkServerStatus();
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error Message:', error.message);
    }

    return Promise.reject(error);
  }
);

// Function to check if server is running
const checkServerStatus = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:5000/health');
    console.log('Server is running:', response.status);
  } catch (error) {
    console.error('Server check failed:', error);
    // Show error to user
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #ff4444;
      color: white;
      padding: 15px;
      border-radius: 5px;
      z-index: 9999;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    errorDiv.textContent = 'Cannot connect to server. Please make sure the backend server is running.';
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
  }
};

export default api;
