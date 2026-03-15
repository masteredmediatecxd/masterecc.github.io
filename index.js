const express = require('express');
   const bodyParser = require('body-parser');
   const axios = require('axios');
 
   const app = express();
   app.use(bodyParser.json());
 
   // Configuración de WhatsApp Business API
   const WA_NUMBER_ID = '992014618'; // Reemplaza con tu número de WhatsApp Business API
   const WA_TOKEN = 'EAAmiPkX23JIBQ8jdyz6ZAmi2PCcARyF6YQuoFmbVFp74nLCZCIBWEbXYLBpCNru6M5jr7kjHb3ITmNqgjDHTymrt5ZCSDDzP16ZAaqnZB48LnKA5zEDskiwP3j8uld4bETXNrjSdmFwCUqtfdpBIVNI3QXRTZArpyDIC3bXKpRyFItTi0OethKKbtkMPcYOfbYSZBrr52vE5u9yEdVXyZATtYdlKzqxZAlA381ZAZCTfMDW1RaCjwO8YOTiMYJfv9utxGKKmpZCxak6Ho4JdIbdj1Bn7F1Oczk7rXZBIOZAwZDZD'; // Reemplaza con tu token
 
   // Base de datos simple para almacenar reportes
   const reports = {};
 
   /**
    * Función para enviar un mensaje a un número de teléfono específico.
    * @param {string} phoneNumber - Número de teléfono del destinatario.
    * @param {string} message - Mensaje a enviar.
    */
   async function sendMessage(phoneNumber, message) {
       const url = `https://graph.facebook.com/v15.0/${WA_NUMBER_ID}/messages`;
       const data = {
           messaging_product: 'whatsapp',
           to: phoneNumber,
           text: { body: message },
       };
 
       try {
           await axios.post(url, data, {
               headers: {
                   Authorization: `Bearer ${WA_TOKEN}`,
                   'Content-Type': 'application/json',
               },
           });
       } catch (error) {
           console.error('Error al enviar mensaje:', error);
       }
   }
 
   /**
    * Maneja las solicitudes entrantes del webhook de WhatsApp.
    */
   app.post('/webhook', (req, res) => {
       const { contacts, messages } = req.body.entry[0].changes[0].value.messages[0];
       const phoneNumber = contacts[0].wa_id;
       const messageText = messages[0].text.body;
 
       // Registrar el reporte
       if (!reports[phoneNumber]) {
           reports[phoneNumber] = { count: 1 };
       } else {
           reports[phoneNumber].count += 1;
       }
 
       // Verificar si el número ha alcanzado el límite de reportes
       if (reports[phoneNumber].count <= 100) {
           sendMessage(phoneNumber, `Reporte ${reports[phoneNumber].count} recibido.`);
       } else {
           sendMessage(phoneNumber, 'Has alcanzado el límite de reportes. No recibirás más mensajes.');
           delete reports[phoneNumber];
       }
 
       res.status(200).send('OK');
   });
 
   // Iniciar el servidor
   const PORT = process.env.PORT || 3000;
   app.listen(PORT, () => {
       console.log(`Servidor escuchando en el puerto ${PORT}`);
   });