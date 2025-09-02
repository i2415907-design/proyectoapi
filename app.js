// Configuración
const API_URL = "http://localhost:3000";

// Helpers
function obtenerIdDeURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}
function getToken() {
  return localStorage.getItem('jwtToken');
}
function checkAuth() {
  if (window.location.pathname.includes('crud.html') && !getToken()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}
function logout() {
  localStorage.removeItem('jwtToken');
  window.location.href = 'login.html';
}
async function fetchWithAuth(url, options = {}) {
  const token = getToken();
  const requiresAuth = !url.includes('/usuario/login');
  
  // Si requiere auth pero no hay token
  if (requiresAuth && !token) {
    if (window.location.pathname.includes('crud.html')) {
      window.location.href = 'login.html';
    }
    throw new Error('No autenticado');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token && requiresAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    if (response.status === 401) {
      localStorage.removeItem('jwtToken');
      if (window.location.pathname.includes('crud.html')) {
        window.location.href = 'login.html';
      }
      throw new Error('Token inválido o expirado');
    }
    
    return response;
  } catch (error) {
    console.error('Error en fetch:', error);
    throw error;
  }
}
async function cargarCategoriasMenu() {
  try {
    const res = await fetch(`${API_URL}/categorias`);
    if (!res.ok) throw new Error('Error al cargar categorías');
    
    const cats = await res.json();
    const menu = document.getElementById("categorias-menu");
    
    if (!menu) return;
    
    menu.innerHTML = `
      <div class="category-link active" data-id="all">
        <strong>Todas las categorías</strong>
      </div>
    `;
    
    cats.forEach(c => {
      const div = document.createElement('div');
      div.className = 'category-link';
      div.dataset.id = c.id;
      div.textContent = c.nombre;
      menu.append(div);
    });

    menu.addEventListener('click', e => {
      if (!e.target.classList.contains('category-link')) return;
      
      menu.querySelectorAll('.category-link').forEach(el => {
        el.classList.remove('active');
      });
      
      e.target.classList.add('active');
      const id = e.target.dataset.id;
      
      id === 'all' ? cargarProductos() : cargarProductosPorCategoria(id);
    });
  } catch (error) {
    console.error('Error cargando categorías:', error);
  }
}

async function cargarProductos() {
  try {
    console.log('Cargando productos (público)...');
    const res = await fetch(`${API_URL}/productos`); // SIN auth
    if (!res.ok) throw new Error('Error al cargar productos');
    
    const prods = await res.json();
    console.log('Productos cargados:', prods);
    mostrarProductos(prods);
  } catch (error) {
    console.error('Error cargando productos:', error);
  }
}

async function cargarProductosPorCategoria(idCat) {
  try {
    // Usar fetch normal, no fetchWithAuth para rutas públicas
    const res = await fetch(`${API_URL}/productos?categoria_id=${idCat}`);
    if (!res.ok) throw new Error('Error al cargar productos');
    
    const prods = await res.json();
    mostrarProductos(prods);
  } catch (error) {
    console.error('Error cargando productos por categoría:', error);
  }
}

async function mostrarProductos(productos) {
  const cont = document.getElementById("productos-lista");
  if (!cont) return;
  cont.innerHTML = '';
  
  for (const p of productos) {
    try {
      // ⚠️ CAMBIAR: Usar fetch normal en lugar de fetchWithAuth
      const imgRes = await fetch(`${API_URL}/imagenes/${p.id}`);
      
      if (!imgRes.ok) {
        throw new Error('Error al cargar imágenes');
      }
      
      const imgs = await imgRes.json();
      const urlImg = imgs[0]?.url || 'https://via.placeholder.com/300x200';
      
      const card = document.createElement('div');
      card.className = "col-md-4 mb-4";
      card.innerHTML = `
        <div class="card">
          <img src="${urlImg}" class="card-img-top" style="height:200px;object-fit:cover;">
          <div class="card-body">
            <h5>${p.nombre}</h5>
            <p>S/. ${p.precio}</p>
            <a href="detalle.html?id=${p.id}" class="btn btn-sm btn-dark w-100">Ver detalle</a>
          </div>
        </div>
      `;
      cont.append(card);
      
    } catch (error) {
      console.error('Error cargando imagen para producto', p.id, error);
      // Mostrar producto sin imagen
      const card = document.createElement('div');
      card.className = "col-md-4 mb-4";
      card.innerHTML = `
        <div class="card">
          <img src="https://via.placeholder.com/300x200" class="card-img-top" style="height:200px;object-fit:cover;">
          <div class="card-body">
            <h5>${p.nombre}</h5>
            <p>S/. ${p.precio}</p>
            <a href="detalle.html?id=${p.id}" class="btn btn-sm btn-dark w-100">Ver detalle</a>
          </div>
        </div>
      `;
      cont.append(card);
    }
  }
}
async function cargarDetalleProducto() {
  const id = obtenerIdDeURL();
  if (!id) return mostrarErrorDetalle();

  try {
    // Obtengo un único producto
    const prodRes  = await fetch(`${API_URL}/productos/${id}`);
    const producto = await prodRes.json();

    // Obtengo todas las imágenes
    const imgRes = await fetch(`${API_URL}/imagenes/${id}`);
    const imgs   = await imgRes.json();

    // Escondo spinner y muestro contenido
    document.getElementById('cargando').classList.add('d-none');
    renderDetalle(producto, imgs);

  } catch {
    mostrarErrorDetalle();
  }
}

function renderDetalle(prod, imagenes) {
  const cont = document.getElementById('detalle-producto');
  cont.innerHTML = `
    <div class="row">
      <div class="col-md-6">
        <img 
          id="imagen-principal"
          src="${imagenes[0]?.url || 'https://via.placeholder.com/600x400'}"
          class="product-image rounded mb-3"
          alt="Principal"
        >
        <div id="thumbnails" class="d-flex flex-wrap gap-2">
          ${imagenes.map((img, i) => `
            <img
              src="${img.url}"
              data-url="${img.url}"
              class="thumbnail ${i===0?'active':''}"
              style="cursor:pointer;width:60px;height:60px;object-fit:cover;margin:2px;"
            >
          `).join('')}
        </div>
      </div>
      <div class="col-md-6">
        <h2>${prod.nombre}</h2>
        <p>Categoría: ${prod.categoria || 'Sin categoría'}</p>
        <h3>S/. ${prod.precio}</h3>
      </div>
    </div>
  `;

  vincularClickMiniaturas();
}
function vincularClickMiniaturas() {
  const principal = document.getElementById('imagen-principal');
  const thumbs    = document.querySelectorAll('#thumbnails .thumbnail');
  
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const url = thumb.getAttribute('data-url');
      principal.src = url;z
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });
}

function mostrarErrorDetalle() {
  document.getElementById('cargando').classList.add('d-none');
  document.getElementById('error').classList.remove('d-none');
}

// Cargar selects y listas
async function cargarCategoriasParaSelect() {
  const res = await fetchWithAuth(`${API_URL}/categorias`);
  const cats = await res.json();
  const sel = document.getElementById('categoriaProducto');
  if (sel) {
    sel.innerHTML = '<option value="">--</option>';
    cats.forEach(c => sel.innerHTML += `<option value="${c.id}">${c.nombre}</option>`);
  }
  cargarListaCategorias();
}

async function cargarProductosParaSelect() {
  const res = await fetchWithAuth(`${API_URL}/productos`);
  const pros = await res.json();
  const sel = document.getElementById('productoImagen');
  if (sel) {
    sel.innerHTML = '<option value="">--</option>';
    pros.forEach(p => sel.innerHTML += `<option value="${p.id}">${p.nombre}</option>`);
  }
  cargarListaProductos();
}
// app.js - Agregar esta función después de cargarListaCategorias()

async function cargarListaProductos() {
  if (!getToken()) {
    document.getElementById('lista-productos').innerHTML = `
      <div class="alert alert-warning">Debe iniciar sesión para ver los productos</div>
    `;
    return;
  }
  
  try {
    const res = await fetchWithAuth(`${API_URL}/productos`);
    if (!res.ok) throw new Error('Error al cargar productos');
    
    const pros = await res.json();
    const cont = document.getElementById('lista-productos');
    if (!cont) return;
    
    cont.innerHTML = `
      <table class="table table-hover">
        <thead>
          <tr>
            <th>ID</th><th>Nombre</th><th>Precio</th><th>Categoría</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${pros.map(p => `
            <tr>
              <td>${p.id}</td>
              <td>${p.nombre}</td>
              <td>S/. ${p.precio}</td>
              <td>${p.categoria || 'Sin categoría'}</td>
              <td>
                <button class="btn btn-sm btn-warning me-1"
                        onclick="editarProducto('${p.id}','${p.nombre}','${p.precio}','${p.categoria_id}')">
                  ✏️
                </button>
                <button class="btn btn-sm btn-danger"
                        onclick="eliminarProducto('${p.id}')">
                  🗑️
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error('Error cargando lista de productos:', error);
    document.getElementById('lista-productos').innerHTML = `
      <div class="alert alert-danger">Error al cargar productos: ${error.message}</div>
    `;
  }
}
async function cargarListaCategorias() {
  if (!getToken()) {
    document.getElementById('lista-categorias').innerHTML = `
      <div class="alert alert-warning">Debe iniciar sesión para ver las categorías</div>
    `;
    return;
  }
  
  try {
    const res = await fetchWithAuth(`${API_URL}/categorias`);
    const cats = await res.json();
    const cont = document.getElementById('lista-categorias');
    
    if (!cont) return;
    
    cont.innerHTML = `
      <table class="table table-striped">
        <thead>
          <tr>
            <th>ID</th><th>Nombre</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${cats.map(c => `
            <tr>
              <td>${c.id}</td>
              <td>${c.nombre}</td>
              <td>
                <button class="btn btn-sm btn-warning me-1"
                        onclick="editarCategoria('${c.id}','${c.nombre.replace(/'/g, "\\'")}')">
                  ✏️
                </button>
                <button class="btn btn-sm btn-danger"
                        onclick="eliminarCategoria('${c.id}')">
                  🗑️
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error('Error cargando lista de categorías:', error);
    document.getElementById('lista-categorias').innerHTML = `
      <div class="alert alert-danger">Error al cargar categorías</div>
    `;
  }
}

async function cargarListaImagenes() {
  if (!getToken()) {
    document.getElementById('lista-imagenes').innerHTML = `
      <div class="alert alert-warning">Debe iniciar sesión para ver las imágenes</div>
    `;
    return;
  }
  
  try {
    const prodRes = await fetchWithAuth(`${API_URL}/productos`);
    const pros = await prodRes.json();
    const cont = document.getElementById('lista-imagenes');
    if (!cont) return;

    let filas = '';
    for (const p of pros) {
      const imgRes = await fetchWithAuth(`${API_URL}/imagenes/${p.id}`);
      const imgs = await imgRes.json();
      imgs.forEach(i => {
        filas += `
          <tr>
            <td>${i.id}</td>
            <td>${p.nombre}</td>
            <td>
              <img src="${i.url}" style="width:60px; object-fit:cover;" alt="">
            </td>
            <td>
              <button class="btn btn-sm btn-warning me-1"
                      onclick="editarImagen('${i.id}','${i.url}','${i.producto_id}')">
                ✏️
              </button>
              <button class="btn btn-sm btn-danger"
                      onclick="eliminarImagen('${i.id}')">
                🗑️
              </button>
            </td>
          </tr>
        `;
      });
    }

    cont.innerHTML = `
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>ID</th><th>Producto</th><th>Imagen</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${filas}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error('Error cargando imágenes:', error);
  }
}

// Registrar / Editar
async function registrarCategoria(e) {
  e.preventDefault();
  const name = document.getElementById('nombreCategoria').value;
  const id   = document.getElementById('categoriaId').value;
  await fetchWithAuth(`${API_URL}/categorias${id?'/'+id:''}`, {
    method: id?'PUT':'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre: name })
  });
  document.getElementById('form-categoria').reset();
  cargarCategoriasParaSelect();
}

async function registrarProducto(e) {
  e.preventDefault();
  const name = document.getElementById('nombreProducto').value;
  const price= document.getElementById('precioProducto').value;
  const cat  = document.getElementById('categoriaProducto').value;
  const id   = document.getElementById('productoId').value;
  await fetchWithAuth(`${API_URL}/productos${id?'/'+id:''}`, {
    method: id?'PUT':'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre: name, precio: price, categoria_id: cat })
  });
  document.getElementById('form-producto').reset();
  cargarProductosParaSelect();
}

async function registrarImagen(e) {
  e.preventDefault();
  const urlI = document.getElementById('urlImagen').value;
  const pid  = document.getElementById('productoImagen').value;
  const id   = document.getElementById('imagenId').value;
  await fetchWithAuth(`${API_URL}/imagenes${id?'/'+id:''}`, {
    method: id?'PUT':'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: urlI, producto_id: pid })
  });
  document.getElementById('form-imagen').reset();
  cargarListaImagenes();
}

// Prefill para edición
function editarCategoria(id,name) {
  document.getElementById('categoriaId').value = id;
  document.getElementById('nombreCategoria').value = name;
}
function editarProducto(id,name,price,cat) {
  document.getElementById('productoId').value = id;
  document.getElementById('nombreProducto').value = name;
  document.getElementById('precioProducto').value = price;
  document.getElementById('categoriaProducto').value = cat;
}
function editarImagen(id,url,pid) {
  document.getElementById('imagenId').value = id;
  document.getElementById('urlImagen').value = url;
  document.getElementById('productoImagen').value = pid;
}

// Eliminar
async function eliminarCategoria(id) {
  await fetchWithAuth(`${API_URL}/categorias/${id}`, { method: 'DELETE' });
  cargarCategoriasParaSelect();
}
async function eliminarProducto(id) {
  await fetchWithAuth(`${API_URL}/productos/${id}`, { method: 'DELETE' });
  cargarProductosParaSelect();
}
async function eliminarImagen(id) {
  await fetchWithAuth(`${API_URL}/imagenes/${id}`, { method: 'DELETE' });
  cargarListaImagenes();
}

// Event listeners de CRUD
function configurarEventListenersCRUD() {
  document.getElementById('form-categoria')?.addEventListener('submit', registrarCategoria);
  document.getElementById('form-producto')?.addEventListener('submit', registrarProducto);
  document.getElementById('form-imagen')?.addEventListener('submit', registrarImagen);
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById("productos-lista")) {
    cargarProductos();
    cargarCategoriasMenu();
  }
  if (document.getElementById("detalle-producto")) {
    cargarDetalleProducto();
  }
  if (document.getElementById("form-categoria")) {
    cargarCategoriasParaSelect();
    cargarProductosParaSelect();
    cargarListaImagenes();
    configurarEventListenersCRUD();
  }
});

function actualizarNavbar() {
  const logoutItem = document.getElementById('logoutItem');
  const loginItem = document.getElementById('loginItem');
  const logoutLink = document.getElementById('logoutLink');
  
  if (logoutItem && loginItem) {
    const token = getToken();
    
    if (token) {
      // Usuario logueado
      logoutItem.style.display = 'block';
      loginItem.style.display = 'none';
      
      // Configurar evento de logout
      if (logoutLink) {
        logoutLink.onclick = function(e) {
          e.preventDefault();
          logout();
        };
      }
    } else {
      // Usuario no logueado
      logoutItem.style.display = 'none';
      loginItem.style.display = 'block';
    }
  }
}
document.addEventListener('DOMContentLoaded', function() {
  // Verificar autenticación en cada página excepto login
  actualizarNavbar

});
