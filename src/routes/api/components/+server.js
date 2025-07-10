import mongoose from "mongoose";
import { ComponentModel} from "../../../db/models/productModel.js";
import { connection } from "../../../db/db.js";

export async function GET() {
    try {
        const data = await ComponentModel.find();
        return new Response(JSON.stringify(data))
    } catch (err) {
        console.log(err)
        return new Response(JSON.stringify(err))
    }
}

export async function POST({ request }) {
    const { OVERALLNAME, OVERALLDESCRIPTION, COMPONENTNAME, COMPONENTDESCRIPTION, SIZE, MATERIAL, SIDES, PRINT_TYPE, HARDWARE, NOTES} = await request.json();
    console.log(OVERALLNAME)
    const newItem = new ComponentModel({
        "OVERALLNAME":OVERALLNAME,
    "OVERALLDESCRIPTION" :OVERALLDESCRIPTION,
    "COMPONENTNAME":COMPONENTNAME,
    "COMPONENTDESCRIPTION":COMPONENTDESCRIPTION,
    "SIZE":SIZE,
    "MATERIAL": MATERIAL,
    "SIDES": SIDES,
    "PRINT_TYPE": PRINT_TYPE,
    "HARDWARE": HARDWARE,
    "NOTES": NOTES,
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
        const updatedProduct = await ComponentModel.findByIdAndUpdate(
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

        await ComponentModel.findByIdAndDelete(id)
        return new Response(JSON.stringify("Deleted"))
        
    } catch (err) {
        console.log(err)
        return new Response(JSON.stringify(err))
    }
}