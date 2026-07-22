const whatsappNumber = "5492664964989";

const fallbackProducts = [];
const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

function createWhatsappLink(message) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function normalizeProduct(product) {
  return {
    name: product.name,
    category: product.category?.name || product.category || "Joyeria",
    price: Number(product.price || 0),
    image: product.imageUrl || product.image,
    imageAlt: product.imageAlt || product.name,
    description: product.description || "Pieza seleccionada de Andalucia Joyeria.",
  };
}

function renderProducts(products) {
  const productGrid = document.querySelector("#productGrid");

  if (!products.length) {
    productGrid.innerHTML = `
      <div class="empty-state">
        <h3>No hay productos publicados</h3>
        <p>Pronto vas a poder ver nuevas piezas de Andalucia.</p>
      </div>
    `;
    return;
  }

  productGrid.innerHTML = products
    .map(normalizeProduct)
    .map((product) => {
      const message = `Hola, me interesa ${product.name} de Andalucia. Precio: ${currencyFormatter.format(
        product.price
      )}.`;

      return `
        <article class="product-card">
          <img src="${product.image}" alt="${product.imageAlt}" loading="lazy" />
          <div class="product-info">
            <div class="product-meta">
              <span>${product.category}</span>
              <span class="price">${currencyFormatter.format(product.price)}</span>
            </div>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <a class="button" href="${createWhatsappLink(message)}" target="_blank" rel="noopener">
              Consultar
            </a>
          </div>
        </article>
      `;
    })
    .join("");
}

async function loadProducts() {
  try {
    const response = await fetch("/api/products");

    if (!response.ok) {
      throw new Error("No se pudieron cargar los productos");
    }

    const products = await response.json();
    renderProducts(products.length ? products : fallbackProducts);
  } catch (error) {
    console.warn(error.message);
    renderProducts(fallbackProducts);
  }
}

function setWhatsappLinks() {
  const generalMessage =
    "Hola, quiero hacer una consulta sobre las joyas de Andalucia.";
  const generalLink = createWhatsappLink(generalMessage);

  document.querySelector("#heroWhatsapp").href = generalLink;
  document.querySelector("#heroWhatsapp").target = "_blank";
  document.querySelector("#heroWhatsapp").rel = "noopener";
  document.querySelector("#footerWhatsapp").href = generalLink;
}

loadProducts();
setWhatsappLinks();
