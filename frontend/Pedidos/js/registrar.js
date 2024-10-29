// Cargar clientes
async function cargarClientes() {
    const response = await fetch('http://localhost:3000/cliente');
    const clientes = await response.json();
    const clienteSelect = document.getElementById('cliente');

    const optionInicial = document.createElement('option');
    optionInicial.value = '';
    optionInicial.text = 'Selecciona un cliente';
    optionInicial.disabled = true;
    optionInicial.selected = true;
    clienteSelect.appendChild(optionInicial);

    clientes.forEach(cliente => {
        const option = document.createElement('option');
        option.value = cliente.ID;
        option.text = cliente.nombre;
        clienteSelect.appendChild(option);
    });
}

// Cargar tipos de pedido
async function cargarTiposPedido() {
    const response = await fetch('http://localhost:3000/tipos_pedido');
    const tiposPedido = await response.json();
    const tipoPedidoSelect = document.getElementById('tipoPedido');

    const optionInicial = document.createElement('option');
    optionInicial.value = '';
    optionInicial.text = 'Selecciona un tipo de pedido';
    optionInicial.disabled = true;
    optionInicial.selected = true;
    tipoPedidoSelect.appendChild(optionInicial);

    tiposPedido.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo.ID;
        option.text = tipo.descripcion;
        tipoPedidoSelect.appendChild(option);
    });
}

// Cargar días
async function cargarDiasSelect(select) {
    try {
        const response = await fetch('http://localhost:3000/dias');
        const dias = await response.json();

        const optionInicial = document.createElement('option');
        optionInicial.value = '';
        optionInicial.text = 'Selecciona un día';
        optionInicial.disabled = true;
        optionInicial.selected = true;
        select.appendChild(optionInicial);

        dias.forEach(dia => {
            const option = document.createElement('option');
            option.value = dia.ID;
            option.text = dia.nombre;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar días:', error);
    }
}

// Cargar productos
async function cargarProductosSelect(select) {
    const response = await fetch('http://localhost:3000/productos');
    const productos = await response.json();

    const optionInicial = document.createElement('option');
    optionInicial.value = '';
    optionInicial.text = 'Selecciona un producto';
    optionInicial.disabled = true;
    optionInicial.selected = true;
    select.appendChild(optionInicial);

    productos.forEach(producto => {
        const option = document.createElement('option');
        option.value = producto.ID;
        option.text = producto.producto;
        select.appendChild(option);
    });
}

// Validar si la fila tiene datos completos
function validarFila(selectDia, selectProducto, inputCantidad) {
    if (selectDia.value === '' || selectProducto.value === '' || inputCantidad.value === '') {
        return false;
    }
    return true;
}

// Editar fila: Habilitar campos nuevamente y cambiar el botón a "Guardar"
function editarFila(fila) {
    const selectDia = fila.querySelector('.diasEntrega');
    const selectProducto = fila.querySelector('.producto');
    const inputCantidad = fila.querySelector('.cantidadProducto');

    // Habilitar los elementos
    selectDia.disabled = false;
    selectProducto.disabled = false;
    inputCantidad.disabled = false;

    // Cambiar el texto del botón de "Editar" a "Guardar"
    const botonEditar = fila.querySelector('.modificar');
    botonEditar.innerText = 'Guardar';
    
    // Cambiar el comportamiento del botón para que guarde la fila
    botonEditar.removeEventListener('click', () => editarFila(fila));
    botonEditar.addEventListener('click', () => guardarFila(fila));
}

// Guardar fila: Deshabilitar campos y cambiar el botón a "Editar"
function guardarFila(fila) {
    const selectDia = fila.querySelector('.diasEntrega');
    const selectProducto = fila.querySelector('.producto');
    const inputCantidad = fila.querySelector('.cantidadProducto');

    // Deshabilitar los elementos
    selectDia.disabled = true;
    selectProducto.disabled = true;
    inputCantidad.disabled = true;

    // Cambiar el texto del botón de "Guardar" a "Editar"
    const botonGuardar = fila.querySelector('.modificar');
    botonGuardar.innerText = 'Editar';

    // Cambiar el comportamiento del botón para que edite la fila nuevamente
    botonGuardar.removeEventListener('click', () => guardarFila(fila));
    botonGuardar.addEventListener('click', () => editarFila(fila));
}

// Deshabilitar fila y cambiar botones de "Agregar" a "Editar" y "Eliminar"
function deshabilitarFila(ultimaFila) {
    const selectDia = ultimaFila.querySelector('.diasEntrega');
    const selectProducto = ultimaFila.querySelector('.producto');
    const inputCantidad = ultimaFila.querySelector('.cantidadProducto');

    // Deshabilitar los elementos
    selectDia.disabled = true;
    selectProducto.disabled = true;
    inputCantidad.disabled = true;

    // Cambiar botón de "Agregar" a "Editar" y "Eliminar"
    const botonAgregar = ultimaFila.querySelector('button');
    botonAgregar.remove(); // Eliminar botón de agregar

    // Crear botón de Editar
    const botonEditar = document.createElement('button');
    botonEditar.type = 'button';
    botonEditar.classList.add('btn', 'modificar', 'btn-sm');
    botonEditar.innerText = 'Editar';
    botonEditar.addEventListener('click', () => editarFila(ultimaFila));

    // Crear botón de Eliminar
    const botonEliminar = document.createElement('button');
    botonEliminar.type = 'button';
    botonEliminar.classList.add('btn', 'btn-danger', 'btn-sm', 'eliminar');
    botonEliminar.innerText = 'Eliminar';
    botonEliminar.addEventListener('click', () => eliminarFila(ultimaFila));

    // Agregar los botones a la celda de acciones
    const tdAccion = ultimaFila.querySelector('td:last-child');
    tdAccion.appendChild(botonEditar);
    tdAccion.appendChild(botonEliminar);
}

// Eliminar fila: Remover la fila de la tabla
function eliminarFila(fila) {
    fila.remove();
}

// Agregar nueva fila en la tabla de productos solo si los datos están completos
function agregarFilaProducto() {
    const ultimaFila = document.querySelector('#productosBody tr:last-child');
    const selectDia = ultimaFila.querySelector('.diasEntrega');
    const selectProducto = ultimaFila.querySelector('.producto');
    const inputCantidad = ultimaFila.querySelector('.cantidadProducto');

    if (!validarFila(selectDia, selectProducto, inputCantidad)) {
        Swal.fire({
            icon: 'warning',
            title: 'Datos incompletos',
            text: 'Debe completar todos los campos antes de agregar un nuevo producto.',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    // Deshabilitar la fila actual y cambiar los botones
    deshabilitarFila(ultimaFila);

    // Crear nueva fila
    const tableBody = document.getElementById('productosBody');
    const row = document.createElement('tr');

    // Crear select de días
    const tdDia = document.createElement('td');
    const selectDiaNuevo = document.createElement('select');
    selectDiaNuevo.classList.add('diasEntrega', 'form-control');
    cargarDiasSelect(selectDiaNuevo);
    tdDia.appendChild(selectDiaNuevo);

    // Crear select de productos
    const tdProducto = document.createElement('td');
    const selectProductoNuevo = document.createElement('select');
    selectProductoNuevo.classList.add('producto', 'form-control');
    cargarProductosSelect(selectProductoNuevo);
    tdProducto.appendChild(selectProductoNuevo);

    // Crear input de cantidad
    const tdCantidad = document.createElement('td');
    const inputCantidadNuevo = document.createElement('input');
    inputCantidadNuevo.type = 'number';
    inputCantidadNuevo.classList.add('form-control', 'cantidadProducto');
    inputCantidadNuevo.placeholder = 'Cantidad';
    tdCantidad.appendChild(inputCantidadNuevo);

    // Crear botón de agregar para la nueva fila
    const tdAccion = document.createElement('td');
    const buttonAgregar = document.createElement('button');
    buttonAgregar.type = 'button';
    buttonAgregar.classList.add('btn', 'btn', 'modificar', 'btn-sm');
    buttonAgregar.innerText = 'Agregar';
    buttonAgregar.addEventListener('click', agregarFilaProducto);
    tdAccion.appendChild(buttonAgregar);

    // Agregar las celdas a la fila
    row.appendChild(tdDia);
    row.appendChild(tdProducto);
    row.appendChild(tdCantidad);
    row.appendChild(tdAccion);

    // Agregar la nueva fila al tbody
    tableBody.appendChild(row);
}

document.addEventListener('DOMContentLoaded', function() {
    cargarClientes();
    cargarTiposPedido();

    // Cargar productos y días para la primera fila ya en el HTML
    const selectDias = document.getElementById('selectdias');
    const selectProductos = document.getElementById('selectproductos');
    cargarDiasSelect(selectDias);
    cargarProductosSelect(selectProductos);

    // Event listener para agregar nuevas filas
    const agregarProductoBtn = document.getElementById('agregarproducto');
    agregarProductoBtn.addEventListener('click', agregarFilaProducto);

    // Establecer la fecha mínima del input
    const fechaInput = document.getElementById('fechaCreacion');
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    fechaInput.setAttribute('min', formattedDate);
});

document.getElementById('pedidoForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const clienteID = document.getElementById('cliente').value;
    const tipoPedidoID = document.getElementById('tipoPedido').value;
    const fechaCreacion = document.getElementById('fechaCreacion').value;
    const detalles = [];

    const filas = document.querySelectorAll('#productosBody tr');
    filas.forEach(fila => {
        const selectDia = fila.querySelector('.diasEntrega');
        const selectProducto = fila.querySelector('.producto');
        const inputCantidad = fila.querySelector('.cantidadProducto');

        if (validarFila(selectDia, selectProducto, inputCantidad)) {
            detalles.push({
                diaID: selectDia.value,
                productoID: selectProducto.value,
                cantidad: inputCantidad.value
            });
        }
    });

    // Enviar los datos al servidor
    try {
        const response = await fetch('http://localhost:3000/pedidos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                clienteID,
                tipoPedidoID,
                fechaCreacion,
                detalles
            })
        });

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Pedido registrado',
                text: 'El pedido se ha registrado exitosamente.'
            }).then(() => {
                // Redirigir a la página de pedidos
                window.location.href = 'pedidos.html';
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo registrar el pedido.'
            });
        }
    } catch (error) {
        console.error('Error al registrar el pedido:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al intentar registrar el pedido.'
        });
    }
});
