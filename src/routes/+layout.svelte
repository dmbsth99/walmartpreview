<script>

	// export const prerender = true;
	export const ssr = false;
	import '../app.css';
		/** @type {import('./$types.js').LayoutProps} */
	let {data, children } = $props();
    let tabs = ["NewProducts", "ExistingProducts", "CampaignBuilder"];
    let selected = tabs[0];
    import { alert, hideAlert } from '$lib/alertStore.js';
    import { fade } from 'svelte/transition';
</script>

<style>
	
.mainHeader{
	font-weight: bolder;
	font-size: 40px;
    color: whitesmoke;
    margin-bottom: 20px;
}


.tablink {
    background-color: goldenrod;
    color: black;
    font-weight:bolder;
    float: left;
    border-width: 5px;
    border: none;
    outline: solid;
    outline-width: 5px;
    cursor: pointer;
    padding: 14px;
    font-size: 30px;
    width: 33.33%;
}

.tablink:hover {
    background-color: white;
}
  .custom-alert-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent overlay */
   
    z-index: 9999; /* Ensure it's on top of everything */
  }

  .custom-alert-content {
    background-color: white;
    padding: 25px 30px;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
 
    text-align: center;
    max-width: 400px;
    max-height: 150px;
    width: 90%;
    transform: translateY(-20px); /* Initial slight lift for fade */
    transition: transform 0.2s ease-out; /* Smooth transition for appearance */
  }


  .custom-alert-content p {
    margin-bottom: 10px;
    font-size: 15px;
    color: #000000;
  }

  .custom-alert-content button {
    background-color: cornflowerblue; /* Default blue for info */
    color: black;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 15px;
    transition: background-color 0.2s ease;
  }

  .custom-alert-content button:hover {
    filter: brightness(0.9);
  }

</style>




<h1 class = "mainHeader">--- WALMART ESTIMATE SUBMISSION TOOL ---</h1>

<nav>
    <a class="tablink" href ="/create/products" on:click={()=>selected = tabs[0]}>NEW PRODUCT BUILDER</a>
    <a class="tablink" href ="../"on:click={()=>selected = tabs[1]}>ALL EXISTING PRODUCTS</a>
    <a class="tablink" href = "/create/campaigns"on:click={()=>selected = tabs[2]}>CAMPAIGN BUILDER</a>

</nav> <br>

{#if $alert.show}
  <div
    class="custom-alert-container"
    transition:fade={{ duration: 200 }}
    class:success={$alert.type === 'success'}
    class:error={$alert.type === 'error'}
    class:info={$alert.type === 'info'}
  >
    <div class="custom-alert-content">
      <p>{$alert.message}</p>
      <button on:click={hideAlert}>OK</button>
    </div>
  </div>
{/if}

<!-- {#if selected === "NewProducts"}

{/if} -->


{@render children()}