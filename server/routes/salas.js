import { Router } from 'express';
import { obtenerSalas, obtenerSalaPorNombre, obtenerMensajes } from '../services/salaService.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const salas = obtenerSalas();
    res.json({ success: true, data: salas });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al obtener salas' });
  }
});

router.get('/:sala/mensajes', (req, res) => {
  try {
    const { sala } = req.params;
    const limite = Math.min(parseInt(req.query.limite, 10) || 50, 100);

    const salaEncontrada = obtenerSalaPorNombre(sala);
    if (!salaEncontrada) {
      return res.status(404).json({ success: false, error: 'Sala no encontrada' });
    }

    const mensajes = obtenerMensajes(salaEncontrada.id, limite);
    res.json({ success: true, data: mensajes });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al obtener mensajes' });
  }
});

export default router;
