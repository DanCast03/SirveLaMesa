const express = require('express');
const router = express.Router();

module.exports = (gameController) => {
  // POST /api/participantes - Crear nuevo participante
  router.post('/', async (req, res) => {
    try {
      const {
        edad, sexo, peso_kg, altura_cm,
        lugar_nacimiento, lugar_residencia,
        ocupacion, nivel_socioeconomico,
        eat26_score, eat26_data,
        consentimiento_informado, notas
      } = req.body;

      // Validaciones básicas
      if (!edad || !sexo) {
        return res.status(400).json({ 
          error: 'Edad y sexo son campos obligatorios' 
        });
      }

      if (!['M', 'F'].includes(sexo)) {
        return res.status(400).json({ 
          error: 'El sexo debe ser M o F' 
        });
      }

      if (edad < 1 || edad > 120) {
        return res.status(400).json({ 
          error: 'La edad debe estar entre 1 y 120 años' 
        });
      }

      const participante = await gameController.crearParticipante(req.body);
      
      res.status(201).json({
        success: true,
        data: participante,
        message: 'Participante creado exitosamente'
      });
    } catch (err) {
      console.error('Error al crear participante:', err);
      res.status(500).json({ 
        error: 'Error al crear el participante',
        details: err.message 
      });
    }
  });

  // GET /api/participantes/:id - Obtener datos de un participante
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const participante = await gameController.obtenerParticipante(id);

      if (!participante) {
        return res.status(404).json({ 
          error: 'Participante no encontrado' 
        });
      }

      res.json({
        success: true,
        data: participante
      });
    } catch (err) {
      console.error('Error al obtener participante:', err);
      res.status(500).json({ 
        error: 'Error al obtener el participante',
        details: err.message 
      });
    }
  });

  return router;
};

