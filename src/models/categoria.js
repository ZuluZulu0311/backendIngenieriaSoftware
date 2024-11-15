import mongoose from "mongoose"

const categoriaSchema = new mongoose.Schema({
    nombre: {type: String, required: true},
    subcategoria: [{
        categoriaId: {type: mongoose.Types.ObjectId, ref: "Categoria"},
        nombre: {type: String, required: true},
        _id: false
    }, {required: false}],
});

export const categoriaModel = mongoose.model("Categoria", categoriaSchema, "Categoria");