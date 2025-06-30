// src/routes/api/upload/+server.js
import { json } from '@sveltejs/kit';
import fs from 'node:fs/promises';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';

// ADJUST THESE IMPORT PATHS TO BE EXACTLY CORRECT FOR YOUR PROJECT
// Example using relative paths (you should know if you're using $lib or relative)
import { ProductModel } from '../../../db/models/productModel.js'; // Ensure correct path and casing
import { connection } from '../../../db/db.js'; // Ensure correct path and casing

/**
 * Updates the image URL for a specific product in the database.
 * @param {string} productId - The unique ID of the product to update.
 * @param {string} imageUrl - The URL of the newly uploaded image.
 * @returns {Promise<boolean>} - True if the database update was successful, false otherwise.
 */
async function updateProductImageUrlInDb(productId, imageUrl) {
    try {
        await connection; // Ensure the Mongoose connection promise has resolved.

        // --- ADD THESE CONSOLE.LOGS HERE ---
        console.log("--- Debugging ProductModel ---");
        console.log("Type of ProductModel:", typeof ProductModel);
        console.log("Value of ProductModel:", ProductModel);
        // If ProductModel is an object, try to log some of its properties to confirm it's a Mongoose model
        if (typeof ProductModel === 'function' && ProductModel.collection) {
            console.log("ProductModel.collection.name:", ProductModel.collection.name);
        }
        console.log("--- End Debugging ProductModel ---");
        // --- END ADDED CONSOLE.LOGS ---

        const result = await ProductModel.findByIdAndUpdate(
            productId,
            { IMAGE_URL: imageUrl },
            { new: true }
        );

        if (result) {
            console.log(`Successfully updated product ${productId} with image URL: ${imageUrl}`);
            return true;
        } else {
            console.warn(`Product with ID ${productId} not found in database.`);
            return false;
        }
    } catch (dbError) {
        console.error(`Database error updating product ${productId}:`, dbError);
        return false;
    }
}

// ... (rest of your POST function remains the same) ...

export async function POST({ request }) {
    try {
        const formData = await request.formData();
        
        /** @type {File | string | null} */
        const imageFileEntry = formData.get('imageFile');
        /** @type {string | File | null} */
        const productIdEntry = formData.get('productId');

        if (!imageFileEntry || !(imageFileEntry instanceof File) || imageFileEntry.size === 0) {
            return json({ success: false, message: 'No file uploaded or invalid file type.' }, { status: 400 });
        }
        /** @type {File} */
        const imageFile = imageFileEntry;


        if (typeof productIdEntry !== 'string' || !productIdEntry) {
            return json({ success: false, message: 'Product ID is missing or invalid.' }, { status: 400 });
        }
        /** @type {string} */
        const productId = productIdEntry;


        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!imageFile.type || !allowedMimeTypes.includes(imageFile.type)) {
            return json({ success: false, message: 'Invalid file type. Only JPEG, PNG, GIF images are allowed.' }, { status: 400 });
        }

        const uploadDir = path.join(process.cwd(), 'static', 'uploads');
        await fs.mkdir(uploadDir, { recursive: true });

        const fileExtension = path.extname(imageFile.name);
        const uniqueFilename = `${uuidv4()}${fileExtension}`;
        const filePath = path.join(uploadDir, uniqueFilename);

        const arrayBuffer = await imageFile.arrayBuffer();
        await fs.writeFile(filePath, Buffer.from(arrayBuffer));

        const imageUrl = `/uploads/${uniqueFilename}`;  

        const dbUpdateSuccess = await updateProductImageUrlInDb(productId, imageUrl);

        if (dbUpdateSuccess) {
            return json({ success: true, imageUrl: imageUrl, message: 'File uploaded and product updated successfully.' }, { status: 200 });
        } else {
            await fs.unlink(filePath);
            return json({ success: false, message: 'Failed to update product in database.' }, { status: 500 });
        }

    } catch (error) {
        console.error('API /api/upload error:', error);
        let errorMessage = 'An unknown server error occurred during upload.';

        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        } else if (error && typeof error === 'object' && 'message' in error) {
            errorMessage = /** @type {{ message: string }} */ (error).message;
        }

        return json({ success: false, message: `Server error: ${errorMessage}` }, { status: 500 });
    }
}