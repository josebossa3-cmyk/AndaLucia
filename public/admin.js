const tokenKey = "andaluciaAdminToken";
const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

let products = [];
let categories = [];

const elements = {
  loginView: document.querySelector("#loginView"),
  dashboardView: document.querySelector("#dashboardView"),
  loginForm: document.querySelector("#loginForm"),
  loginError: document.querySelector("#loginError"),
  logoutButton: document.querySelector("#logoutButton"),
  adminMessage: document.querySelector("#adminMessage"),
  productForm: document.querySelector("#productForm"),
  productFormTitle: document.querySelector("#productFormTitle"),
  productTable: document.querySelector("#productTable"),
  productCategory: document.querySelector("#productCategory"),
  categoryForm: document.querySelector("#categoryForm"),
  categoryList: document.querySelector("#categoryList"),
  refreshButton: document.querySelector("#refreshButton"),
  cancelEditButton: document.querySelector("#cancelEditButton"),
};

function getToken() {
  return localStorage.getItem(tokenKey);
}

function setToken(token) {
  localStorage.setItem(tokenKey, token);
}

function clearToken() {
  localStorage.removeItem(tokenKey);
}

function showMessage(message, type = "success") {
  elements.adminMessage.className = `alert alert-${type}`;
  elements.adminMessage.textContent = message;
  elements.adminMessage.classList.remove("d-none");
  window.setTimeout(() => elements.adminMessage.classList.add("d-none"), 3500);
}

function showLoginError(message) {
  elements.loginError.textContent = message;
  elements.loginError.classList.remove("d-none");
}

async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(path, { ...options, headers });

  if (response.status === 401) {
    clearToken();
    showLogin();
    throw new Error("Sesion expirada. Volve a ingresar.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Ocurrio un error");
  }

  return data;
}

function showLogin() {
  elements.loginView.classList.remove("d-none");
  elements.dashboardView.classList.add("d-none");
}

function showDashboard() {
  elements.loginView.classList.add("d-none");
  elements.dashboardView.classList.remove("d-none");
}

function renderCategories() {
  if (!categories.length) {
    elements.productCategory.innerHTML = `<option value="">-- Crea una categoria primero --</option>`;
    elements.categoryList.innerHTML = `<div class="list-group-item text-muted text-center py-3">Todavia no hay categorias. Crea una arriba.</div>`;
    return;
  }

  elements.productCategory.innerHTML = `<option value="">Seleccionar categoria</option>`
    + categories
      .map((category) => `<option value="${category.id}">${category.name}</option>`)
      .join("");

  elements.categoryList.innerHTML = categories
    .map(
      (category) => `
        <div class="list-group-item d-flex align-items-center justify-content-between">
          <span>${category.name}</span>
          <button class="btn btn-outline-danger btn-sm" data-category-delete="${category.id}" type="button">Desactivar</button>
        </div>
      `
    )
    .join("");
}

function renderProducts() {
  if (!products.length) {
    elements.productTable.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No hay productos cargados.</td></tr>`;
    return;
  }

  elements.productTable.innerHTML = products
    .map((product) => {
      const image = product.imageUrl
        ? `<img class="product-thumb" src="${product.imageUrl}" alt="${product.imageAlt || product.name}" />`
        : `<div class="product-thumb empty-thumb">Sin imagen</div>`;
      const status = product.isActive ? "Activo" : "Inactivo";

      return `
        <tr>
          <td>${image}</td>
          <td>
            <strong>${product.name}</strong>
            <div class="text-muted small">${product.category?.name || "Sin categoria"}${product.isFeatured ? " · Destacado" : ""}</div>
          </td>
          <td>${currencyFormatter.format(Number(product.price || 0))}</td>
          <td><span class="badge text-bg-${product.isActive ? "success" : "secondary"}">${status}</span></td>
          <td class="text-end">
            <button class="btn btn-outline-dark btn-sm" data-product-edit="${product.id}" type="button">Editar</button>
            <button class="btn btn-outline-danger btn-sm" data-product-delete="${product.id}" type="button">Desactivar</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function loadAdminData() {
  const [loadedCategories, loadedProducts] = await Promise.all([
    apiRequest("/api/admin/categories"),
    apiRequest("/api/admin/products"),
  ]);

  categories = loadedCategories;
  products = loadedProducts;
  renderCategories();
  renderProducts();
}

function setLoading(isLoading) {
  const btn = elements.productForm.querySelector('button[type="submit"]');
  if (!btn) return;
  btn.disabled = isLoading;
  btn.innerHTML = isLoading
    ? '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Guardando...'
    : "Guardar";
}

function showImagePreview(url) {
  const preview = document.querySelector("#imagePreview");
  if (url) {
    preview.src = url;
    preview.classList.remove("d-none");
  } else {
    preview.classList.add("d-none");
    preview.src = "";
  }
}

function resetProductForm() {
  elements.productForm.reset();
  document.querySelector("#productId").value = "";
  document.querySelector("#productActive").checked = true;
  elements.productFormTitle.textContent = "Nuevo producto";
  showImagePreview(null);
}

function fillProductForm(product) {
  document.querySelector("#productId").value = product.id;
  document.querySelector("#productName").value = product.name || "";
  document.querySelector("#productDescription").value = product.description || "";
  document.querySelector("#productPrice").value = product.price || 0;
  document.querySelector("#productStock").value = product.stock || 0;
  document.querySelector("#productMaterial").value = product.material || "";
  document.querySelector("#productCategory").value = product.categoryId || "";
  document.querySelector("#productImageAlt").value = product.imageAlt || product.name || "";
  document.querySelector("#productFeatured").checked = Boolean(product.isFeatured);
  document.querySelector("#productActive").checked = Boolean(product.isActive);
  elements.productFormTitle.textContent = `Editar ${product.name}`;
  showImagePreview(product.imageUrl || null);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function uploadProductImage(productId) {
  const imageInput = document.querySelector("#productImage");
  const file = imageInput.files[0];

  if (!file) {
    return;
  }

  const formData = new FormData();
  formData.append("image", file);
  formData.append("productId", productId);
  formData.append("imageAlt", document.querySelector("#productImageAlt").value.trim());

  await apiRequest("/api/admin/uploads", {
    method: "POST",
    body: formData,
  });
}

elements.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  elements.loginError.classList.add("d-none");

  try {
    const data = await apiRequest("/api/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: document.querySelector("#loginEmail").value.trim(),
        password: document.querySelector("#loginPassword").value,
      }),
    });

    setToken(data.token);
    showDashboard();
    await loadAdminData();
  } catch (error) {
    showLoginError(error.message);
  }
});

elements.logoutButton.addEventListener("click", () => {
  clearToken();
  showLogin();
});

elements.refreshButton.addEventListener("click", async () => {
  await loadAdminData();
  showMessage("Datos actualizados.");
});

elements.cancelEditButton.addEventListener("click", resetProductForm);

elements.productForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const categoryValue = document.querySelector("#productCategory").value;
  if (!categoryValue) {
    showMessage("Crea al menos una categoria antes de guardar un producto.", "warning");
    return;
  }

  const id = document.querySelector("#productId").value;
  const payload = {
    name: document.querySelector("#productName").value.trim(),
    description: document.querySelector("#productDescription").value.trim(),
    price: Number(document.querySelector("#productPrice").value || 0),
    stock: Number(document.querySelector("#productStock").value || 0),
    material: document.querySelector("#productMaterial").value.trim(),
    imageAlt: document.querySelector("#productImageAlt").value.trim(),
    categoryId: Number(categoryValue),
    isFeatured: document.querySelector("#productFeatured").checked,
    isActive: document.querySelector("#productActive").checked,
  };

  setLoading(true);

  try {
    const product = await apiRequest(id ? `/api/admin/products/${id}` : "/api/admin/products", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload),
    });

    await uploadProductImage(product.id);
    await loadAdminData();
    resetProductForm();
    showMessage("Producto guardado.");
  } catch (error) {
    showMessage(error.message, "danger");
  } finally {
    setLoading(false);
  }
});

elements.productTable.addEventListener("click", async (event) => {
  const editId = event.target.dataset.productEdit;
  const deleteId = event.target.dataset.productDelete;

  if (editId) {
    const product = products.find((item) => String(item.id) === String(editId));
    if (product) fillProductForm(product);
  }

  if (deleteId && confirm("Desactivar este producto?")) {
    try {
      await apiRequest(`/api/admin/products/${deleteId}`, { method: "DELETE" });
      await loadAdminData();
      showMessage("Producto desactivado.");
    } catch (error) {
      showMessage(error.message, "danger");
    }
  }
});

elements.categoryForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const nameInput = document.querySelector("#categoryName");

  try {
    await apiRequest("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify({ name: nameInput.value.trim(), isActive: true }),
    });
    nameInput.value = "";
    await loadAdminData();
    showMessage("Categoria creada.");
  } catch (error) {
    showMessage(error.message, "danger");
  }
});

document.querySelector("#productImage").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) {
    showImagePreview(null);
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => showImagePreview(e.target.result);
  reader.readAsDataURL(file);
});

elements.categoryList.addEventListener("click", async (event) => {
  const categoryId = event.target.dataset.categoryDelete;

  if (!categoryId || !confirm("Desactivar esta categoria?")) {
    return;
  }

  try {
    await apiRequest(`/api/admin/categories/${categoryId}`, { method: "DELETE" });
    await loadAdminData();
    showMessage("Categoria desactivada.");
  } catch (error) {
    showMessage(error.message, "danger");
  }
});

(async function initAdmin() {
  if (!getToken()) {
    showLogin();
    return;
  }

  try {
    await apiRequest("/api/admin/auth/me");
    showDashboard();
    await loadAdminData();
  } catch (error) {
    showLogin();
  }
})();
