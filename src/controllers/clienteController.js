import express from "express";
import * as documentoService from "../services/documentoService.js";
import * as clienteService from "../services/clienteService.js";
import * as clienteAutenticacionService from "../services/authService.js";
import { sendEmail } from "../services/emailService.js";

import mongoose from "mongoose";

export async function crearCliente(req, res) {
  try {
    const documentosDescargados = req.body.documentosDescargados;
    const documentosVistos = req.body.documentosVistos;
    const documentosPublicados = req.body.documentosPublicados;

    //Obtener los ids
    const documentosDescIds = documentosDescargados.map((x) => x.documentoId);
    const documentosVisIds = documentosVistos.map((j) => j.documentoId);
    const documentosPubIds = documentosPublicados.map((p) => p.documentoId);

    const sonDocumentosDescValidos = await validarDocumentosDescargados(
      documentosDescIds
    );
    if (!sonDocumentosDescValidos) {
      return res
        .status(404)
        .send(
          "Uno o más documentos descargados ingresados no existen en la base de datos"
        );
    }

    const sonDocumentosVisValidos = await validarDocumentosVistos(
      documentosVisIds
    );
    if (!sonDocumentosVisValidos) {
      return res
        .status(404)
        .send(
          "Uno o más documentos vistos ingresados no existen en la base de datos"
        );
    }

    const sonDocumentosPubValidos = await validarDocumentosPublicados(
      documentosPubIds
    );
    if (!sonDocumentosPubValidos) {
      return res
        .status(404)
        .send(
          "Uno o más documentos publicados ingresados no existen en la base de datos"
        );
    }

    const clienteGuardar = await clienteService.crearCliente(req.body);
    res.status(201).send(clienteGuardar);
  } catch (e) {
    res.status(500).send({ error: e.message || "Error en el servidor" });
  }
}

// Validación nueva, crear Cliente, iniciar sesión, JWT Implementado - Probar

export const registrarCliente = async (req, res) => {
  try {
    const documentosDescargados = req.body.documentosDescargados || [];
    const documentosVistos = req.body.documentosVistos || [];
    const documentosPublicados = req.body.documentosPublicados || [];

    //Obtener los ids
    const documentosDescIds = documentosDescargados.map((x) => x.documentoId);
    const documentosVisIds = documentosVistos.map((j) => j.documentoId);
    const documentosPubIds = documentosPublicados.map((p) => p.documentoId);

    const sonDocumentosDescValidos = await validarDocumentosDescargados(
      documentosDescIds
    );
    if (!sonDocumentosDescValidos) {
      return res
        .status(404)
        .send(
          "Uno o más documentos descargados ingresados no existen en la base de datos"
        );
    }

    const sonDocumentosVisValidos = await validarDocumentosVistos(
      documentosVisIds
    );
    if (!sonDocumentosVisValidos) {
      return res
        .status(404)
        .send(
          "Uno o más documentos vistos ingresados no existen en la base de datos"
        );
    }

    const sonDocumentosPubValidos = await validarDocumentosPublicados(
      documentosPubIds
    );
    if (!sonDocumentosPubValidos) {
      return res
        .status(404)
        .send(
          "Uno o más documentos publicados ingresados no existen en la base de datos"
        );
    }

    const cliente = await clienteAutenticacionService.crearCliente(req.body);
    await sendEmail({
      name: req.body.nombreCompleto,  // Asegúrate de usar el nombre del cliente
      email: req.body.registro.correo,
      type: "welcome",  // Tipo de correo
    });
    res.status(201).json(cliente);
  } catch (error) {
    res.status(500).send(error.message);
    console.log(error.message);
  }
};

export const iniciarSesion = async (req, res) => {
  console.log(req.body);
  try {
    const { token, cliente } = await clienteAutenticacionService.login(
      req.body
    );
    res.json({ token, cliente });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

// Recuperación de contraseña
export const recuperacionContrasenia = async (req, res) => {
  try {
    const respuesta = await clienteAutenticacionService.recuperarContra(
      req.body
    );
    await sendEmail({
      name: respuesta.nombre,  // Nombre del cliente recuperado
      email: req.body.correo,  // Correo de la persona que solicitó la recuperación
      type: "passwordChanged",  // Tipo de correo
    });
    res.status(200).send(respuesta);

  } catch (e) {
    res.status(400).send({ error: e.message });
  }
};
// Fin nueva validación

const validarDocumentosDescargados = async (documentosDescIds) => {
  const documentosValidos = await documentoService.buscarDocumentos(
    documentosDescIds
  );
  return documentosValidos.length === documentosDescIds.length;
};

const validarDocumentosVistos = async (documentosVisIds) => {
  const documentosValidos = await documentoService.buscarDocumentos(
    documentosVisIds
  );
  return documentosValidos.length === documentosVisIds.length;
};

const validarDocumentosPublicados = async (documentosPubIds) => {
  const documentosValidos = await documentoService.buscarDocumentos(
    documentosPubIds
  );
  return documentosValidos.length === documentosPubIds.length;
};


export async function listarUsuarios(req, res) {
  try {
    const usuarios = await clienteService.listarClientes();
    if (!usuarios) {
      return res.status(400).send("No hay usuarios para listar");
    }
    res.status(200).send(usuarios);
  } catch (e) {
    res
      .status(500)
      .send({ error: "Error interno del servidor", detalle: e.message });
  }
}
export async function actualizarCliente(req, res) {
  try {
    const { userId, nombreCompleto, email } = req.body;
    const idUser = userId
    const clienteActualizado = await clienteService.actualizarNombre(
      idUser,
      nombreCompleto,
      email
    );
    await sendEmail({
      email: email,
      name: nombreCompleto,
      type: "profileChanges",
    });
    return res.status(200).json({
      message: "Nombre actualizado correctamente",
      cliente: clienteActualizado,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function eliminarCliente(req, res) {
  try {
    const userId = req.body.userId;

    const clienteEliminado = await clienteService.eliminarCliente(userId);
    await sendEmail({
      email: clienteEliminado.registro.correo,
      name: clienteEliminado.nombreCompleto,
      type: "accountDeleted",
    });
    return res.status(200).json({
      message: "Cliente eliminado correctamente",
      cliente: clienteEliminado,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function buscarUsuario(req, res) {
  try {
    const idUsuarioBuscar = req.params.usuarioId;
    const usuario = await clienteService.buscarUsuarioId(idUsuarioBuscar);
    if (!usuario) {
      return res.status(400).send("El usuario buscado no existe");
    }
    res.status(200).send(usuario);
  } catch (e) {
    res
      .status(500)
      .send({ error: "Error interno del servidor", detalle: e.message });
  }
}

export async function buscarUsuariosNickName(req, res) {
  try {
    const nickName = req.params.nickName;

    const usuarios = await clienteService.buscarUsuarioPorNombre(nickName);
    if (!usuarios) {
      return res
        .status(404)
        .send({ message: "No se encontraron usuarios con ese nick name" });
    }
    res.status(200).json(usuarios);
  } catch (e) {
    res
      .status(500)
      .send({ error: "Error interno del servidor", detalle: e.message });
  }
}
export const cambiarContrasenia = async (req, res) => {
  try {
    const { userId, contraseniaActual, nuevaContrasenia } = req.body;

    const respuesta = await clienteAutenticacionService.cambiarContrasenia(userId, contraseniaActual, nuevaContrasenia);
    await sendEmail({
      email: respuesta.email,
      name: respuesta.name,
      type: "passwordChanged",
    });
    res.status(200).json(respuesta);

  } catch (error) {
    console.error('Error al cambiar la contraseña:', error);
    res.status(400).json({ error: error.message });
  }
};

export const enviarEmail = async (req, res) => {
  const { name, email } = req.body;
  try {
    const response = await clienteAutenticacionService.sendEmail(name, email)
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export const primerPasoRecuperacion = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Debe proporcionar un correo electrónico.' });
    }

    const clienteInfo = await clienteAutenticacionService.primerPaso(email);
    await sendEmail({
      email: req.body.email,
      name: clienteInfo.nombreCompleto,
      type: "passwordReset",
    });
    res.status(200).json(clienteInfo);
  } catch (error) {
    console.error('Error en primer paso de recuperación:', error);
    res.status(400).json({ error: error.message });
  }
};

export const primerPaso = async (emailCliente) => {
  const cliente = await clienteModel.findOne({ 'registro.correo': emailCliente });

  if (!cliente) {
    throw new Error('Cliente no encontrado.');
  }
  return {
    nombreCompleto: cliente.nombreCompleto,
    preguntaAutenticacion: cliente.registro.infoPregunta.preguntaAutenticacion,
  };
};
export const obtenerEstadisticasCliente = async (req, res) => {
  const { userId } = req.body;
  const idUser = new mongoose.Types.ObjectId(userId);

  try {
    const estadisticas = await clienteService.obtenerEstadisticasCliente(
      idUser
    );
    res.status(200).json(estadisticas);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al obtener las estadísticas del cliente" });
  }
};

export const cambiarPregunta = async (req, res) => {
  try {
    const { userId, nuevaPregunta, nuevaRespuesta } = req.body;

    if (!nuevaPregunta || !nuevaRespuesta) {
      return res.status(400).json({
        error:
          "Deben proporcionarse la contraseña, la nueva pregunta y la nueva respuesta.",
      });
    }


    const preguntaActualizada =
      await clienteAutenticacionService.cambiarPregunta(
        userId,
        nuevaPregunta,
        nuevaRespuesta
      );

    await sendEmail({
      name: preguntaActualizada.name,
      email: preguntaActualizada.email,
      type: "securityQuestionChanges",
    });

    return res.status(200).json({
      message:
        preguntaActualizada.message ||
        "Pregunta de seguridad actualizada correctamente.",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: error.message || "Error interno del servidor" });
  }
};
export const obtenerHistorial = async (req, res) => {
  const { userId } = req.body
  const idUser = new mongoose.Types.ObjectId(userId);

  try {
    const historial = await clienteService.obtenerDocumentosVisualizadosyDescargados(idUser)
    res.status(200).json(historial)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Error al obtener el historial del cliente" })
  }
}

export const obtenerDocumentosVisualizadosyDescargados = async (userId) => {
  const cliente = await clienteModel.findById(userId);

  if (!cliente) {
    throw new Error("Cliente no encontrado");
  }

  const documentosVistosIds = cliente.documentosVistos.map(
    (doc) => doc.documentoId
  );
  const documentosDescargadosIds = cliente.documentosDescargados.map(
    (doc) => doc.documentoId
  );

  // Obtener la información completa de los documentos
  const documentosVistos = await documentoService.buscarDocumentos(
    documentosVistosIds
  );
  const documentosDescargados = await documentoService.buscarDocumentos(
    documentosDescargadosIds
  );

  return { documentosVistos, documentosDescargados };
};


export async function mostrarCantUsuarios(req, res) {
  try {
    const cantUsuarios = await clienteService.cantClientes();
    res.status(200).send(cantUsuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}