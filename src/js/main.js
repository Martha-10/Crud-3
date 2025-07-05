import '../scss/styles.scss';
import { alertError, alertSucces } from './alerts';

const $form = document.getElementById("form");
const urlEnpoint = "http://localhost:3000/products";

// Show products when the page loads
seeData();

// get products from the server
async function getData() {
  const response = await fetch(urlEnpoint);
  return await response.json();
}

// Render products to the DOM
function renderProducts(products) {
  const $list = document.querySelector(".product-list");
  $list.innerHTML = "";

  for (let product of products) {
    const card = document.createElement("div");
    card.classList.add("product-card");

    card.innerHTML = `
      <h3 class="product-name">${product.name}</h3>
      <p class="product-id"><strong>ID:</strong> ${product.id}</p>
      <p class="product-price"><strong>Price:</strong> $${product.price}</p>
      <div class="button-group">
        <button class="btn edit-button">Edit</button>
        <button class="btn delete-button">Delete</button>
      </div>
    `;

    // edit product
    card.querySelector(".edit-button").addEventListener("click", () => {
      const input = prompt("Enter new price:");
      if (input === null) return;

      const newPrice = parseFloat(input);
      if (isNaN(newPrice) || newPrice <= 0) {
        alertError("Invalid price");
        return;
      }

      updateProductPrice(product.id, newPrice);
    });

    // delete product
    card.querySelector(".delete-button").addEventListener("click", () => {
      if (confirm("Are you sure you want to delete this product?")) {
        deleteProduct(product.id);
      }
    });

    $list.appendChild(card);
  }
}

// see products in the screen
async function seeData() {
  try {
    const products = await getData();
    renderProducts(products);
  } catch {
    alertError("Couldn't load products");
  }
}

// create new product
$form.addEventListener("submit", (e) => {
  e.preventDefault();
  createProduct();
});

async function createProduct() {
  const id = parseInt(document.getElementById("ID_product").value.trim());
  const name = document.getElementById("name_product").value.trim().toLowerCase();
  const price = parseFloat(document.getElementById("price_product").value.trim());

  const products = await getData();

  if (products.find(p => p.name.toLowerCase() === name)) {
    return alertError("Product name already exists!");
  }

  if (products.find(p => p.id === id)) {
    return alertError("Product ID already exists!");
  }

  if (isNaN(id) || id <= 0 || isNaN(price) || price <= 0) {
    return alertError("Invalid ID or Price");
  }

  const newProduct = { id, name, price };

  try {
    const response = await fetch(urlEnpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    });

    if (!response.ok) throw new Error();

    alertSucces("Product saved!");
    $form.reset();
    seeData();
  } catch {
    alertError("Server is slow, please wait");
  }
}

// Update product price
async function updateProductPrice(id, newPrice) {
  const url = `${urlEnpoint}/${id}`;

  try {
    const product = await fetch(url).then(res => res.json());
    const updated = { ...product, price: newPrice };

    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });

    if (!res.ok) throw new Error();

    alertSucces("Product updated!");
    seeData();
  } catch {
    alertError("Error updating product");
  }
}

// Delete product
async function deleteProduct(id) {
  try {
    const res = await fetch(`${urlEnpoint}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    alertSucces("Product deleted!");
    seeData();
  } catch {
    alertError("Error deleting product");
  }
}
