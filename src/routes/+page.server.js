export async function load({params, fetch}) {
    const res = await fetch("/api/product");
    const products = await res.json();
    return {products};

}

