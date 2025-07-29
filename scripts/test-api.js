// Script para verificar el estado de la base de datos
// Ejecuta esto en la consola del navegador en tu aplicación

// Verificar conexión con la API
fetch('/api/auth/me', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer invalid-token'
  }
})
.then(response => response.json())
.then(data => console.log('API Response:', data))
.catch(error => console.error('API Error:', error));

// También puedes probar el registro
fetch('/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'test@example.com',
    username: 'testuser',
    password: 'testpassword123'
  })
})
.then(response => response.json())
.then(data => console.log('Register Response:', data))
.catch(error => console.error('Register Error:', error));
