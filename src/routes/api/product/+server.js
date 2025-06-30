import mongoose from "mongoose";
import { ProductModel } from "../../../db/models/productModel.js";
import { connection } from "../../../db/db.js";

export async function GET() {
    try {
        const data = await ProductModel.find();
        return new Response(JSON.stringify(data))
    } catch (err) {
        console.log(err)
        return new Response(JSON.stringify(err))
    }
}

export async function POST({ request }) {
    const { PRODUCT_NAME, SIZE, MATERIAL, SIDES, PRINT_TYPE, HARDWARE, ITEM_NUMBER, VERSIONS, NOTES, FORMS, QTY } = await request.json();
    console.log(PRODUCT_NAME)
    const newItem = new ProductModel({
        "PRODUCT_NAME": PRODUCT_NAME,
        "SIZE": SIZE,
        "MATERIAL": MATERIAL,
        "SIDES": SIDES,
        "PRINT_TYPE": PRINT_TYPE,
        "HARDWARE": HARDWARE,
        "ITEM_NUMBER": ITEM_NUMBER,
        "VERSIONS": VERSIONS,
        "NOTES": NOTES,
        "FORMS": FORMS,
        "QTY": QTY
    })

    await newItem.save();
    return new Response(
        JSON.stringify(newItem)
    )
}

export async function PATCH({ request }) {
    try {
        const { id, ...updates } = await request.json();

        if (!id) {
            return new Response(JSON.stringify({ message: 'Product ID is required for update' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 400
            });
        }
        const updatedProduct = await ProductModel.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (updatedProduct) {
            return new Response(JSON.stringify(updatedProduct), {
                headers: { 'Content-Type': 'application/json' },
                status: 200
            });
        } else {
            return new Response(JSON.stringify({ message: 'Product not found for update' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 404
            });
        }
    } catch (err) {
        console.error("PATCH /api/products error:", err);
        return new Response(JSON.stringify({ message: 'Error updating product'}), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        });
    }
}

export async function DELETE({request}) {
    try {
        const {id} = await request.json();

        await ProductModel.findByIdAndDelete(id)
        return new Response(JSON.stringify("Deleted"))
        
    } catch (err) {
        console.log(err)
        return new Response(JSON.stringify(err))
    }
}