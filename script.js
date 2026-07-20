const whatsappNumber = "5492664964989";

const fallbackProducts = [
  {
    name: "Anillo Aurora",
    category: "Anillo",
    price: 45000,
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85",
    isFeatured: true,
  },
  {
    name: "Collar Marfil",
    category: "Collar",
    price: 62000,
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85",
    isFeatured: true,
  },
  {
    name: "Aros Lucia",
    category: "Aros",
    price: 38000,
    image:
      "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=900&q=85",
    isFeatured: true,
  },
  {
    name: "Pulsera Alba",
    category: "Pulsera",
    price: 41000,
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=85",
    isFeatured: true,
  },
  {
    name: "Anillo Serena",
    category: "Anillo",
    price: 58000,
    image:
      "https://images.unsplash.com/photo-1589674781759-c21c37956a44?auto=format&fit=crop&w=900&q=85",
    isFeatured: true,
  },
  {
    name: "Collar Andalucia",
    category: "Collar",
    price: 75000,
    image:
      "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=85",
    isFeatured: true,
  },
];

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
