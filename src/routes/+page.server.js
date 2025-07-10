export async function load({params, fetch}) {
    const res = await fetch("/api/product");
    const res2 = await fetch("/api/components");
    const products = await res.json();
    const components = await res2.json();
    return {products, components};

}

