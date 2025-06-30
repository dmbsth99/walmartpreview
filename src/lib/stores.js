import { writable } from 'svelte/store';

// Helper function for UUID generation
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * @typedef {object} Product
 * @property {string} _id
 * @property {string} PRODUCT_NAME
 * @property {string} [DESCRIPTION]
 * @property {string} [SIZE]
 * @property {string} [MATERIAL]
 * @property {string} [SIDES]
 * @property {string} [PRINT_TYPE]
 * @property {string} [HARDWARE]
 * @property {string} [ITEM_NUMBER]
 * @property {string} [VERSIONS]
 * @property {string} [FORMS]
 * @property {string} [NOTES]
 * @property {string} [QTY]
 */

/**
 * @typedef {object} ProductInKit
 * @property {string} _id
 * @property {string} PRODUCT_NAME
 * @property {string} [DESCRIPTION]
 * @property {string} [SIZE]
 * @property {string} [MATERIAL]
 * @property {string} [SIDES]
 * @property {string} [PRINT_TYPE]
 * @property {string} [HARDWARE]
 * @property {string} [ITEM_NUMBER]
 * @property {string} [VERSIONS]
 * @property {string} [FORMS]
 * @property {string} [NOTES]
 * @property {string} quantitypkit // Quantity per kit specific to this product in this kit
 */


/**
 * @typedef {object} KitVersion
 * @property {boolean} status // Not used in provided code but good to keep if intended for future use
 * @property {string} text // Kit Name
 * @property {Array<ProductInKit>} products // Products within this kit, with quantitypkit
 * @property {string} qty // Quantity of this kit version
 */

/**
 * @typedef {object} Campaign
 * @property {string} _id
 * @property {string} name
 * @property {boolean} isKitting // This now explicitly states if kitting is enabled for the campaign
 * @property {Product[]} products // The products in this campaign
 * @property {KitVersion[]} kitVersions // The kit versions for this campaign (if isKitting is true)
 * @property {string} submittedAt // Timestamp when the campaign was submitted
 */

// --- Stores for UI state (e.g., modals, search) ---
// These are typically transient and might not need localStorage persistence unless specifically desired.
export const isOpen = writable(false);
export const id = writable();
export let searchStore = writable('');

// --- Kitting-specific stores and persistence ---
const KITTING_TOGGLE_STORAGE_KEY = 'kittingToggle';
const KITTING_DATA_STORAGE_KEY = 'kittingData';

// Initialize isKittingToggled from localStorage or false
const initialKittingToggled = typeof localStorage !== 'undefined'
    ? JSON.parse(localStorage.getItem(KITTING_TOGGLE_STORAGE_KEY) || 'false')
    : false;
export const isKittingToggled = writable(initialKittingToggled);

// Initialize kitVersions from localStorage or an empty array
const initialKitVersions = typeof localStorage !== 'undefined'
    ? JSON.parse(localStorage.getItem(KITTING_DATA_STORAGE_KEY) || '[]')
    : [];
/** @type {import('svelte/store').Writable<KitVersion[]>} */
export const kitVersions = writable(initialKitVersions);

// Subscribe to changes and save to localStorage
if (typeof localStorage !== 'undefined') {
    isKittingToggled.subscribe(value => {
        localStorage.setItem(KITTING_TOGGLE_STORAGE_KEY, JSON.stringify(value));
    });

    kitVersions.subscribe(value => {
        localStorage.setItem(KITTING_DATA_STORAGE_KEY, JSON.stringify(value));
    });
}


/** @type {import('svelte/store').Writable<Product[]>} */
const _campaignProducts = writable([]); // This remains in-memory unless explicitly added to previousCampaigns

export const campaignProducts = {
    subscribe: _campaignProducts.subscribe,

    /**
     * Adds a product to the campaign.
     * @param {Product} productData The product object to add.
     */
    add: async (productData) => {
        _campaignProducts.update(currentProducts => {
            const newProduct = { ...productData, _id: generateUUID() };
            console.log("Product added to in-memory store:", newProduct);
            return [...currentProducts, newProduct];
        });
    },

    /**
     * Removes a product from the campaign.
     * @param {string} productId The _id of the product to remove.
     */
    remove: async (productId) => {
        _campaignProducts.update(currentProducts => {
            const updatedProducts = currentProducts.filter(p => p._id !== productId);
            console.log("Product removed from in-memory store:", productId);
            return updatedProducts;
        });
    },

    /**
     * Updates an existing product in the campaign.
     * @param {string} productId The _id of the product to update.
     * @param {Partial<Product>} updates A partial product object containing fields to update.
     */
    update: async (productId, updates) => {
        _campaignProducts.update(currentProducts => {
            const index = currentProducts.findIndex(p => p._id === productId);
            if (index !== -1) {
                const updatedProduct = { ...currentProducts[index], ...updates };
                currentProducts[index] = updatedProduct;
                console.log("Product updated in in-memory store:", updatedProduct);
            } else {
                console.warn("Attempted to update a product not found in the campaign:", productId);
            }
            return [...currentProducts];
        });
    }
};

/** @type {import('svelte/store').Writable<Campaign[]>} */
const _previousCampaigns = writable([]);

// Custom store for submitted campaigns
export const previousCampaigns = {
    subscribe: _previousCampaigns.subscribe,

    /**
     * Saves a completed campaign to the history.
     * @param {string} name The name of the campaign.
     * @param {boolean} isKitting Whether kitting was involved.
     * @param {Product[]} products The final list of products in the campaign.
     * @param {KitVersion[]} kitVersions The final kit versions (if isKitting is true).
     */
    save: async (name, isKitting, products, kitVersions) => {
        _previousCampaigns.update(history => {
            const newCampaign = {
                _id: generateUUID(), // Unique ID for the submitted campaign
                name: name,
                isKitting: isKitting,
                products: products,
                kitVersions: isKitting ? kitVersions : [], // Only save kit versions if kitting is true
                submittedAt: new Date().toISOString() // Timestamp for submission
            };
            console.log("Campaign saved to history:", newCampaign);
            return [...history, newCampaign];
        });
    }
}