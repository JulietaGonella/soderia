document.addEventListener('DOMContentLoaded', async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const idPedido = urlParams.get('id');
    const diaId = urlParams.get('diaId');

    function formatearFechaISO(fechaISO) {
        const fecha = new Date(fechaISO);
        const dia = ('0' + fecha.getDate()).slice(-2);
        const mes = ('0' + (fecha.getMonth() + 1)).slice(-2);
        const anio = fecha.getFullYear();
        return `${anio}-${mes}-${dia}`;
    }

    // Cargar los datos del pedido
    if (idPedido) {
        $.get(`http://localhost:3000/pedidos/${idPedido}/${diaId}`, function (pedido) {
            console.log("Datos del pedido recibidos:", pedido);
            if (pedido.length > 0) {
                const firstRow = pedido[0];
                const fechaCreacionFormateada = formatearFechaISO(firstRow.FechaCreacion);
                $('#fechaCreacion').val(fechaCreacionFormateada);
                $('#idpedido').val(firstRow.IDPedido);
                let detallesIds = pedido.map(item => item.IDDetalle);
                $('#iddetallepedido').val(detallesIds.join(','));
                cargarClientes(firstRow.IDCliente);
                cargarTiposPedido(firstRow.TipoPedidoID);
                cargarDiasSelect(firstRow.IDDias);
                cargarProductosExistentes(pedido);
            } else {
                console.log("No se encontraron productos en el pedido.");
                Swal.fire('Advertencia', 'No se encontraron productos en el pedido.', 'warning');
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.error("Error en la solicitud:", textStatus, errorThrown);
            Swal.fire('Error', 'No se pudo cargar el pedido.', 'error');
        });
    } else {
        console.log("No se proporcionó un ID de pedido en la URL.");
    }

    let filaId = 0; // Contador para generar ids únicos

    // Función para cargar productos existentes en la tabla 
    function cargarProductosExistentes(pedido) {
        pedido.forEach(producto => {
            const row = `
        <tr>
            <td>
                <div id="productoContainer-${producto.IDDetalle}"></div>
            </td>
            <td>
                <input type="number" class="form-control cantidadProducto" value="${producto.cantidad}" placeholder="Cantidad" disabled>
            </td>
            <td>
                <input type="hidden" class="idDetalle" value="${producto.IDDetalle}">
                <button type="button" class="btn btn modificar btn-sm">Editar</button>
            </td>
        </tr>
        `;
            $('#productosBody').append(row);
            cargarProductosSelect(`#productoContainer-${producto.IDDetalle}`, producto.IDProducto);
        });

        // Añadir una fila vacía para agregar más productos
        agregarFilaVacia();
    }

    // Función para agregar una fila vacía al final de la tabla 
    function agregarFilaVacia() {
        filaId++; // Incrementar el id para cada nueva fila
        const emptyRow = `
    <tr>
        <td>
            <div id="productoContainer-${filaId}"></div>
        </td>
        <td>
            <input type="number" class="form-control cantidadProducto" placeholder="Cantidad">
        </td>
        <td>
            <button type="button" class="btn btn modificar btn-sm">Agregar</button>
        </td>
    </tr>
    `;
        $('#productosBody').append(emptyRow);

        // Cargar el select para la nueva fila vacía (si es necesario)
        cargarProductosSelect(`#productoContainer-${filaId}`);
    }

    // Usar delegación de eventos para el botón "Modificar" y "Agregar"
    $('#productosBody').on('click', '.modificar', function () {
        const $fila = $(this).closest('tr');
        const productoSelect = $fila.find('select[id^="productoContainer"]');
        const cantidadInput = $fila.find('.cantidadProducto');
        const idDetalle = $fila.find('.idDetalle').val(); // Captura el ID desde el campo oculto

        // Verificar el idDetalle
        console.log("ID Detalle:", idDetalle);

        if ($(this).text() === "Editar") {
            productoSelect.prop('disabled', false);
            cantidadInput.prop('disabled', false);
            $(this).text("Guardar");
        } else if ($(this).text() === "Guardar") {
            const productoSeleccionado = productoSelect.val();
            const cantidad = cantidadInput.val();

            if (!productoSeleccionado || !cantidad) {
                alert("Por favor, complete todos los campos.");
                return;
            }

            console.log("Producto editado:", {
                idDetalle: idDetalle,
                producto: productoSeleccionado,
                cantidad: cantidad
            });

            productoSelect.prop('disabled', true);
            cantidadInput.prop('disabled', true);
            $(this).text("Editar");
        } else if ($(this).text() === "Agregar") {
            // Agregar una nueva fila vacía
            agregarFilaVacia();
            $(this).text("Editar");
            productoSelect.prop('disabled', true);
            cantidadInput.prop('disabled', true);
        }
    });


    // Enviar los cambios al servidor
    $('#pedidoFormeditar').on('submit', function (event) {
        event.preventDefault();

        const productosModificados = [];
        $('#productosBody tr').each(function () {
            const idProducto = $(this).find('select[id^="productoContainer"]').val();
            const cantidad = $(this).find('.cantidadProducto').val();
            const idDetalle = $(this).find('.idDetalle').val(); // Captura el ID desde el campo oculto

            // Verifica que el ID no sea undefined
            console.log("ID Detalle en envío:", idDetalle);

            if (idProducto && cantidad) {
                productosModificados.push({
                    idDetalle: idDetalle,
                    idProducto: idProducto,
                    cantidad: cantidad,
                    idDia: diaId // Mantener el idDia que se obtiene de la URL
                }); 
            }
        });

        const tipoPedido = $('#tipoPedido').val(); // Obtén el tipo de pedido

        console.log("Enviando datos:", { tipoPedido, productos: productosModificados }); // Depurar los datos

        // Realiza la solicitud de actualización al servidor
        $.ajax({
            url: `http://localhost:3000/pedidos/${idPedido}`,
            method: 'PUT',
            data: JSON.stringify({ tipoPedido, productos: productosModificados }),
            contentType: 'application/json',
            success: function (response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Pedido se a actualizado correctamente.',
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    window.location.href = 'pedidos.html';
                });
            },
            error: function (error) {
                console.error("Error en la solicitud:", error); // Muestra error en la consola
                Swal.fire('Error', 'No se pudo actualizar el pedido.', 'error');
            }
        });
    });
});

// Cargar productos en el select
async function cargarProductosSelect(selector, selectedId = null) {
    const response = await fetch('http://localhost:3000/productos');
    const productos = await response.json();
    const productoSelect = crearSelect(selector); // Crea el select

    // Limpiar opciones previas
    productoSelect.innerHTML = '';
    productoSelect.appendChild(new Option('Selecciona un producto', '', true, true));

    productos.forEach(producto => {
        const option = new Option(producto.producto, producto.ID, false, producto.ID === selectedId);
        productoSelect.appendChild(option);
    });

    // Habilitar solo el select de la fila recién agregada
    productoSelect.disabled = false;

    // Deshabilitar todos los demás selects en filas anteriores
    $('#productosBody tr').each(function () {
        // Deshabilitar selects en filas que no son la última
        if (!$(this).is(':last-child')) {
            $(this).find('select').prop('disabled', true);
        }
    });
}

function crearSelect(selector) {
    const select = document.createElement('select');
    select.setAttribute('id', selector.replace('#', '')); // Asigna un id al select
    select.classList.add('form-control'); // Añadir clase para estilos
    const container = document.querySelector(selector); // Asumiendo que deseas añadirlo al mismo contenedor
    container.appendChild(select);
    return select;
}

// Cargar clientes
async function cargarClientes(selectedId = null) {
    const response = await fetch('http://localhost:3000/cliente');
    const clientes = await response.json();
    const clienteSelect = document.getElementById('cliente');

    // Limpiar opciones previas
    clienteSelect.innerHTML = '';
    clienteSelect.appendChild(new Option('Selecciona un cliente', '', true, true));

    clientes.forEach(cliente => {
        const option = new Option(cliente.nombre, cliente.ID, false, cliente.ID === selectedId);
        clienteSelect.appendChild(option);
    });
}

// Cargar tipos de pedido
async function cargarTiposPedido(selectedId = null) {
    const response = await fetch('http://localhost:3000/tipos_pedido');
    const tiposPedido = await response.json();
    const tipoPedidoSelect = document.getElementById('tipoPedido');

    // Limpiar opciones previas
    tipoPedidoSelect.innerHTML = '';
    tipoPedidoSelect.appendChild(new Option('Selecciona un tipo de pedido', '', true, true));

    tiposPedido.forEach(tipo => {
        const option = new Option(tipo.descripcion, tipo.ID, false, tipo.ID === selectedId);
        tipoPedidoSelect.appendChild(option);
    });
}

async function cargarDiasSelect(selectedId = null) {
    const response = await fetch('http://localhost:3000/dias');
    const dias = await response.json();
    const diaSelect = document.getElementById('diasEntregaContainer');

    diaSelect.innerHTML = ''; // Limpiar opciones previas
    diaSelect.appendChild(new Option('Selecciona un día', '', true, true));

    dias.forEach(dia => {
        const option = new Option(dia.nombre, dia.ID, false, dia.ID === selectedId);
        diaSelect.appendChild(option);
    });
}
