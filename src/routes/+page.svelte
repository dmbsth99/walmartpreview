<script lang="ts">

  import {showAlert } from '$lib/alertStore.js';
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
    QTY?: number;
    IMAGE_URL?: string | null;// Add this if you use 'imageUrl' directly from the data, even if it's derived from IMAGE_URL

  COMPONENTS?: { // Matches the structure you send to the backend for components
      COMPONENT_NAME: string;
      COMPONENT_DESCRIPTION?: string;
      SIZE?: string;
      MATERIAL?: string;
      SIDES?: string;
      PRINT_TYPE?: string;
      HARDWARE?: string;
      ITEM_NUMBER?: string;
    }[];
  }
  

/** @type {{ data: import('./$types.js').PageData, form: import('./$types.js').ActionData }} */
    let { data, form } = $props();
    let inputName = $state("");
    let inputSize = $state("");
    let inputMaterial = $state("");
    let inputSides = $state("");
    let inputType = $state("");
    let inputHardware = $state("");
    let inputItemNum = $state("");
    

    let search =$state("");
    let filtered: Product[] = $state(data.products);
    let productCounter = $state(0);

    let avatar: string | null = $state(null);
  let isLoadingUpload: boolean = $state(false); // Make sure this is also typed

  // Event handler for the file input's change event
  // FIX 1: Explicitly type 'event' and 'productId'
  const onFileSelected = async (event: Event, productId: string) => {
    const inputElement = event.target as HTMLInputElement;

    if (inputElement.files && inputElement.files.length > 0) {
      const imageFile = inputElement.files[0];

      isLoadingUpload = true;
      try {
        const formData = new FormData();
        formData.append('imageFile', imageFile);
        formData.append('productId', productId);

        const response = await fetch('/api/upload/product_images', { // Assuming +server.js for now
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result: { success: boolean; imageUrl?: string; message?: string } = await response.json(); // FIX 2: Type 'result'
          if (result.success && result.imageUrl) {
            const productToUpdate = data.products.find((p: any) => p._id === productId); // FIX 3: Type 'p' in find callback
            if (productToUpdate) {
              productToUpdate.IMAGE_URL = result.imageUrl;
              // Svelte 5 with $props should handle reactivity here for array elements
              // If not, you might need to force a re-render for nested reactivity:
              // data.products = [...data.products];
              console.log(`Image uploaded for product ${productId}:`, result.imageUrl);
            } else {
              console.warn(`Product with ID ${productId} not found after upload.`);
            }
          } else {
            console.error('Server reported upload failure:', result.message);
          }
        } else {
          console.error('Failed to upload image:', response.statusText);
        }
      } catch (error: unknown) { // FIX 4: Type 'error' in catch block
        console.error('Error during image upload:', error);
      } finally {
        isLoadingUpload = false;
      }

    } else {
      console.warn("No file selected.");
    }
  };


import { campaignProducts } from '$lib/stores.js'; // Import the shared store
    import { goto } from '$app/navigation'; // Import SvelteKit's navigation function
       import { get } from 'svelte/store';
       import {searchStore} from '$lib/stores.js';

  $effect(() => {
    // Ensure data.products is not null/undefined before attempting to filter
    if (data.products) {
      if (!search) {
        filtered = data.products; // If search is empty, show all products
      } else {
        const lowerCaseSearch = search.toLowerCase();
        filtered = data.products.filter((product: Product) => { // Type 'product' correctly
          // You can customize which fields you want to search through
          return (
            product.PRODUCT_NAME.toLowerCase().includes(lowerCaseSearch) ||
            (product.DESCRIPTION && product.DESCRIPTION.toLowerCase().includes(lowerCaseSearch)) ||
            (product.SIZE && product.SIZE.toLowerCase().includes(lowerCaseSearch)) ||
            (product.MATERIAL && product.MATERIAL.toLowerCase().includes(lowerCaseSearch))
            // Add more fields as needed
          );
        });
      }
    } else {
      // If data.products is not available yet, initialize filtered to an empty array
      filtered = [];
    }
  });



    async function addProductToCampaign(product: any) {
        // Get the current products in the campaign synchronously
        const currentCampaignItems = get(campaignProducts);

        // Check if a product with the same original _id is already in the campaign list
        if (currentCampaignItems.find(p => p._id === product._id)) {
            console.log("Product already in campaign (client-side check).");
          showAlert("Product successfully added to campaign!");
            return;
        }

        // Add a copy of the product to the in-memory store.
        // The `add` method in stores.js will generate a new UUID for this entry in the campaign list.
        await campaignProducts.add(product);
        console.log("Product added to campaign in-memory store.");
        showAlert("Product successfully added to campaign!");

        if(currentCampaignItems.length >= 0){
          productCounter = currentCampaignItems.length + 1;
        }
    }



</script>

<div class="mt-5 h-auto bg-[#6495ed] p-4 font-inter antialiased rounded-lg border-5">
<h1 class = "header text-[30px] font-bold">PRODUCT CATALOGUE</h1>
<a class= "create rounded-lg" href="/create/products">Create Product</a> <br>


<input class="searchbar rounded-lg" type="text" name="search" bind:value={search} placeholder="Search All Products..." />
{#if productCounter !=0}
<div>
  <p class = "text-[25px] mt-2 font-bold">X {productCounter} - Products in Campaign</p>
</div>
{/if}

<br>


{#each filtered as product (product._id)}
<div class="ProdName inline-block">
<div class="rounded-lg text-[30px] border-5 border-black h-fit bg-[#daa520] text-black py-7 m-4 grid-flow-row justify-items-right pointer-events-auto cursor-pointer select-none inline-block w-200" >
    <h1 class = "Pname">{product.PRODUCT_NAME}</h1>
{#if product.IMAGE_URL} <img src={product.IMAGE_URL} alt="Product Image" style="max-width: 200px; max-height: 200px;" />
        {:else}
          <p class="text-[15px]">No image available.</p>
        {/if}

    <details>
      <summary class ="text-[20px]">DETAILS
      </summary> 

      <div class="p-4 sm:p-6 bg-white border-t border-gray-200 text-[20px]">
        <p class="text-black mb-3 text-base">
          <strong class="text-gray-800">Description:</strong> {product.DESCRIPTION || 'N/A'}
        </p>
        <p class="text-black mb-3 text-base">
          <strong class="text-gray-800">Size:</strong> {product.SIZE || 'N/A'}
        </p>
        <p class="text-black mb-3 text-base">
          <strong class="text-gray-800">Material:</strong> {product.MATERIAL || 'N/A'}
        </p>
        <p class="text-black mb-3 text-base">
          <strong class="text-gray-800">Sides:</strong> {product.SIDES || 'N/A'}
        </p>
        <p class="text-black mb-3 text-base">
          <strong class="text-gray-800">Print Type:</strong> {product.PRINT_TYPE || 'N/A'}
        </p>
        <p class="text-black mb-3 text-base">
          <strong class="text-gray-800">Hardware:</strong> {product.HARDWARE || 'N/A'}
        </p>
        <p class="text-black mb-3 text-base">
          <strong class="text-gray-800">Item Number:</strong> {product.ITEM_NUMBER || 'N/A'}
        </p>

            {#if product.COMPONENTS && product.COMPONENTS.length > 0}
              <hr class="dashed my-4">
              <h3 class="text-xl font-semibold mb-3 text-gray-800">Components:</h3>
              <ul class="list-disc pl-5">
                {#each product.COMPONENTS as component, i}
                  <li class="text-black mb-1 text-base">
                    <strong>Component {i + 1}:</strong> {component.COMPONENT_NAME || 'N/A'}
                  </li>
                {/each}
              </ul>
            {/if}

            <hr class = "dashed">
            <br>
        <label class = "text-[15px] border-5 p-4 hover:bg-[#6495ed]"> Upload a Photo
        <input style = "display:none" type="file" on:change={(e) => onFileSelected(e, product._id)} accept="image/*" />
        </label>
      </div>
    </details> <br>

<a class = "campaignbutton rounded-lg" on:click|preventDefault={() => addProductToCampaign(product)}>
    ADD TO CAMPAIGN</a>
 
</div>
</div>

{/each}

</div>

 
<style>


.create{
   border-color: black;
   border-width: 5px; 
   padding: 10px;
   background-color: white;
   width: 400px;
   font-size: 30px;
   text-align: center;
   color: black;
   display: inline-block;
   margin: 5px;
}

.create:hover{
  background-color: black;
  color: white;
}

.campaignbutton{
    border-color: black;
   border-width: 5px; 
   padding: 10px;
   background-color: white;
   vertical-align: middle;
   font-size: .7em;
   color: black;
}

.campaignbutton:hover{
   background-color: cornflowerblue;
}

.searchbar{
    border: 5px;
    border-style: solid;
    padding: 5px;
    width: 1000px;
    height: 50px;
    font-size: large;
    cursor:text;
    background-color: white;
}

  img {
    border: 1px solid #ddd;
    padding: 5px;
    margin-top: 10px;
  }
</style>