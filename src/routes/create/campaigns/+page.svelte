<script lang="ts">
  // Define the Product interface directly in this file for self-containment
  interface Product {
    _id: string;
    PRODUCT_NAME: string;
    DESCRIPTION?: string;
    SIZE?: string;
    MATERIAL?: string;
    SIDES?: string;
    PRINT_TYPE?: string;
    HARDWARE?: string;
    ITEM_NUMBER?: string;
    VERSIONS?: string;
    FORMS?: string;
    NOTES?: string;
    QTY?: string;
    PREVIOUSQNUMBER?: string;
    IMAGE_URL?: string | null;

    // Fields specific to Multi-Component Products
    COMPONENTS?: {
      COMPONENT_NAME: string;
      COMPONENT_DESCRIPTION?: string;
      SIZE?: string;
      MATERIAL?: string;
      SIDES?: string;
      PRINT_TYPE?: string;
      HARDWARE?: string;
       // Add any other component-specific fields
        IMAGE_URL?: string; // Assuming 'imageUrl' in your template corresponds to IMAGE_URL
    // Add any other properties your product objects might have

    NOTES?: string;
    }[];
  }

  // Define an interface for Product when it's part of a kit, including quantitypkit
  interface ProductInKit extends Product {
    quantitypkit?: string; // This property is specific to products *within* a kit
  }

  import { isKittingToggled, campaignProducts } from '$lib/stores.js';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';
  import { onMount } from 'svelte';

  
  let productsInCampaign: Product[] = $campaignProducts; // Explicitly type productsInCampaign
  //let Ischecked = $state(false);
  let addAllProductstoKit = $state(false);
  let kitVersions = $state([
    // products array should hold ProductInKit type
    { status: false, text: '', products: [] as ProductInKit[], qty: "" }
  ]);

  let quantitypkit = $state(""); // This seems unused, keeping it as is.

  let kitCounter = 1; // This seems unused, keeping it as is.
  let SubmitForm = $state(false);
  let CampaignName = $state("");
  let selectedView = $state('VIEW AS ESTIMATING SUMMARY'); // Default view

  let options = [
    'VIEW AS ESTIMATING SUMMARY',
    'VIEW AS SPREADSHEET',
    'VIEW KITTING ONLY'
  ]

  function addversions() {
    kitVersions.push({
      text: '',
      status: false,
      products: [],
      qty: ""
    });
    kitCounter++;
  }

  function toggleSubmit() {
    SubmitForm = true;
  }

    interface Kit {
    text: string;
    qty: number | string; // qty can be a number or string (e.g., from input)
    products: ProductInKit[];
  }

  /**
   * Handles the submission of an individual product's update form.
   * It prevents the default form submission and directly updates the in-memory store.
   * @param {Event} event The form submission event.
   * @param {Product} product The product object being updated (its _id is used for identification).
   */
  async function handleSubmit(event: Event, product: Product) {
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const updates: { [key: string]: string | number | undefined | null } = {};
    formData.forEach((value, key) => {
      if (key === 'ITEM_NUMBER' || key === 'QTY') {
        updates[key] = value ? parseInt(value.toString()) : undefined;
      } else {
        updates[key] = value.toString();
      }
    });

    try {
      await campaignProducts.update(product._id, updates);
      console.log('Product updated successfully in in-memory store.');
    } catch (error) {
      console.error('An unexpected error occurred during product update:', error);
    }
  }

  /**
   * Removes a product from the campaign (from the in-memory store).
   * @param {string} productId The _id of the product to remove.
   */
  async function removeProductFromCampaign(productId: string) {
    try {
      await campaignProducts.remove(productId);
      console.log('Product removed successfully from in-memory store.', productsInCampaign);
    } catch (error) {
      console.error('Error removing product:', error);
    }
  }

  function toggleProductInKit(kit: { products: ProductInKit[] }, product: Product, event: Event) { // Use ProductInKit
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      // Cast product to ProductInKit before pushing, ensuring quantitypkit is allowed
      if (!kit.products.some((p: ProductInKit) => p._id === product._id)) {
        kit.products.push({ ...product, quantitypkit: '' }); // Initialize quantitypkit when adding
      }
    } else {
      kit.products = kit.products.filter((p: ProductInKit) => p._id !== product._id);
      kitVersions = kitVersions;
    }
  }

  // Helper function to check if a product is in a specific kit
  function isProductInKit(kit: { products: ProductInKit[] }, product: Product): boolean { // Use ProductInKit
    return kit.products.some((p: ProductInKit) => p._id === product._id);
  }

  function getProductTotalQuantity(productId: string): number {
    let totalQuantity = 0;
    if (!$isKittingToggled) {
      const product = productsInCampaign.find(p => p._id === productId);
      return product && product.QTY ? parseInt(product.QTY.toString()) : 0;
    }

    kitVersions.forEach(kit => {
      // Find productInKit with the correct type
      const productInKit = kit.products.find(p => p._id === productId) as ProductInKit | undefined;
      if (productInKit && kit.qty && productInKit.quantitypkit) { // Now quantitypkit exists on productInKit
        totalQuantity += parseInt(kit.qty) * parseInt(productInKit.quantitypkit);
      }
    });
    return totalQuantity;
  }

function addAllCampaignProductsToKit(kit: Kit, event: Event) {
    const target = event.target as HTMLInputElement; // Cast event.target to HTMLInputElement

    if (target.checked) {
      // Add all products from productsInCampaign to the current kit
      productsInCampaign.forEach(product => {
        if (!isProductInKit(kit, product)) {
          kit.products = [...kit.products, { ...product, quantitypkit: '' }];
        }
      });
    } else {
      // If unchecked, clear all products from this kit that were from the campaign
      kit.products = kit.products.filter(productInKit =>
        !productsInCampaign.some(campaignProd => campaignProd._id === productInKit._id)
      );
    }
    // Trigger reactivity
    kitVersions = kitVersions;
  }
</script>


<div class="mt-5 bg-[#6495ed] p-4 flex flex-col items-center rounded-lg border-5">
    <h1 class ="text-[30px] font-bold">YOUR CAMPAIGN PRODUCTS</h1>
  <input class="campaignName mb-4 p-2 rounded-lg border-black border-4" placeholder="Name Your Campaign..." bind:value={CampaignName}>
  <label class="text-[20px] inline-flex items-center me-5 cursor-pointer">
    <input type="checkbox" bind:checked={$isKittingToggled} class="sr-only peer">
    <div class="mr-5 relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-400 dark:peer-checked:bg-yellow-400"></div>
    Is there kitting in this campaign?
  </label>
</div>

<div class="h-auto bg-[#6495ed] p-4 font-inter antialiased grid gap-2 border-5 rounded-lg mt-2
  {$isKittingToggled ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}
">
  {#if $isKittingToggled}
    <div class="kittingModule rounded-lg h-fit p-4">
      <label class="block text-white text-2xl font-bold mb-4">
        KITTING:
        <div class="text-lg text-center p-8 bg-white rounded-lg shadow-md mx-auto max-w-3xl text-gray-800">
          <form>
            <ul>
              {#each kitVersions as kit, index}
                <li class="mb-6 pb-4 border-b border-gray-200">
                  <h3 class="text-[25px] font-bold mb-2">Kit Version #{index + 1}:</h3>
                  <label class="block mb-2">
                    <span class="text-gray-700 text-base font-bold">Kit Name:</span>
                    <input type="text" bind:value={kit.text} class="mb-5 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-black text-lg p-2 resize-y" placeholder="eg.ENGLISH" />
                  </label>
                  <label class="block mb-4">
                    <span class="text-gray-700 text-base font-bold">Quantity of Kits:</span>
                    <input type="text" bind:value={kit.qty} class="mb-5 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-black text-lg p-2 resize-y" placeholder="eg. 500" />
                  </label>
                                  <label>
                <input type = "checkbox" on:change={(e) => addAllCampaignProductsToKit(kit, e)}> ADD ALL CAMPAIGN PRODUCTS TO THIS KIT
                </label>

                  <ul class="list-none p-0">
                    {#each kit.products as productInKit (productInKit._id)}
                      <li class="text-[20px] font-semibold mb-2 flex items-center">
                        <span class="mr-2">▪️{productInKit.PRODUCT_NAME}:</span>
                        <input type="text" placeholder="Quantity/Kit..." bind:value={productInKit.quantitypkit} class="mb-5 mt-1 block w-100 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-black text-lg p-2 resize-y"/>
                      </li>
                    {/each}
                  </ul>
                </li>

              {/each}
            </ul>
            <button type ="button" class="border-5 border-black p-4 rounded-lg hover:bg-[#daa520] hover:font-semibold text-[20px]" on:click = {addversions}>
              ADD A KIT VERSION
            </button>
          </form>
        </div>
      </label>
    </div>
  {/if}


 {#if productsInCampaign.length === 0}
        <p class="text-lg text-center p-8 bg-white rounded-lg shadow-md mx-auto">
            No products added to your campaign yet. Go back to the <a href="/" class="text-blue-600 hover:underline font-semibold">product catalogue</a> to add some!
        </p>
    {:else}
  <div class="grid gap-2
      {$isKittingToggled? 'grid-cols-1' : 'grid-cols-1 justify-center mx-auto w-270'}
    ">
        <div>
            {#each productsInCampaign as product (product._id)}
                <div class="block border border-black bg-[#daa520] text-black py-2 m-4 rounded-lg shadow-lg select-none border-5 h-fit" >
                    <h1 class="Pname text-[30px] font-semibold" bind:innerText={product.PRODUCT_NAME} contenteditable="true"></h1>


          {#if $isKittingToggled}
            <div class="px-4 py-2">
              <h3 class="text-[18px] font-bold mb-2">Assign to Kits:</h3>
              {#each kitVersions as kit (kit.text || `kit-version-${kitVersions.indexOf(kit)}`)}
                <label class="space-x-2 text-white mb-1">
                  <input type="checkbox" checked={isProductInKit(kit, product)} on:change={(e) => toggleProductInKit(kit, product, e)} class="form-checkbox h-4 w-4 text-blue-600 rounded" />
                  <span class="text-[18px] font-semibold text-black">{kit.text || `Kit Version #${kitVersions.indexOf(kit) + 1}`}</span><br>
                </label>
              {/each}
            </div>
          {/if}



                              <details class="text-base px-4">
                        <summary class="text-[20px] font-medium cursor-pointer">EDIT PRODUCT DETAILS</summary>



                        <form on:submit|preventDefault={(e) => handleSubmit(e, product)} class="p-4 sm:p-6 bg-white text-gray-800 border-t border-gray-200 rounded-lg mt-2">
                            <label class="flex flex-col items-center justify-center space-y-4">
                                <span class="text-gray-700 text-base font-bold">Description:</span>
                                <textarea name="DESCRIPTION" bind:value={product.DESCRIPTION} class="mb-5 mt-1 block w-200 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-black text-lg p-2 resize-y"></textarea>
                            </label>

                            {#if !$isKittingToggled}

                              <label class="flex flex-col items-center justify-center space-y-4">
                                <span class="text-gray-700 text-base font-bold">Quantity:</span>
                                <input type="text" name="QTY" bind:value={product.QTY} class="mb-5 mt-1 block w-200 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-black text-lg p-2" />
                            </label>

                            {/if}

                            <label class="flex flex-col items-center justify-center space-y-4">
                                <span class="text-gray-700 text-base font-bold">Artwork Versions (#):</span>
                                <input type="text" name="VERSIONS" bind:value={product.VERSIONS} class="mb-5 mt-1 block w-200 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-black text-lg p-2" />
                            </label>

                            <label class="flex flex-col items-center justify-center space-y-4">
                                <span class="text-gray-700 text-base font-bold">Size:</span>
                                <input type="text" name="SIZE" bind:value={product.SIZE} class="mb-5 mt-1 block w-200 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-black text-lg p-2" />
                            </label>
                            <label class="flex flex-col items-center justify-center space-y-4">
                                <span class="text-gray-700 text-base font-bold">Material:</span>
                                <input type="text" name="MATERIAL" bind:value={product.MATERIAL} class="mb-5 mt-1 block w-200 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-black text-lg p-2" />
                            </label>
                            <label class="flex flex-col items-center justify-center space-y-4">
                                <span class="text-gray-700 text-base font-bold">Sides:</span>
                                <input type="text" name="SIDES" bind:value={product.SIDES} class="mb-5 mt-1 block w-200 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-black text-lg p-2" />
                            </label>
                            <label class="flex flex-col items-center justify-center space-y-4">
                                <span class="text-gray-700 text-base font-bold">Print Type:</span>
                                <input type="text" name="PRINT_TYPE" bind:value={product.PRINT_TYPE} class="mb-5 mt-1 block w-200 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-black text-lg p-2" />
                            </label>
                            <label class="flex flex-col items-center justify-center space-y-4">
                                <span class="text-gray-700 text-base font-bold">Hardware:</span>
                                <input type="text" name="HARDWARE" bind:value={product.HARDWARE} class="mb-5 mt-1 block w-200 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-black text-lg p-2" />
                            </label>
                            <label class="flex flex-col items-center justify-center space-y-4">
                                <span class="text-gray-700 text-base font-bold">Previous Q#:</span>
                                <input type="text" name="PREVIOUSQ" bind:value={product.PREVIOUSQNUMBER} class="mb-5 mt-1 block w-200 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-black text-lg p-2" />
                            </label>

                            <label class="flex flex-col items-center justify-center space-y-4">
                                <span class="text-gray-700 text-base font-bold">Imposition & Form Information:</span>
                                <textarea name="FORMS" bind:value={product.FORMS} class="mb-5 mt-1 block w-200 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-black text-lg p-2 resize-y"></textarea>
                            </label>

                            <label class="flex flex-col items-center justify-center space-y-4">
                                <span class="text-gray-700 text-base font-bold">Notes:</span>
   <div class="w-200 mb-5 border border-black rounded-lg bg-white">
       <div class="flex items-center justify-between px-3 py-2 border-b border-gray-200">
           <div class="flex flex-wrap items-center divide-gray-200 sm:divide-x sm:rtl:divide-x-reverse">
               <div class="flex items-center space-x-1 rtl:space-x-reverse sm:pe-4">
                   <button type="button" class="p-2 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                       <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 12 20">
                            <path stroke="currentColor" stroke-linejoin="round" stroke-width="2" d="M1 6v8a5 5 0 1 0 10 0V4.5a3.5 3.5 0 1 0-7 0V13a2 2 0 0 0 4 0V6"/>
                        </svg>
                       <span class="sr-only">Attach file</span>
                   </button>
                   <button type="button" class="p-2 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                       <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20">
                            <path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM10.5 6a1.5 1.5 0 1 1 0 2.999A1.5 1.5 0 0 1 10.5 6Zm2.221 10.515a1 1 0 0 1-.858.485h-8a1 1 0 0 1-.9-1.43L5.6 10.039a.978.978 0 0 1 .936-.57 1 1 0 0 1 .9.632l1.181 2.981.541-1a.945.945 0 0 1 .883-.522 1 1 0 0 1 .879.529l1.832 3.438a1 1 0 0 1-.031.988Z"/>
                            <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z"/>
                        </svg>
                       <span class="sr-only">Upload image</span>
                   </button>
                   <button type="button" class="p-2 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                       <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM13.5 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm-7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm3.5 9.5A5.5 5.5 0 0 1 4.6 11h10.81A5.5 5.5 0 0 1 10 15.5Z"/>
                        </svg>
                       <span class="sr-only">Add emoji</span>
                   </button>
               </div>
               <div class="flex flex-wrap items-center space-x-1 rtl:space-x-reverse sm:ps-4">
                   <button type="button" class="p-2 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                       <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 21 18">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.5 3h9.563M9.5 9h9.563M9.5 15h9.563M1.5 13a2 2 0 1 1 3.321 1.5L1.5 17h5m-5-15 2-1v6m-2 0h4"/>
                        </svg>
                       <span class="sr-only">Add list</span>
                   </button>
               </div>
           </div>
           <button type="button" data-tooltip-target="tooltip-fullscreen" class="p-2 text-gray-500 rounded-sm cursor-pointer sm:ms-auto hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
               <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 19 19">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 1h5m0 0v5m0-5-5 5M1.979 6V1H7m0 16.042H1.979V12M18 12v5.042h-5M13 12l5 5M2 1l5 5m0 6-5 5"/>
                </svg>
               <span class="sr-only">Full screen</span>
           </button>
           <div id="tooltip-fullscreen" role="tooltip" class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-black transition-opacity duration-300 bg-white rounded-lg shadow-xs opacity-0 tooltip">
               Show full screen
               <div class="tooltip-arrow" data-popper-arrow></div>
           </div>
       </div>
       <div class="px-4 py-2 bg-white rounded-b-lg">
           
           <textarea id="editor" name="NOTES" bind:value={product.NOTES} rows="8" class="block w-full px-0 text-sm text-black bg-white border-0 focus:ring-0" placeholder="Notes..." required ></textarea>
       </div>
   </div>
</label>

              {#if product.COMPONENTS && product.COMPONENTS.length > 0}
                <div class="md:col-span-1">
                  <h3 class="text-xl font-bold mb-2 text-gray-800">Components:</h3>
                  <ul class="list-disc pl-5 text-base text-gray-700">
                    {#each product.COMPONENTS as component, j}
                      <li>{component.COMPONENT_NAME || `Component ${j + 1}`}</li>
                    {/each}
                  </ul>
                </div>
              {/if}

              <div class="flex justify-end space-x-2 mt-4 md:col-span-2">
                <button type="submit" class="campaignbutton bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200">
                  Add As New Product
                </button>
                <button type="button" on:click={() => removeProductFromCampaign(product._id)} class="campaignbutton bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200">
                  Remove from Campaign
                </button>
              </div>
            </form>
          </details>
        </div>
      {/each}
    </div>
    </div>
  {/if}
</div>

<button class="bg-white rounded-lg p-3 border border-black border-5 mt-5 button-style" on:click={toggleSubmit}>Submit Campaign</button><br>

{#if SubmitForm == true}
  <br>
  <hr class="solid">
  <br>
  <div class="text-lg text-center p-8 bg-white rounded-lg shadow-md mx-auto max-w-auto text-gray-800">
    <h1 class="text-[40px]">CAMPAIGN BREAKDOWN: {CampaignName}</h1><br>
    <select class="border-2 border-gray-400 p-2 rounded-md mb-4" bind:value={selectedView}>
      {#each options as value}
        <option {value}>{value}</option>
      {/each}
    </select>
    <br>

    {#if selectedView == "VIEW AS ESTIMATING SUMMARY"}
      {#each productsInCampaign as product (product._id)}
        <div class="mb-8 p-4 border border-gray-300 rounded-lg text-left bg-gray-50 shadow-sm">
          <h2 class="text-[30px] font-semibold mb-2 text-gray-800">{product.PRODUCT_NAME}</h2>
          <p class="text-[20px] font-semibold text-gray-700">Previous Q#: {product.PREVIOUSQNUMBER || 'N/A'}</p>
          <p class="text-[20px] font-semibold text-gray-700">Description: {product.DESCRIPTION || 'N/A'}</p>
          <p class="text-[20px] font-semibold text-gray-700">Size: {product.SIZE || 'N/A'}</p>
          <p class="text-[20px] font-semibold text-gray-700">Material: {product.MATERIAL || 'N/A'}</p>
          <p class="text-[20px] font-semibold text-gray-700">Sides: {product.SIDES || 'N/A'}</p>
          <p class="text-[20px] font-semibold text-gray-700">Print Type: {product.PRINT_TYPE || 'N/A'}</p>
          <p class="text-[20px] font-semibold text-gray-700">Hardware Information: {product.HARDWARE || 'N/A'}</p>
          <p class="text-[20px] font-semibold text-gray-700">Item Number: {product.ITEM_NUMBER || 'N/A'}</p>
          <p class="text-[20px] font-semibold text-gray-700">Artwork Versions: {product.VERSIONS || 'N/A'}</p>
          <p class="text-[20px] font-semibold text-gray-700">Imposition & Form Information: {product.FORMS || 'N/A'}</p>
          <p class="text-[20px] font-semibold text-gray-700">Notes: {product.NOTES || 'N/A'}</p>

          {#if product.COMPONENTS && product.COMPONENTS.length > 0}
            <h3 class="text-[25px] font-bold mt-4 mb-2 text-gray-800">Components:</h3>
            <ul class="list-disc pl-5 text-[18px] text-gray-700">
              {#each product.COMPONENTS as component, i}
                <li>
                  <strong>Component {i + 1}:</strong> {component.COMPONENT_NAME || 'N/A'}
                  <strong>Component {i + 1}:</strong> {component.COMPONENT_DESCRIPTION || 'N/A'}
                  <strong>Component {i + 1}:</strong> {component.SIZE|| 'N/A'}
                  <strong>Component {i + 1}:</strong> {component.MATERIAL|| 'N/A'}
                  <strong>Component {i + 1}:</strong> {component.SIDES|| 'N/A'}
                  <strong>Component {i + 1}:</strong> {component.PRINT_TYPE || 'N/A'}
                  <strong>Component {i + 1}:</strong> {component.HARDWARE|| 'N/A'}
                </li>
              {/each}
            </ul>
             {:else}
                   <br> COMPONENTS: N/A
          {/if}

          <!-- {#if Ischecked}
            <h3 class="text-[25px] font-bold mt-4 mb-2 text-gray-800">Kitting for {product.PRODUCT_NAME}:</h3>
            {#each kitVersions as kit}
              {#if isProductInKit(kit, product)}
                <p class="ml-4 text-[18px] text-gray-700">
                  **{kit.text || `Kit Version #${kitVersions.indexOf(kit) + 1}`}**: {kit.qty} Kits
                </p>
                {#each kit.products as productInKit}
                  {#if productInKit._id === product._id}
                    <p class="ml-8 text-[18px] text-gray-700">
                      - {productInKit.PRODUCT_NAME}: X {productInKit.quantitypkit || '0'} / KIT
                    </p>
                  {/if}
                {/each}
              {/if}
            {/each}
          {/if} -->
          

          <h3 class="text-[25px] font-bold mt-4 text-gray-800">Total Quantity: {getProductTotalQuantity(product._id) || product.QTY || 'N/A'}</h3>
        </div>
      {/each}
        {#if $isKittingToggled}
      <div class="mb-8 p-4 border border-gray-300 rounded-lg text-left bg-gray-50 shadow-sm">
    {#each kitVersions as kit}
      {#if kit.products && kit.products.length > 0}
        <h3 class="text-[25px] font-bold mt-4 mb-2 text-gray-800">Kitting for **{kit.text || `Kit Version #${kitVersions.indexOf(kit) + 1}`}**:</h3>
        {#each kit.products as productInKit}
          {#if productInKit._id}
            <p class="ml-8 text-[18px] text-gray-700">
              - {productInKit.PRODUCT_NAME}: X {productInKit.quantitypkit || '0'} / KIT
            </p>
          {/if}
        {/each}
      {/if}
    {/each}


      </div>
      {/if}
    {/if}

{#if selectedView == 'VIEW KITTING ONLY'}
  {#if $isKittingToggled}
  <div class="mb-8 p-4 border border-gray-300 rounded-lg text-left bg-gray-50 shadow-sm">
    {#each kitVersions as kit}
      {#if kit.products && kit.products.length > 0}
        <h3 class="text-[25px] font-bold mt-4 mb-2 text-gray-800">Kitting for **{kit.text || `Kit Version #${kitVersions.indexOf(kit) + 1}`}**:</h3>
        {#each kit.products as productInKit}
          {#if productInKit._id}
            <p class="ml-8 text-[18px] text-gray-700">
              - {productInKit.PRODUCT_NAME}: X {productInKit.quantitypkit || '0'} / KIT
            </p>
          {/if}
        {/each}
      {/if}
    {/each}
    </div>
  {/if}
{/if}

    {#if selectedView == "VIEW AS SPREADSHEET"}
      <br>
      <div class="overflow-x-auto">
        <table class="w-full table-auto border-collapse border border-gray-400">
          <thead>
            <tr class="bg-gray-200">
              <th class="border border-gray-300 px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">PRODUCT NAME</th>
              <th class="border border-gray-300 px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">DESCRIPTION</th>
              <th class="border border-gray-300 px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">SIZE</th>
              <th class="border border-gray-300 px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">MATERIAL</th>
              <th class="border border-gray-300 px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">SIDES</th>
              <th class="border border-gray-300 px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">PRINT TYPE</th>
              <th class="border border-gray-300 px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">HARDWARE INFORMATION</th>
              <th class="border border-gray-300 px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ITEM NUMBER</th>
              <th class="border border-gray-300 px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">VERSIONS</th>
              <th class="border border-gray-300 px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">FORMS</th>
              <th class="border border-gray-300 px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">NOTES</th>
              <th class="border border-gray-300 px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">TOTAL QTY</th>
              <th class="border border-gray-300 px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">PREVIOUS Q#</th>
              <th class="border border-gray-300 px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">COMPONENTS</th>
              {#if $isKittingToggled}
    {#each kitVersions as kit}
      {#if kit.products && kit.products.length > 0}
        <th class="border border-gray-300 px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">**{kit.text || `Kit Version #${kitVersions.indexOf(kit) + 1}`}** KIT</th>
      {/if}
    {/each}
  {/if}
            </tr>
          </thead>
          <tbody>
            {#each productsInCampaign as product (product._id)}
              <tr class="bg-white hover:bg-gray-50">
                <td class="border border-gray-300 px-6 py-4 text-sm text-gray-900">{product.PRODUCT_NAME}</td>
                <td class="border border-gray-300 px-6 py-4 text-sm text-gray-700">{product.DESCRIPTION || 'N/A'}</td>
                <td class="border border-gray-300 px-6 py-4 text-sm text-gray-700">{product.SIZE || 'N/A'}</td>
                <td class="border border-gray-300 px-6 py-4 text-sm text-gray-700">{product.MATERIAL || 'N/A'}</td>
                <td class="border border-gray-300 px-6 py-4 text-sm text-gray-700">{product.SIDES || 'N/A'}</td>
                <td class="border border-gray-300 px-6 py-4 text-sm text-gray-700">{product.PRINT_TYPE || 'N/A'}</td>
                <td class="border border-gray-300 px-6 py-4 text-sm text-gray-700">{product.HARDWARE || 'N/A'}</td>
                <td class="border border-gray-300 px-6 py-4 text-sm text-gray-700">{product.ITEM_NUMBER || 'N/A'}</td>
                <td class="border border-gray-300 px-6 py-4 text-sm text-gray-700">{product.VERSIONS || 'N/A'}</td>
                <td class="border border-gray-300 px-6 py-4 text-sm text-gray-700">{product.FORMS || 'N/A'}</td>
                <td class="border border-gray-300 px-6 py-4 text-sm text-gray-700">{product.NOTES || 'N/A'}</td>
                <td class="border border-gray-300 px-6 py-4 text-sm text-gray-700">{getProductTotalQuantity(product._id) || product.QTY || 'N/A'}</td>
                <td class="border border-gray-300 px-6 py-4 text-sm text-gray-700">{product.PREVIOUSQNUMBER|| 'N/A'}</td>
                <td class="border border-gray-300 px-6 py-4 text-sm text-gray-700">
                  {#if product.COMPONENTS && product.COMPONENTS.length > 0}
                    <ul class="list-disc pl-4">
                      {#each product.COMPONENTS as component}
                        <h3>{component.COMPONENT_NAME || 'N/A'}</h3>
                        <li>{component.COMPONENT_DESCRIPTION || 'N/A'}</li>
                         <li>{component.SIZE|| 'N/A'}</li>
                          <li>{component.MATERIAL || 'N/A'}</li>
                           <li>{component.SIDES|| 'N/A'}</li>
                            <li>{component.PRINT_TYPE|| 'N/A'}</li>
                            <li>{component.HARDWARE|| 'N/A'}</li>

                      {/each}
                    </ul>
                    
                  {:else}
                    N/A
                  {/if}

                </td>
                {#if $isKittingToggled}
                  {#each kitVersions as kit}
                    <td class="border border-gray-300 px-6 py-4 text-sm text-gray-700">
                      {#each kit.products as productInKit}
                        {#if productInKit._id === product._id}
                          {Number(kit.qty) || '0'}
                        {/if}
                      {/each}
                    </td>
                  {/each}
                {/if}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      <br>
    {/if}
  </div>
{/if}




<style>
    .myModal {
        display: none;
    }
    .myModalShow {
        display: block;
        position: fixed;
        height: 100%;
        width: 100%;
        color: white;
        background-color: rgba(0, 0, 0, 0.418);
    }

    .header {
        font-family: monospace;
    }

    .campaignbutton {
        border-color: black;
        border-width: 5px;
        padding: 10px;
        background-color: white; 
        font-size: .7em;
        color: black; 
        display: inline-block; 
    }

    .campaignbutton:hover {
        background-color: goldenrod; 
    }

    
    input[type="text"], textarea {
        border: 1px solid #3b6bb3; 
        padding: 0.5rem;
        border-radius: 0.375rem; 
    }
    input[type="text"]:focus, textarea:focus {
        outline: none;
        border-color: #6366f1; 
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.5); 
    }

    .campaignName{
        border: solid;
        width: 1000px;
        height: 50px;
        font-size: large;
        background-color: white;
    }

    .kittingModule{
        background-color: #696969;
        border: 5px;
        border-style: dashed;
        
    }
</style>