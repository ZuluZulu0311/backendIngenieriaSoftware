import express from "express";
import * as controller from "../controllers/clienteController.js";
import { verificarToken } from "../middlewares/auth.js";

const router = express.Router();

// Rutas para registro, login, recuperar contraseña
router.post("/registrar", controller.registrarCliente);
router.post("/login", controller.iniciarSesion);
router.post("/enviarEmail", controller.enviarEmail);
router.post("/recuperarContra", controller.recuperacionContrasenia);

// Ruta prueba JWT
router.get("/protegida", verificarToken(), (req, res) => {
  res.json({
    message: "Ruta protegida. Usuario autenticado.",
    userId: req.userId,
  });
});

// Ruta para actualizar datos del cliente, deberá ser él mismo
router.put('/actualizarNombre', controller.actualizarCliente);
router.post('/eliminar', controller.eliminarCliente);
router.post("/cambiarContrasenia", controller.cambiarContrasenia);
router.post('/recuperarContrasenaPasoUno', controller.primerPasoRecuperacion);
router.post('/cambiarPregunta', controller.cambiarPregunta)
router.post('/historialCliente', controller.obtenerHistorial)
export default router;
