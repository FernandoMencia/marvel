const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

const PUBLIC_KEY = 'pegarAquiPublicKey';
const PRIVATE_KEY = 'pegarAquiPrivateKey';

// Manejar solicitud a la ruta raíz
app.get('/', (req, res) => {
  res.send('Bienvenido a la BD de personajes de Marvel');
});

// Manejar solicitud para obtener información de todos los personajes
app.get('/characters', async (req, res) => {
  try {
    const ts = new Date().getTime().toString();
    let params = {
      ts: ts,
      apikey: PUBLIC_KEY,
      hash: crypto.createHash('md5').update(ts + PRIVATE_KEY + PUBLIC_KEY).digest('hex'),
      limit: 10,
    };

    const response = await axios.get('https://gateway.marvel.com/v1/public/characters', {
      params: params,
      headers: {
        Accept: 'application/json'
      }
    });

    // Formatear la respuesta JSON
    const formattedResponse = response.data.data.results.map(character => ({
      name: character.name,
      description: character.description,
      comics: character.comics.items.map(comic => comic.name)
    }));

    res.json(formattedResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manejar solicitud para obtener información de un personaje específico
app.get('/characters/:name', async (req, res) => {
  try {
    const ts = new Date().getTime().toString();
    const { name } = req.params;
    let params = {
      ts: ts,
      apikey: PUBLIC_KEY,
      hash: crypto.createHash('md5').update(ts + PRIVATE_KEY + PUBLIC_KEY).digest('hex'),
      limit: 10,
      name: name // Utiliza el nombre del personaje proporcionado en la URL
    };

    const response = await axios.get('https://gateway.marvel.com/v1/public/characters', {
      params: params,
      headers: {
        Accept: 'application/json'
      }
    });

    // Verificar si la respuesta contiene datos
    if (response.data.data.count === 0) {
      res.status(404).json({ error: 'Superhéroe no encontrado en la BD' });
      return;
    }

    // Formatear la respuesta JSON
    const formattedResponse = response.data.data.results.map(character => ({
      name: character.name,
      description: character.description,
      comics: character.comics.items.map(comic => comic.name)
    }));

    res.json(formattedResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
