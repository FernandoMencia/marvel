//Se importan los módulos que se necesitan
//Para realizar las promesas se usará axios, por sencillez
//Crypto se necesita para generar el hash
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

const PUBLIC_KEY = 'pegarAquiPublicKey';
const PRIVATE_KEY = 'pegarAquiPrivateKey';

// Ruta para obtener personajes de Marvel
app.get('/api/characters', async (req, res) => {
  try {
    const ts = new Date().getTime().toString();
    const hash = crypto.createHash('md5').update(ts + PRIVATE_KEY + PUBLIC_KEY).digest('hex');

    const response = await axios.get('https://gateway.marvel.com/v1/public/characters', {
      params: {
        ts: ts,
        apikey: PUBLIC_KEY,
        hash: hash,
        limit: 10 //Se puede cambiar si se quiere que liste más personajes
      },
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

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
