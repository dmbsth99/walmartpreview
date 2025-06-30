import mongoose from "mongoose";
const {Schema, model} = mongoose;

const campaignSchema = new Schema({
    "PRODUCT_NAME":{type: String},
    "SIZE":{type: String},
    "MATERIAL": {type: String},
    "SIDES": {type: String},
    "PRINT_TYPE": {type: String},
    "HARDWARE": {type: String},
    "ITEM_NUMBER": {type: String}
})

export const CampaignModel = model("Product", campaignSchema)