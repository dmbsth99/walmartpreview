<script lang="ts">
  import { goto } from '$app/navigation';

  interface SimpleProduct {
    id: string; // Unique identifier for reactivity in #each blocks (client-side only)
    PRODUCT_NAME: string;
    DESCRIPTION?: string;
    SIZE?: string;
    MATERIAL?: string;
    SIDES?: string;
    PRINT_TYPE?: string;
    HARDWARE?: string;
    ITEM_NUMBER?: string;
    IMAGE_URL?: string; // Assuming 'imageUrl' in your template corresponds to IMAGE_URL
    // Add any other properties your product objects might have
    imageUrl?: string;
    NOTES?: string;
  }

  interface Component {
    id: string; // Unique identifier for reactivity in #each blocks (client-side only)
    COMPONENT_NAME: string;
    COMPONENT_DESCRIPTION?: string;
    SIZE?: string;
    MATERIAL?: string;
    SIDES?: string;
    PRINT_TYPE?: string;
    HARDWARE?: string;
    NOTES?: string;
  }

  /** @type {{ data: import('./$types.js').PageData, form: import('./$types.js').ActionData }} */
  let { data, form } = $props();

  // State variables for product type selection
  let isSimpleProduct = $state(false);
  let isMultiComponentProduct = $state(false);

  // State for simple product inputs
  let simpleProductName = $state("");
  let simpleProductDescription = $state("");
  let simpleProductSize = $state("");
  let simpleProductMaterial = $state("");
  let simpleProductSides = $state("");
  let simpleProductType = $state("");
  let simpleProductHardware = $state("");
  let simpleProductNotes= $state("");
  
let overallname = $state("");
       let overalldescription = $state("");
    let multicompName = $state("");
  let multicompDescription = $state("");
  let multicompSize = $state("");
  let multicompMaterial = $state("");
  let multicompSides = $state("");
  let multicompType = $state("");
  let multicompHardware = $state("");
  let multicompNotes= $state("");

  let components: Component[] = $state([]); // Array to hold individual component data

  // State for message box
  let showMessage = $state(false);
  let messageText = $state("");

  // Handler for product type checkboxes
  $effect(() => {
    if (isSimpleProduct && isMultiComponentProduct) {
      // If both are checked, prioritize simple and uncheck multi-component
      isMultiComponentProduct = false;
    } else if (isMultiComponentProduct && isSimpleProduct) {
      // If both are checked, prioritize multi-component and uncheck simple
      isSimpleProduct = false;
    }
  });


  // Function to add a new component form
  function addComponent() {
    components.push({
      id: crypto.randomUUID(), // Generate a unique ID for each component
      COMPONENT_NAME: "",
      COMPONENT_DESCRIPTION: "",
      SIZE: "",
      MATERIAL: "",
      SIDES: "",
      PRINT_TYPE: "",
      HARDWARE: "",
      NOTES: "",
    });
  }


    //   let { data, form } = $props();
    // let inputName = $state("");
    // let inputSize = $state("");
    // let inputMaterial = $state("");
    // let inputSides = $state("");
    // let inputType = $state("");
    // let inputHardware = $state("");
    // let inputItemNum = $state("");
    // // console.log(data)

    // async function add() {
    //     await fetch("/api/product", {
    //         method: "POST",
    //         body: JSON.stringify({
    //             PRODUCT_NAME: inputName,
    //             SIZE: inputSize,
    //             MATERIAL: inputMaterial,
    //             SIDES: inputSides,
    //             PRINT_TYPE: inputType,
    //             HARDWARE: inputHardware,
    //             ITEM_NUMBER: inputItemNum,
    //         }),
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //     });
    // }

  // Function to remove a component form
  function removeComponent(idToRemove: string) {
    components = components.filter(c => c.id !== idToRemove);
  }

  // Function to display a message
  function displayMessage(message: string) {
    messageText = message;
    showMessage = true;
    setTimeout(() => {
      showMessage = false;
      messageText = "";
    }, 3000); // Message disappears after 3 seconds
  }
  async function addProduct() {
  let endpointproduct = "/api/product"; // Assuming a generic product API
  let endpointcomponents = "/api/components";

  if (isSimpleProduct) {
    console.log("simple product");
    await fetch(endpointproduct, { // Corrected: Added ',' instead of ')' before the options object
      method: "POST",
      headers: { // Important: Add Content-Type header for JSON
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        PRODUCT_NAME: simpleProductName,
        DESCRIPTION: simpleProductDescription,
        SIZE: simpleProductSize,
        MATERIAL: simpleProductMaterial,
        SIDES: simpleProductSides,
        PRINT_TYPE: simpleProductType,
        HARDWARE: simpleProductHardware,
        NOTES: simpleProductNotes,
      }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Or .text() if your API doesn't return JSON
    })
    .then(data => {
        console.log("Simple product added successfully:", data);
        // You might want to update UI or state here
    })
    .catch(error => {
        console.error("Error adding simple product:", error);
        // Handle error, e.g., show an error message to the user
    });
  }

  if (isMultiComponentProduct) {
    console.log("multi product");
    await fetch(endpointcomponents, { // Corrected: Added ',' instead of ')' before the options object
      method: "POST",
      headers: { // Important: Add Content-Type header for JSON
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        OVERALLNAME: overallname,
        OVERALLDESCRIPTION: overalldescription,
    COMPONENTNAME: multicompName,
    COMPONENTDESCRIPTION: multicompDescription,
    SIZE: multicompSize,
    MATERIAL: multicompMaterial,
    SIDES: multicompSides,
    PRINT_TYPE:multicompType,
    HARDWARE: multicompHardware,
    NOTES: multicompNotes,
        })
  })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Or .text()
    })
    .then(data => {
        console.log("Multi-component product added successfully:", data);
        // Update UI or state
    })
    .catch(error => {
        console.error("Error adding multi-component product:", error);
        // Handle error
    });
  }
}

</script>

<div class="mt-5 p-4 font-inter antialiased bg-[#6495ed] h-auto rounded-lg border-5">
  <h1 class ="text-[30px] font-bold">NEW PRODUCT BUILDER</h1>

  <!-- Type Selection -->
  <div class="bg-white p-6 rounded-lg shadow-md mb-8 max-w-2xl mx-auto border-black border-4">
    <h2 class="text-2xl font-semibold mb-4 text-black">Choose Product Type:</h2>
    <div class="flex flex-col sm:flex-row gap-4">
      <label class="flex items-center space-x-2 text-lg text-black">
        <input type="checkbox" bind:checked={isSimpleProduct} class="form-checkbox h-5 w-5 text-blue-600 rounded" />
        <span>Simple Product</span>
      </label>
      <label class="flex items-center space-x-2 text-lg text-black">
        <input type="checkbox" bind:checked={isMultiComponentProduct} class="form-checkbox h-5 w-5 text-blue-600 rounded" />
        <span>Multi-Component Product</span>
      </label>
    </div>
  </div>

  {#if isSimpleProduct}
    <div class="newProducts bg-[#daa520] p-8 rounded-lg shadow-md max-w-4xl mx-auto border-black border-4">
      <h2 class="text-2xl font-semibold mb-6 text-black">Simple Product Details</h2>
              <label class="block">
          <span class="text-black text-[20px]">PRODUCT NAME:</span>
          <input type="text" autocomplete="off" bind:value={simpleProductName} class="form-input-style mt-1 block w-full text-lg p-2" />
        </label>
      <form class="grid grid-cols-1 md:grid-cols-2 gap-6" on:submit|preventDefault={addProduct}>
        <label class="block">
          <span class="text-black text-[20px]">SIZE:</span>
          <input type="text" autocomplete="off" bind:value={simpleProductSize} class="form-input-style mt-1 block w-full text-lg p-2" />
        </label>
        <label class="block">
          <span class="text-black text-[20px]">MATERIAL:</span>
          <input type="text" autocomplete="off" bind:value={simpleProductMaterial} class="form-input-style mt-1 block w-full text-lg p-2" />
        </label>
        <label class="block">
          <span class="text-black text-[20px]">SIDES:</span>
          <input type="text" autocomplete="off" bind:value={simpleProductSides} class="form-input-style mt-1 block w-full text-lg p-2" />
        </label>
        <label class="block">
          <span class="text-black text-[20px]">LITHO OR DIGITAL:</span>
          <input type="text" autocomplete="off" bind:value={simpleProductType} class="form-input-style mt-1 block w-full text-lg p-2" />
        </label>
        <label class="block md:col-span-2">
          <span class="text-black text-[20px]">HARDWARE INFORMATION:</span>
          <textarea autocomplete="off" bind:value={simpleProductHardware} class="form-input-style mt-1 block w-full text-lg p-2 h-24"></textarea>
        </label>
      </form>
      <label class="block">
                                <span class="text-black text-[20px]">NOTES:</span>
   <div class="w-full mb-4 border border-black rounded-lg bg-white border-5">
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
           
           <textarea id="editor" name="NOTES" bind:value={simpleProductNotes} rows="8" class="block w-full px-0 text-sm text-black bg-white border-0 focus:ring-0" placeholder="Notes..." required ></textarea>
       </div>
   </div>
</label>
      <button type="submit" on:click = {addProduct} class="form-button-base-style form-button-hover-black text-hover-white mt-6 px-6 py-3 font-semibold rounded-md shadow-md transition-colors duration-200">
          SUBMIT NEW PRODUCT
        </button>
    </div>
  {/if}

  {#if isMultiComponentProduct}
    <div class="newProducts bg-[#daa520] p-8 rounded-lg shadow-md max-w-4xl mx-auto border-black border-4">
      <h2 class="text-2xl font-semibold mb-6 text-black">Multi-Component Product Details</h2>
      <form class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" on:submit|preventDefault={addProduct}>
        <label class="block md:col-span-2">
          <span class="text-black text-[20px]">OVERALL PRODUCT NAME:</span>
          <input type="text" autocomplete="off" bind:value={overallname} class="form-input-style mt-1 block w-full text-lg p-2" />
        </label>
        <label class="block md:col-span-2">
          <span class="text-black text-[20px]">OVERALL PRODUCT DESCRIPTION:</span>
          <textarea autocomplete="off" bind:value={overalldescription} class="form-input-style mt-1 block w-full text-lg p-2 h-24"></textarea>
        </label>

        <div class="md:col-span-2 mt-4">
          <h3 class="font-medium mb-4 text-black text-[20px]">COMPONENTS:</h3>
          {#each components as component (component.id)}
            <div class=" rounded-md p-4 mb-4 bg-white">
              <div class="flex justify-between items-center mb-4">
                <h4 class="font-semibold text-black text-[20px]">Component {components.indexOf(component) + 1}</h4>
                <button type="button" on:click={() => removeComponent(component.id)} class="component-button-style text-red-600 hover:text-red-800 font-semibold text-sm border-4">
                  Remove Component
                </button>
              </div>
                              <label class="block">
                  <span class="text-black text-[20px]">COMPONENT NAME:</span>
                  <input type="text" autocomplete="off" bind:value={component.COMPONENT_NAME} class="form-input-style mt-1 block w-full text-base p-1.5" />
                </label>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

                <label class="block md:col-span-2">
                  <span class="text-black text-[20px]">COMPONENT DESCRIPTION:</span>
                  <textarea autocomplete="off" bind:value={component.COMPONENT_DESCRIPTION} class="form-input-style mt-1 block w-full text-base p-1.5 h-20"></textarea>
                </label>
                <label class="block">
                  <span class="text-black text-[20px]">SIZE:</span>
                  <input type="text" autocomplete="off" bind:value={component.SIZE} class="form-input-style mt-1 block w-full text-base p-1.5" />
                </label>
                <label class="block">
                  <span class="text-black text-[20px]">MATERIAL:</span>
                  <input type="text" autocomplete="off" bind:value={component.MATERIAL} class="form-input-style mt-1 block w-full text-base p-1.5" />
                </label>
                <label class="block">
                  <span class="text-black text-[20px]">SIDES:</span>
                  <input type="text" autocomplete="off" bind:value={component.SIDES} class="form-input-style mt-1 block w-full text-base p-1.5" />
                </label>
                <label class="block">
                  <span class="text-black text-[20px]">PRINT TYPE:</span>
                  <input type="text" autocomplete="off" bind:value={component.PRINT_TYPE} class="form-input-style mt-1 block w-full text-base p-1.5" />
                </label>
                <label class="block md:col-span-2">
                  <span class="text-black text-[20px]">HARDWARE INFORMATION:</span>
                  <textarea autocomplete="off" bind:value={component.HARDWARE} class="form-input-style mt-1 block w-full text-base p-1.5 h-20"></textarea>
                </label>
              </div>
              <label class="block">
                                <span class="text-black text-[20px]">NOTES:</span>
   <div class="w-full mb-4 border border-black rounded-lg bg-white border-5">
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
           
           <textarea id="editor" name="NOTES" bind:value={component.NOTES} rows="8" class="block w-full px-0 text-sm text-black bg-white border-0 focus:ring-0" placeholder="Notes..." required ></textarea>
       </div>
   </div>
</label>
            </div>
          {/each}
          <button type="button" on:click={addComponent} class="form-button-base-style form-button-hover-black mt-4 px-6 py-3 font-semibold rounded-md shadow-md transition-colors duration-200">
            ADD NEW COMPONENT
          </button>
        </div>
        <button type="submit" class="form-button-base-style form-button-hover-goldenrod mt-6 px-6 py-3 font-semibold rounded-md shadow-md transition-colors duration-200 md:col-span-2">
          SUBMIT NEW PRODUCT
        </button>
      </form>
    </div>
  {/if}
</div>

<style>
  /* Base input style */
  .form-input-style {
    background-color: white;
    border-radius: 10px;
    border-style: solid;
    border-color: black;
    border-width: 5px;
    /* Tailwind classes like w-full, p-2, text-lg are applied directly in HTML */
    /* Remove conflicting Tailwind classes from HTML (e.g., border-gray-300 shadow-sm) */
  }

  /* Base button style */
  .form-button-base-style {
    border-color: black;
    border-width: 5px;
    background-color: white;
    color: black;
    text-align: center;
    border-radius: 10px;
    font-size: large;
    /* Tailwind classes like px-6, py-3, font-semibold, rounded-md, shadow-md, transition-colors, duration-200 are applied directly in HTML */
  }

  /* Hover effect for buttons that turn black */
  .form-button-hover-black:hover {
    background-color: black;
    color: white;
  }

  /* Hover effect for buttons that turn goldenrod */
  .form-button-hover-goldenrod:hover {
    background-color: #6495ed; /* goldenrod */
    color: black; /* Ensure text is visible */
  }

  /* Specific styles for component add/remove buttons */
  .component-button-style {
    border-color: black;
    border-width: 3px; /* Slightly thinner border for smaller buttons */
    padding: 8px 12px; /* Smaller padding */
    background-color: rgb(192, 111, 111);
    color: black;
    border-radius: 8px;
    font-size: 0.9em;
    transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
    font-size: medium;
  }

  .component-button-style:hover {
    background-color: red; /* Lighter hover for component buttons */
  }

  /* Add basic fade-in-up animation for message box */
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in-up {
    animation: fade-in-up 0.3s ease-out forwards;
  }
</style>
