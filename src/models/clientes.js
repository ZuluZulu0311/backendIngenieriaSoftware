import mongoose from "mongoose"
import mongooseLong from "mongoose-long"
import "./documento.js"

mongooseLong(mongoose);
const { Types: { Long } } = mongoose;

const infoPreguntaSchema = new mongoose.Schema({
    preguntaAutenticacion: { type: String, required: true },
    respuesta: { type: String, required: true }
}, { _id: false })

const registroSchema = new mongoose.Schema({
    correo: { type: String, required: true },

    fechaRegistro: { type: Date, default: Date.now, required: true },
    infoPregunta: { type: infoPreguntaSchema, required: true }
}, { _id: false })

const documentosDescargadosSchema = new mongoose.Schema({
    documentoId: { type: mongoose.Types.ObjectId, ref: "Documentos", required: true },
    titulo: { type: String, required: true },
    fecha: { type: Date, default: Date.now(), required: true }
}, { _id: false })

const DocumentosVistosSchema = new mongoose.Schema({
    documentoId: { type: mongoose.Types.ObjectId, ref: "Documentos", required: true },
    titulo: { type: String, required: true },
    fecha: { type: Date, default: Date.now(), required: true }
}, { _id: false })

const contraseniasSchema = new mongoose.Schema({
    contrasenia: { type: String, required: true },
    estado: { type: String, enum: ["Activa", "Inactiva"], default: "Inactiva", required: true }
}, { _id: false })


const ClienteSchema = new mongoose.Schema({
    nombreCompleto: { type: String, required: true },
    nickName: { type: String, required: true },
    registro: { type: registroSchema, required: true },
    documentosDescargados: [{ type: documentosDescargadosSchema, required: false }],
    documentosVistos: [{ type: DocumentosVistosSchema, required: false }],
    numDocumentosPublicados: { type: Long, required: true },
    documentosPublicados: [{ type: mongoose.Types.ObjectId, ref: "Documentos", required: false }],
    contrasenias: [contraseniasSchema]
})

ClienteSchema.set('toJSON', {
    transform: (doc, ret) => {
        // Transformar `numDocumentosPublicados` a un número regular
        ret.numDocumentosPublicados = parseInt(ret.numDocumentosPublicados.toString(), 10);
        return ret;
    }
});

export const clienteModel = mongoose.model("Clientes", ClienteSchema, "Clientes");