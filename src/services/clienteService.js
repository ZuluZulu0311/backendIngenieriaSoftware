import express from "express";
import { clienteModel } from "../models/clientes.js";
import { documentoModel } from "../models/documento.js";
import * as documentoService from "./documentoService.js"
import mongoose from "mongoose";

export const crearCliente = async (info) => {
  const clienteExiste = await clienteModel.findOne({
    "registro.correo": info.registro.correo,
  });

  if (clienteExiste) {
    throw new Error("Ya existe un usuario con el correo ingresado");
  }
  const Cliente = new clienteModel(info);
  return await Cliente.save();
};

export const buscarUsuarioId = async (clienteId) => {
  const cliente = await clienteModel.findById({ _id: clienteId });
  return cliente;
};

export const buscarClientes = async (clientesIds) => {
  let clientes = await clienteModel.find({ _id: { $in: clientesIds } });
  if (clientes.length == 0) {
    return (clientes = []);
  }
  return clientes;
};

/* export const buscarUsuarioYEliminar = async (clienteId) => {
  return await clienteModel.findByIdAndDelete(clienteId);
}; */

export const buscarUsuarioYActualizar = async (clienteId, info) => {
  return await clienteModel.findByIdAndUpdate(clienteId, info, { new: true });
};

export const listarClientes = async () => {
  const clientes = await clienteModel.find({});
  return clientes;
};

export const buscarUsuarioPorNombre = async (nomCliente) => {
  const clientes = await clienteModel.find({
    nickName: { $regex: nomCliente, $options: "i" },
  });
  return clientes;
};

export const cantDocumentosVistos = async (usuarioId) => {
  const cant = await clienteModel.aggregate(
    [
      {
        $match: {
          _id: mongoose.Types.ObjectId.createFromHexString(usuarioId),
        },
      },
      {
        $unwind: {
          path: "$documentosVistos",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          cant: {
            $cond: {
              if: {
                $isArray: "$documentosVistos",
              },
              then: {
                $size: "$documentosVistos",
              },
              else: 0,
            },
          },
        },
      },
    ],
    { maxTimeMS: 60000, allowDiskUse: true }
  );
};

export const cantDocumentosDescargados = async (usuarioId) => {
  const cant = await clienteModel.aggregate(
    [
      {
        $match: {
          _id: mongoose.Types.ObjectId.createFromHexString(usuarioId),
        },
      },
      {
        $unwind: {
          path: "$documentosDescargados",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          cant: {
            $cond: {
              if: {
                $isArray: "$documentosDescargados",
              },
              then: {
                $size: "$documentosDescargados",
              },
              else: 0,
            },
          },
        },
      },
    ],
    { maxTimeMS: 60000, allowDiskUse: true }
  );
};

export const cantClientes = async () => {
  const cantClientes = await clienteModel.aggregate(
    [
      {
        $group: { _id: "null", Suma: { $sum: 1 } },
      },
      { $project: { _id: 0 } },
    ],
    { maxTimeMS: 60000, allowDiskUse: true }
  );
  return cantClientes;
};
export const actualizarNombre = async (userId, nuevoNombre, email) => {
  const clienteActualizado = await clienteModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        "registro.correo": email,
        nombreCompleto: nuevoNombre,
      },
    },
    { new: true }
  );

  if (!clienteActualizado) {
    throw new Error("Cliente no encontrado");
  }

  return clienteActualizado;
};
export async function eliminarCliente(userId) {
  const cliente = await clienteModel
    .findById(userId)
    .populate("documentosPublicados");
  if (!cliente) {
    throw new Error("Cliente no encontrado");
  }

  // Eliminar los documentos asociados
  const documentosIds = cliente.documentosPublicados.map((doc) => doc._id);
  if (documentosIds.length > 0) {
    await documentoModel.deleteMany({ _id: { $in: documentosIds } });
  }

  // Eliminar el cliente
  await clienteModel.findByIdAndDelete(userId);

  return cliente;
}
export const obtenerEstadisticasCliente = async (userId) => {


  const id = new mongoose.Types.ObjectId(userId);


  const resultado = await clienteModel.aggregate([
    {
      '$match': {
        '_id': id  // Usa el ObjectId generado desde userId
      }
    },
    {
      '$project': {
        '_id': 0,
        'documentosSubidos': { '$size': '$documentosPublicados' },
        'documentosDescargados': { '$size': '$documentosDescargados' },
        'documentosVistos': { '$size': '$documentosVistos' }
      }
    }
  ]);

  return resultado[0] || { documentosSubidos: 0, documentosDescargados: 0, documentosVistos: 0 };
}

export const documentoVisualizado = async (userId, documentoId) => {
  const cliente = await clienteModel
    .findById(userId)
    .select("documentosVistos");

  if (!cliente) {
    throw new Error("Cliente no encontrado");
  }

  const yaVisto = busquedaBinaria(cliente.documentosVistos, documentoId);
  if (yaVisto) {
    return;
  }

  const documento = await documentoService.buscarDocumentoPorId(documentoId);
  if (!documento) {
    throw new Error("Documento no encontrado");
  }

  const nuevoDocumentoVisto = {
    documentoId: documentoId,
    titulo: documento.titulo,
    fecha: new Date(),
  };

  await clienteModel.findByIdAndUpdate(
    userId,
    {
      $push: {
        documentosVistos: {
          $each: [nuevoDocumentoVisto], // Elemento que deseas agregar
          $sort: { "documentosVistos.documentoId": 1 }, // Ordena por documentoId
        },
      },
    },
    { new: true }
  );

  await documentoModel.findByIdAndUpdate(documentoId, {
    $inc: { numVisualizaciones: 1 },
  });
};

export const documentoDescargado = async (userId, documentoId) => {
  const cliente = await clienteModel
    .findById(userId)
    .select("documentosDescargados");

  if (!cliente) {
    throw new Error("Cliente no encontrado");
  }
  const documento = await documentoService.buscarDocumentoPorId(documentoId);
  if (!documento) {
    throw new Error("Documento no encontrado");
  }

  const yaVisto = busquedaBinaria(cliente.documentosDescargados, documentoId);
  if (yaVisto) {
    return;
  }

  const nuevoDocumentoDescargado = {
    documentoId: documentoId,
    titulo: documento.titulo,
    fecha: new Date(),
  };
  await clienteModel.findByIdAndUpdate(
    userId,
    {
      $push: {
        documentosDescargados: {
          $each: [nuevoDocumentoDescargado], // Elemento que deseas agregar
          $sort: { "documentosDescargados.documentoId": 1 }, // Ordena por documentoId
        },
      },
    },
    { new: true }
  );

  await documentoModel.findByIdAndUpdate(documentoId, {
    $inc: { numDescargas: 1 },
  });
};
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
function busquedaBinaria(array, documentoId) {
  let inicio = 0;
  let fin = array.length - 1;
  while (inicio <= fin) {
    const medio = Math.floor((inicio + fin) / 2);
    const idActual = array[medio].documentoId.toString();

    if (idActual === documentoId.toString()) {
      return true;
    } else if (idActual < documentoId.toString()) {
      inicio = medio + 1;
    } else {
      fin = medio - 1;
    }
  }

  return false; // Documento no encontrado
}

