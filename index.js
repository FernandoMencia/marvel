const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser'); 

const app = express();
const PORT = 3000;

// Se definen las claves de acceso de la API de Marvel
const PUBLIC_KEY = 'pegarAquiPublicKey';
const PRIVATE_KEY = 'pegarAquiPrivateKey';

// Se conecta a la base de datos de MongoDB
mongoose.connect('mongodb://localhost:27017/favoritesDB');

// Se define el esquema de tu modelo de personaje favorito
const characterSchema = new mongoose.Schema({
  name: String,
  description: String,
  comics: [String]
});

// Crea el modelo de personaje favorito utilizando el esquema definido
const Character = mongoose.model('Character', characterSchema);

// Middleware para parsear el cuerpo de las solicitudes y analizar las cookies
app.use(bodyParser.json());
app.use(cookieParser()); // Usar el middleware de cookies

// Función para obtener datos de la API de Marvel
async function fetchMarvelCharacters(name, limit = 10) {
  const ts = new Date().getTime().toString();
  const hash = crypto.createHash('md5').update(ts + PRIVATE_KEY + PUBLIC_KEY).digest('hex');

  try {
    const response = await axios.get('https://gateway.marvel.com/v1/public/characters', {
      params: {
        ts: ts,
        apikey: PUBLIC_KEY,
        hash: hash,
        limit: limit,
        name: name
      }
    });
    return response.data.data.results;
  } catch (error) {
    if (error.response) {
      const statusCode = error.response.status;
      const errorMessage = error.response.data.message;
      if (statusCode === 409) {
        // Manejar diferentes tipos de errores de la API de Marvel
        switch (errorMessage) {
          case 'Limit greater than 100.':
            throw new Error('El límite debe ser igual o menor que 100.');
          case 'Limit invalid or below 1.':
            throw new Error('El límite debe ser un número válido y mayor que 0.');
          case 'Invalid or unrecognized parameter.':
            throw new Error('El parámetro proporcionado es inválido o no reconocido.');
          default:
            throw new Error('Error desconocido al procesar la solicitud.');
        }
      }
    }
    console.error('Error fetching Marvel characters:', error);
    throw new Error('Error fetching Marvel characters');
  }
}

// Ruta de inicio de sesión
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Verificar las credenciales del usuario (simulado)
  if (username === 'admin' && password === 'admin') {
    // Crear una cookie de sesión (nombre de cookie: 'session', valor: 'authenticated')
    res.cookie('session', 'authenticated', { httpOnly: true });
    res.json({ message: 'Inicio de sesión exitoso' });
  } else {
    res.status(401).json({ error: 'Credenciales incorrectas' });
  }
});

// Middleware para verificar la autenticación
function authenticate(req, res, next) {
  if (req.cookies.session === 'authenticated') {
    next();
  } else {
    res.status(401).send('No autorizado');
  }
}

// Manejar solicitud para obtener información de un personaje específico de la base de datos de favoritos
app.get('/favorites/:name', authenticate, async (req, res) => {
  try {
    const { name } = req.params;
    const favorite = await Character.findOne({ name: name });
    if (!favorite) {
      res.status(404).json({ error: 'Personaje favorito no encontrado' });
      return;
    }
    res.json(favorite);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manejar solicitud para añadir un nuevo personaje favorito a la base de datos
app.post('/favorites', authenticate, async (req, res) => {
  try {
    const newFavorite = req.body;
    const favorite = new Character(newFavorite);
    await favorite.save();
    res.json(favorite);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manejar solicitud para actualizar un personaje favorito por su nombre en la base de datos
app.put('/favorites/:name', authenticate, async (req, res) => {
  try {
    const { name } = req.params;
    const updatedInfo = req.body;
    const favorite = await Character.findOneAndUpdate({ name: name }, updatedInfo, { new: true });
    if (!favorite) {
      res.status(404).json({ error: 'Personaje favorito no encontrado' });
      return;
    }
    res.json(favorite);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manejar solicitud para eliminar un personaje favorito por su nombre de la base de datos
app.delete('/favorites/:name', authenticate, async (req, res) => {
  try {
    const { name } = req.params;
    const favorite = await Character.findOneAndDelete({ name: name });
    if (!favorite) {
      res.status(404).json({ error: 'Personaje favorito no encontrado' });
      return;
    }
    res.json({ message: 'Personaje favorito eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manejar solicitud para obtener información de personajes de Marvel
app.get('/characters', async (req, res) => {
  try {
    const { limit } = req.query;
    const characters = await fetchMarvelCharacters(null, limit);
    res.json(characters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manejar solicitud para obtener información de un personaje específico de Marvel
app.get('/characters/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const characters = await fetchMarvelCharacters(name);
    res.json(characters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manejar solicitud a la ruta raíz
app.get('/', (req, res) => {
  res.send('Bienvenido a la BD de personajes de Marvel');
});

// Manejar solicitud para obtener todos los personajes favoritos de la base de datos
app.get('/favorites', authenticate, async (req, res) => {
  try {
    const favorites = await Character.find();
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

