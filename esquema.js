//Ejemplo sencillo de uso de operaciones CRUD 

const express = require('express'); 
const bodyParser = require('body-parser'); 

const app = express(); 
const PORT = 3000; 

// Datos de ejemplo: una lista de usuarios
let users = [
  { id: 1, name: 'Juan', age: 30 },
  { id: 2, name: 'María', age: 25 },
  { id: 3, name: 'Carlos', age: 35 }
];

// Middleware para parsear el cuerpo de las solicitudes JSON
app.use(bodyParser.json());

// Ruta para obtener todos los usuarios
app.get('/api/users', (req, res) => {
  res.json(users); // Responder con la lista de usuarios en formato JSON
});

// Ruta para obtener un usuario por su ID
app.get('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id); // Obtener el ID del usuario de los parámetros de la solicitud
  const user = users.find(user => user.id === userId); // Buscar el usuario en la lista por su ID

  if (!user) { // Si el usuario no se encuentra, responder con un error 404
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  res.json(user); // Responder con los datos del usuario encontrado
});

// Ruta para crear un nuevo usuario
app.post('/api/users', (req, res) => {
  const newUser = req.body; // Obtener los datos del nuevo usuario del cuerpo de la solicitud
  users.push(newUser); // Agregar el nuevo usuario a la lista de usuarios
  res.status(201).json(newUser); // Responder con el nuevo usuario creado y un código de estado 201 (creado)
});

// Ruta para actualizar un usuario existente por su ID
app.put('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id); // Obtener el ID del usuario a actualizar de los parámetros de la solicitud
  const updatedUser = req.body; // Obtener los datos actualizados del usuario del cuerpo de la solicitud
  const index = users.findIndex(user => user.id === userId); // Encontrar el índice del usuario en la lista

  if (index === -1) { // Si el usuario no se encuentra, responder con un error 404
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  users[index] = { ...users[index], ...updatedUser }; // Actualizar los datos del usuario en la lista
  res.json(users[index]); // Responder con los datos del usuario actualizado
});

// Ruta para eliminar un usuario por su ID
app.delete('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id); // Obtener el ID del usuario a eliminar de los parámetros de la solicitud
  const index = users.findIndex(user => user.id === userId); // Encontrar el índice del usuario en la lista

  if (index === -1) { // Si el usuario no se encuentra, responder con un error 404
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const deletedUser = users.splice(index, 1)[0]; // Eliminar el usuario de la lista y obtenerlo
  res.json(deletedUser); // Responder con los datos del usuario eliminado
});


app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`); 
});
