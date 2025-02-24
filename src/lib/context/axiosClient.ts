import axios from 'axios'

const axiosClient = axios.create({
  // baseURL: 'https://api.pak160404.click/api', // Change to your backend URL
  baseURL: 'https://localhost:5051/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Attach token to requests
// axiosClient.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token')
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`
//   }
//   return config
// })

export default axiosClient
