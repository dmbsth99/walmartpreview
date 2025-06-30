import mongoose from "mongoose";
const {Schema, model} = mongoose;

const productSchema = new Schema({
    "PRODUCT_NAME":{type: String},
    "SIZE":{type: String},
    "MATERIAL": {type: String},
    "SIDES": {type: String},
    "PRINT_TYPE": {type: String},
    "HARDWARE": {type: String},
    "ITEM_NUMBER": {type: String},
    "VERSIONS": {type: String},
    "FORMS": {type: String},
    "NOTES": {type: String},
    "QTY": {type: Number},
    "IMAGE_URL": { type: String, default: null }
})

export const ProductModel = mongoose.models.Product || model("Product", productSchema);
