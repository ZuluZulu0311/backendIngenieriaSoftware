import express from "express";
import { documentoModel } from "../models/documento.js"
import mongoose from "mongoose";
import e from "express";

export const buscarDocumentoPorId = async (documentoId) => {
  const documento = await documentoModel.find({ _id: documentoId, "visibilidad": { $not: { $eq: "Privado" } } })
  return documento;
}
export const buscarIdDocument = async (documentoId) => {
  const documento = await documentoModel.findOne({ _id: documentoId, visibilidad: { $ne: "Privado" } });
  return documento
}

export const buscarDocumentos = async (documentosIds) => {
  let documentos = await documentoModel.find({ _id: { $in: documentosIds } });
  if (documentos.length == 0) {
    return documentos = [];
  }
  return documentos;
}

export const listarDocumentos = async () => {
  const documentos = await documentoModel.find({ "visibilidad": { $not: { $eq: "Privado" } } });
  return documentos;
}

export const crearDocumento = async (info) => {
  const documento = new documentoModel(info);
  return await documento.save();
}


export const infoAutoresDeDocumento = async (documentoIdBuscar) => {
  const infoAutores = await documentoModel.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId.createFromHexString(documentoIdBuscar),
        visibilidad: "Publico"
      }
    },
    { $unwind: { path: '$infoAutores' } },
    {
      $lookup: {
        from: 'Clientes',
        localField: 'infoAutores.autorId',
        foreignField: '_id',
        as: 'autor'
      }
    },
    { $unwind: { path: '$autor', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        Nombre: '$infoAutores.nombre',
        NickName: { $ifNull: ['$autor.nickName', 'No disponible'] },
        'Numero documentos Publicados': { $ifNull: ['$autor.numDocumentosPublicados', 0] },
        'Documentos Publicados': { $ifNull: ['$autor.documentosPublicados', []] }
      }
    }
  ]);
  return infoAutores;
}

export const buscarDocYEliminar = async (idDocumento) => {
  return await documentoModel.findByIdAndDelete(idDocumento);
}


export const DocsDeAutor = async (nickName, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const documentosDeEseAutor = await documentoModel.aggregate([
    { $unwind: { path: '$infoAutores' } },
    {
      $match: {
        "infoAutores.nickName": nickName,
        visibilidad: 'Publico',
      }
    },
    { $skip: skip },
    { $limit: Number(limit) },
  ]);

  const totalDocuments = await documentoModel.countDocuments({
    "infoAutores.nickName": nickName,
    visibilidad: 'Publico',
  });

  return {
    page: Number(page),
    limit: Number(limit),
    totalDocuments,
    totalPages: Math.ceil(totalDocuments / limit),
    data: documentosDeEseAutor,
  };
}


export const DocsDeAutorMisDocumentos = async (nickName, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const documentosDeEseAutor = await documentoModel.aggregate([
    { $unwind: { path: '$infoAutores' } },
    {
      $match: {
        "infoAutores.nickName": nickName
      }
    },
    { $skip: skip },
    { $limit: Number(limit) },
  ]);

  const totalDocuments = await documentoModel.countDocuments({
    "infoAutores.nickName": nickName
  });

  return {
    page: Number(page),
    limit: Number(limit),
    totalDocuments,
    totalPages: Math.ceil(totalDocuments / limit),
    data: documentosDeEseAutor,
  };
}

export const buscarYActualizarDoc = async (documentoId, info) => {
  return await documentoModel.findByIdAndUpdate(documentoId, info, { new: true });
}


//Si es -1 Z - A si es 1 A - Z

export const documentosOrdenAlfabetico = async (flag, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  let sortOption = flag ? -1 : 1;
  const docs = await documentoModel.find({ "visibilidad": { $not: { $eq: "Privado" } } })
    .sort({ titulo: sortOption })
    .limit(Number(limit))
    .skip(Number(skip));

  const totalDocuments = await documentoModel.countDocuments({ visibilidad: { $not: { $eq: "Privado" } } });

  return {
    page: Number(page),
    limit: Number(limit),
    totalDocuments,
    totalPages: Math.ceil(totalDocuments / limit),
    data: docs,
  };
}

//Si es -1 Mas recientes, si es 1 menos recientes
export const documentoOrdenadosPorFechaPublicacion = async (flag, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  let sortOption = flag ? -1 : 1;
  const docs = await documentoModel.find({ "visibilidad": { $not: { $eq: "Privado" } } })
    .sort({ fechaPublicacion: sortOption })
    .limit(Number(limit))
    .skip(Number(skip));

  const totalDocuments = await documentoModel.countDocuments({ visibilidad: { $not: { $eq: "Privado" } } });

  return {
    page: Number(page),
    limit: Number(limit),
    totalDocuments,
    totalPages: Math.ceil(totalDocuments / limit),
    data: docs,
  };
}

export const traerDocumentoPaginados = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const documents = await documentoModel.find({ "visibilidad": { $not: { $eq: "Privado" } } })
    .limit(Number(limit))
    .skip(Number(skip))
    .exec();

  const totalDocuments = await documentoModel.countDocuments({ visibilidad: { $not: { $eq: "Privado" } } });

  return {
    page: Number(page),
    limit: Number(limit),
    totalDocuments,
    totalPages: Math.ceil(totalDocuments / limit),
    data: documents,
  };
}

export const docsPorMayorCantDescargas = async (flag, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  let sortOption = flag ? -1 : 1;
  const docs = await documentoModel.find({ "visibilidad": { $not: { $eq: "Privado" } } })
    .sort({ numDescargas: sortOption })
    .limit(Number(limit))
    .skip(Number(skip));

  const totalDocuments = await documentoModel.countDocuments({ visibilidad: { $not: { $eq: "Privado" } } });

  return {
    page: Number(page),
    limit: Number(limit),
    totalDocuments,
    totalPages: Math.ceil(totalDocuments / limit),
    data: docs,
  };

}

export const docsPorMayorVisualizaciones = async (flag, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  let sortOption = flag ? -1 : 1;
  const docs = await documentoModel.find({ "visibilidad": { $not: { $eq: "Privado" } } })
    .sort({ numVisualizaciones: sortOption })
    .limit(Number(limit))
    .skip(Number(skip));

  const totalDocuments = await documentoModel.countDocuments({ visibilidad: { $not: { $eq: "Privado" } } });

  return {
    page: Number(page),
    limit: Number(limit),
    totalDocuments,
    totalPages: Math.ceil(totalDocuments / limit),
    data: docs,
  };
}

export const docsPorMejorValoracion = async (flag, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const sortOption = flag ? -1 : 1;

  // Validación adicional
  if (isNaN(skip) || skip < 0) {
    throw new Error('El cálculo de "skip" es inválido. Verifique los parámetros "page" y "limit".');
  }

  const docs = await documentoModel.aggregate([
    {
      $match: { visibilidad: "Publico" }
    },
    {
      $addFields: {
        promedioValoraciones: {
          $cond: {
            if: { $gt: [{ $size: { $ifNull: ['$valoraciones', []] } }, 0] },
            then: { $avg: '$valoraciones.puntuacion' },
            else: 0
          }
        }
      }
    },
    { $sort: { promedioValoraciones: sortOption } },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        _id: 1,
        titulo: 1,
        URL: 1,
        descripcion: 1,
        idioma: 1,
        categoria: 1,
        visibilidad: 1,
        fechaPublicacion: 1,
        infoAutores: 1,
        numDescargas: 1,
        numVisualizaciones: 1,
        fechaUltimaModificacion: 1,
        valoraciones: 1,
        imagenPortada: 1,
        promedioValoraciones: 1
      }
    }
  ]);

  // Ajuste en el conteo total de documentos
  const totalDocuments = await documentoModel.countDocuments({
    visibilidad: "Publico",
    $or: [
      { valoraciones: { $exists: false } },
      { valoraciones: { $size: 0 } },
      { valoraciones: { $exists: true, $ne: [] } }
    ]
  });

  return {
    page,
    limit,
    totalDocuments,
    totalPages: Math.ceil(totalDocuments / limit),
    data: docs,
  };
};



export const docsAleatoriamente = async (limit = 10) => {
  const docs = await documentoModel.aggregate([
    { $sample: { size: Number(limit) } }
  ]);
  return docs;
}

export const promedioValoracion = async (documentoId) => {
  const promedio = await documentoModel.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId.createFromHexString(documentoId)
      }
    },
    {
      $unwind: "$valoraciones"
    },
    {
      $group: {
        _id: null,
        promedioValoraciones: { $avg: "$valoraciones.puntuacion" }
      }
    },
    {
      $project: { _id: 0, promedioValoraciones: 1 }
    }
  ]);
  return promedio;
}

export const cantTotalDocumentos = async () => {
  const cantTotal = await documentoModel.aggregate(
    [
      { $group: { _id: null, Suma: { $sum: 1 } } },
      { $project: { _id: 0 } }
    ],
    { maxTimeMS: 60000, allowDiskUse: true }
  );
  return cantTotal;
}

export const cantDocumentoCategoria = async (categoriaId) => {
  const cant = await documentoModel.aggregate(
    [
      {
        $unwind: {
          path: '$categoria',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: {
          'categoria.categoriaId': mongoose.Types.ObjectId.createFromHexString(categoriaId)
        }
      },
      {
        $group: { _id: null, Cantidad: { $sum: 1 } }
      },
      { $project: { _id: 0 } }
    ],
    { maxTimeMS: 60000, allowDiskUse: true }
  );

  return cant.length ? cant[0] : { Cantidad: 0 };
}




export const buscarDocumentosConFiltros = async (filters, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  // Crear el objeto de búsqueda dinámico para la agregación
  const pipeline = [
    {
      $match: {
        visibilidad: { $not: { $eq: "Privado" } } // Filtrar por visibilidad pública
      }
    }
  ];

  // Si existe título, agregar el filtro de título
  if (filters.titulo) {
    pipeline.push({
      $match: {
        titulo: { $regex: filters.titulo, $options: 'i' } // Búsqueda insensible a mayúsculas/minúsculas
      }
    });
  }

  // Si existe categoría y subcategoría, agregar el filtro correspondiente
  if (filters.categoriaNombre && filters.subCategoriaNombre) {
    pipeline.push({
      $match: {
        'categoria.categoriaNombre': filters.categoriaNombre,
        'categoria.subCategoriaNombre': filters.subCategoriaNombre
      }
    });
  } else if (filters.categoriaNombre) {
    pipeline.push({
      $match: {
        'categoria.categoriaNombre': filters.categoriaNombre
      }
    });
  }

  // Si existe idioma, agregar el filtro de idioma
  if (filters.idioma) {
    pipeline.push({
      $match: {
        idioma: filters.idioma
      }
    });
  }

  // Si existe nombreAutor, agregar el filtro para buscar en `infoAutores`
  if (filters.nombreAutor) {
    pipeline.push(
      { $unwind: { path: '$infoAutores', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          'infoAutores.tipo': 'AutorPublica', // Tipo de autor que publica
          'infoAutores.nombreCompleto': { $regex: filters.nombreAutor, $options: 'i' } // Filtro por nombre del autor
        }
      }
    );
  }

  // Agregar la paginación
  pipeline.push(
    { $skip: skip },
    { $limit: Number(limit) }
  );

  // Ejecutar la consulta de agregación
  const documentos = await documentoModel.aggregate(pipeline).allowDiskUse(true);

  // Contar el total de documentos que coinciden con los filtros
  const totalDocuments = await documentoModel.aggregate([
    ...pipeline.slice(0, -2), // Reutilizamos los mismos filtros, pero sin paginación
    { $count: "total" }
  ]);

  const total = totalDocuments.length > 0 ? totalDocuments[0].total : 0;

  return {
    page: Number(page),
    limit: Number(limit),
    totalDocuments: total,
    totalPages: Math.ceil(total / limit),
    data: documentos,
  };
};


export const crearValoracion = async (documentoId, infoValoracion) => {
  let valoracion = infoValoracion;
  if (valoracion.comentario == null || valoracion.comentario == "") {
    valoracion.comentario = "No se proporcionó un comentario";
  }
  if (valoracion.comentario !== null && valoracion.puntuacion == null) {
    throw new Error("No se puede comentar la publicacion sin haber valorado");
  }
  valoracion.idValoracion = new mongoose.Types.ObjectId;
  valoracion.fecha = Date.now();
  if (valoracion.puntuacion == null) {
    throw new Error("Se requiere una puntuacion para la creación de la valoracion");
  }

  const documentoExistente = await documentoModel.findById(documentoId);
  const valoracionesExistentes = documentoExistente.valoraciones;
  valoracionesExistentes.forEach(val => {
    if (val.clienteId == infoValoracion.clienteId) {
      throw new Error("Un mismo cliente no puede comentar un documento más de una vez");
    }
  });

  const documentoEncontrado = documentoModel.findByIdAndUpdate(documentoId,
    { $push: { valoraciones: valoracion } },
    { new: true, useFindAndModify: false }
  );

  return documentoEncontrado;
}

export const editarValoracionDeDocumento = async (documentoId, idValoracion, comentario, puntuacion) => {
  const updateFields = {};

  // Construcción dinámica de los campos a actualizar
  if (comentario) updateFields['valoraciones.$[elem].comentario'] = comentario;
  if (puntuacion !== undefined) updateFields['valoraciones.$[elem].puntuacion'] = puntuacion;

  // Si no hay campos para actualizar, lanzar un error
  if (Object.keys(updateFields).length === 0) {
    throw new Error('No se proporcionaron campos para actualizar.');
  }

  let valoracionActualizada = await documentoModel.updateOne(
    {
      _id: mongoose.Types.ObjectId.createFromHexString(documentoId),
      visibilidad: "Publico",
      'valoraciones.idValoracion': mongoose.Types.ObjectId.createFromHexString(idValoracion)
    },
    { $set: updateFields },
    {
      arrayFilters: [{ 'elem.idValoracion': mongoose.Types.ObjectId.createFromHexString(idValoracion) }]
    })

  return valoracionActualizada;
}

export async function eliminarValoracion(documentoId, idValoracion) {
  try {
    const resultado = await documentoModel.updateOne(
      { _id: mongoose.Types.ObjectId.createFromHexString(documentoId), visibilidad: "Publico" },
      { $pull: { valoraciones: { idValoracion: mongoose.Types.ObjectId.createFromHexString(idValoracion) } } }
    );

    if (resultado.modifiedCount === 0) {
      throw new Error('No se encontró la valoración o el documento.');
    }

    return { message: 'Valoración eliminada exitosamente.' };
  } catch (error) {
    throw new Error(`Error al eliminar la valoración: ${error.message}`);
  }
}

export async function listarValoraciones(documentoId) {
  const valoraciones = await documentoModel.aggregate(
    [
      {
        $match: {
          _id: mongoose.Types.ObjectId.createFromHexString(documentoId),
          visibilidad: "Publico"
        }
      },
      {
        $unwind: {
          path: '$valoraciones',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'Clientes',
          localField: 'valoraciones.clienteId',
          foreignField: '_id',
          as: 'cliente'
        }
      },
      {
        $unwind: {
          path: '$cliente',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 0,
          idValoracion: '$valoraciones.idValoracion',
          puntuacion: '$valoraciones.puntuacion',
          comentario: '$valoraciones.comentario',
          clienteId: '$valoraciones.clienteId',
          fecha: '$valoraciones.fecha',
          nombreCliente: '$cliente.nombreCompleto'
        }
      }
    ],
    { maxTimeMS: 60000, allowDiskUse: true }
  );

  return valoraciones;
}


