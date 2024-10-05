class Producto {
    constructor(nombre, precio, imagen) {
        this.nombre = nombre;
        this.precio = precio;
        this.imagen = imagen;
        this.cantidad = 0; // Este atributo se usa solo para el carrito
    }
}


class Carrito {
    constructor() {
        this.productos = this.cargarProductos(); // Carga los productos desde localStorage
        this.modalElement = document.getElementById('detallesCompraModal'); // Referencia al modal
        this.eventListenerAdded = false; // Bandera para controlar el listener
    }

    cargarProductos() {
        const productosGuardados = localStorage.getItem('carrito');
        return productosGuardados ? JSON.parse(productosGuardados) : []; // Cargar productos del localStorage
    }

    guardarProductos() {
        localStorage.setItem('carrito', JSON.stringify(this.productos)); // Guardar productos en localStorage
    }

    agregarProducto(producto) {
        const existingProduct = this.productos.find(p => p.nombre === producto.nombre);
        if (existingProduct) {
            existingProduct.cantidad += 1; // Incrementar la cantidad
        } else {
            producto.cantidad = 1; // Inicializamos la cantidad en 1 al agregar por primera vez
            this.productos.push(producto);
        }
        this.guardarProductos(); // Guardar cambios en localStorage
        this.mostrarCarrito();
    }

    calcularTotal() {
        const total = this.productos.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0);
        return total.toLocaleString('es-CL'); // Formato chileno
    }

    mostrarCarrito() {
        const carritoElemento = document.getElementById('carrito');
        if (!carritoElemento) return; // Verifica si el elemento existe
    
        carritoElemento.innerHTML = '';
    
        if (this.productos.length === 0) {
            // Si no hay productos en el carrito, mostrar mensaje
            const mensajeVacio = document.createElement('li');
            mensajeVacio.classList.add('list-group-item', 'text-center', 'text-muted');
            mensajeVacio.textContent = 'El carrito está vacío';
            carritoElemento.appendChild(mensajeVacio);
        } else {
            // Si hay productos, mostrarlos
            this.productos.forEach(producto => {
                const li = document.createElement('li');
                li.classList.add('list-group-item');
                li.innerHTML = `${producto.nombre} <span>Cantidad: ${producto.cantidad}</span> <span>$${producto.precio.toLocaleString('es-CL')} CLP</span> <span>Total: $${(producto.precio * producto.cantidad).toLocaleString('es-CL')} CLP</span>`;
                carritoElemento.appendChild(li);
            });
        }
    
        document.getElementById('total').textContent = `Total: $${this.calcularTotal()} CLP`;
    }
    

    finalizarCompra() {
        if (this.productos.length === 0) {
            alert("No puedes finalizar la compra sin productos en el carrito.");
            return; // Detener la ejecución si el carrito está vacío
        }
        this.mostrarDetallesCompra();
    }

    mostrarDetallesCompra() {
        const detallesCompraElemento = document.getElementById('detalles-compra');
        detallesCompraElemento.innerHTML = ''; // Limpiar detalles anteriores
        this.productos.forEach(producto => {
            const li = document.createElement('li');
            li.classList.add('list-group-item');
            li.innerHTML = `${producto.nombre} - Cantidad: ${producto.cantidad} - Precio: $${producto.precio.toLocaleString('es-CL')} CLP - Total: $${(producto.precio * producto.cantidad).toLocaleString('es-CL')} CLP`;
            detallesCompraElemento.appendChild(li);
        });
        document.getElementById('total-detalles').textContent = `Total: $${this.calcularTotal()} CLP`;

        // Mostrar modal con los detalles
        const detallesModal = new bootstrap.Modal(this.modalElement);
        detallesModal.show();

        // Añadir el listener solo si no se ha añadido previamente
        if (!this.eventListenerAdded) {
            this.modalElement.addEventListener('hidden.bs.modal', () => this.compraExitosa());
            this.eventListenerAdded = true; // Marcar que el listener ha sido añadido
        }
    }

    compraExitosa() {
        alert(`Compra realizada con éxito. El pago total fue de: $${this.calcularTotal()} CLP`);
        this.productos = []; // Limpiar el carrito
        this.guardarProductos(); // Guardar cambios en localStorage
        this.mostrarCarrito(); // Refrescar vista del carrito
    }
}

// Crear una instancia del carrito
const carrito = new Carrito();

// Inicializando productos con imágenes
const productosDisponibles = [
    new Producto('Leche', 1000, '1.png'),
    new Producto('Pan de molde', 2000, '2.jpg'),
    new Producto('Queso', 1200, '3.avif'),
    new Producto('Mermelada', 890, '4.png'),
    new Producto('Azúcar', 1300, '5.png')
];


// Mostrar productos disponibles en la página de catálogo
if (document.getElementById('lista-productos')) {
    const listaProductos = document.getElementById('lista-productos');
    productosDisponibles.forEach((producto, index) => {
        const div = document.createElement('div');
        div.classList.add('col-12', 'col-md-6');
        div.innerHTML = `
            <div class="producto-card p-3 text-center">
                <img src="${producto.imagen}" alt="${producto.nombre}" class="img-fluid mb-3" style="max-height: 150px;">
                <h5>${producto.nombre}</h5>
                <p>$${producto.precio.toLocaleString('es-CL')} CLP</p>
                <input type="number" id="cantidad-${index}" min="1" value="1" class="form-control mb-2" style="width: 60%; margin: 0 auto;">
                <button class="btn btn-primary" onclick="agregarAlCarrito(${index})">Agregar al Carrito</button>
            </div>
        `;
        listaProductos.appendChild(div);
    });
}


// Función para añadir producto al carrito
function agregarAlCarrito(index) {
    const productoSeleccionado = productosDisponibles[index];
    const cantidadInput = document.getElementById(`cantidad-${index}`);
    const cantidad = parseInt(cantidadInput.value) || 1; // Obtener la cantidad ingresada o 1 si no es válido

    // Validar la cantidad ingresada
    if (cantidad <= 0) {
        alert("Por favor, ingrese una cantidad válida.");
        return;
    }

    // Agregar la cantidad especificada al carrito
    for (let i = 0; i < cantidad; i++) {
        carrito.agregarProducto(productoSeleccionado);
    }

    // Mostrar alerta con la cantidad agregada
    alert(`Se han agregado ${cantidad} unidades de ${productoSeleccionado.nombre} al carrito.`);
}

// Evento para finalizar la compra
document.getElementById('finalizar-compra')?.addEventListener('click', () => {
    carrito.finalizarCompra();
});

// Mostrar el carrito al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    carrito.mostrarCarrito();
});
