// Variable global para almacenar todos los pedidos 
let allPedidosData = [];

// Variable global para almacenar todos los clientes que tienen pedidos
let clientesConPedidos = [];

$(document).ready(function () {
    // Cargar días disponibles para el filtro
    $.get('http://localhost:3000/dias', function (data) {
        let filtroDia = $('#filtro-dia');
        filtroDia.append(`<option value="" selected disabled>Seleccionar un día</option>`); // Añadir la opción por defecto
        data.forEach(function (dia) {
            filtroDia.append(`<option value="${dia.ID}">${dia.nombre}</option>`);
        });
    }).fail(function () {
        console.error('Error al cargar los días');
    });

    // Cargar todos los clientes inicialmente
    $.get('http://localhost:3000/cliente', function (data) {
        clientesConPedidos = data; // Almacenar todos los clientes inicialmente
        cargarClientes(); // Cargar todos los clientes en el select
    }).fail(function () {
        console.error('Error al cargar los clientes');
    });

    cargarPedidos(); // Cargar los pedidos inicialmente

    // Filtrar pedidos cuando se seleccione un día
    $('#filtro-dia').on('change', function () {
        let diaSeleccionado = $(this).val();
        console.log(diaSeleccionado); // Verificar el valor seleccionado
        let pedidosFiltrados = allPedidosData; // Empezar con todos los pedidos

        // Filtrar solo si hay un día seleccionado
        if (diaSeleccionado) {
            pedidosFiltrados = allPedidosData.filter(function (pedido) {
                return pedido.IDdias == Number(diaSeleccionado); // Filtrar por IDdias
            });
            // Actualizar el select de clientes basado en los pedidos filtrados
            actualizarFiltroClientes(pedidosFiltrados);
        }
        console.log(pedidosFiltrados); // Verificar los pedidos filtrados

        // Cargar pedidos filtrados
        cargarTabla(pedidosFiltrados);
    });

    // Filtrar pedidos cuando se seleccione un cliente
    $('#filtro-cliente').on('change', function () {
        let clienteSeleccionado = $(this).val();
        let diaSeleccionado = $('#filtro-dia').val(); // Obtener el día seleccionado
        console.log(clienteSeleccionado); // Verificar el valor seleccionado
        let pedidosFiltrados = allPedidosData; // Empezar con todos los pedidos

        // Filtrar por día y cliente
        if (clienteSeleccionado) {
            pedidosFiltrados = pedidosFiltrados.filter(function (pedido) {
                return pedido.IDcliente == Number(clienteSeleccionado); // Filtrar por IDCliente
            });
        }

        // Si hay un día seleccionado, filtrar también por día
        if (diaSeleccionado) {
            pedidosFiltrados = pedidosFiltrados.filter(function (pedido) {
                return pedido.IDdias == Number(diaSeleccionado); // Filtrar por IDdias
            });
        }

        console.log(pedidosFiltrados); // Verificar los pedidos filtrados

        // Cargar pedidos filtrados
        cargarTabla(pedidosFiltrados);
    });

    // Recargar todos los pedidos al hacer clic en el botón
    $('#reload-pedidos').on('click', function () {
        cargarTabla(allPedidosData); // Cargar todos los pedidos de nuevo
        $('#filtro-dia').val(''); // Reiniciar el filtro de día
        $('#filtro-cliente').val(''); // Reiniciar el filtro de cliente
        cargarClientes(); // Recargar todos los clientes
    });
});

// Función para cargar todos los clientes en el select
function cargarClientes() {
    let filtroCliente = $('#filtro-cliente');
    filtroCliente.empty(); // Limpiar las opciones actuales
    filtroCliente.append(`<option value="" selected disabled>Seleccionar cliente</option>`); // Añadir la opción por defecto
    clientesConPedidos.forEach(function (cliente) {
        filtroCliente.append(`<option value="${cliente.ID}">${cliente.nombre}</option>`); // Asumiendo que los clientes tienen un ID y un nombre
    });
}

// Función para actualizar el filtro de clientes basado en los pedidos filtrados
function actualizarFiltroClientes(pedidosFiltrados) {
    let clientesFiltrados = new Set(); // Usar un Set para evitar duplicados

    // Obtener los clientes de los pedidos filtrados
    pedidosFiltrados.forEach(function (pedido) {
        clientesFiltrados.add(pedido.IDcliente); // Agregar el ID del cliente a la colección
    });

    // Limpiar el filtro de clientes
    let filtroCliente = $('#filtro-cliente');
    filtroCliente.empty(); // Limpiar las opciones actuales
    filtroCliente.append(`<option value="" selected disabled>Seleccionar cliente</option>`); // Añadir la opción por defecto

    // Cargar solo los clientes que tienen pedidos para el día seleccionado
    clientesConPedidos.forEach(function (cliente) {
        if (clientesFiltrados.has(cliente.ID)) { // Verificar si el cliente tiene pedidos
            filtroCliente.append(`<option value="${cliente.ID}">${cliente.nombre}</option>`);
        }
    });
}

// Función para cargar pedidos
function cargarPedidos() {
    $.get('http://localhost:3000/pedidos', function (data) {
        allPedidosData = data; // Almacenar todos los pedidos
        console.log(data); // Verificar la estructura de los datos
        cargarTabla(data); // Cargar la tabla con los pedidos
        verificarBajasAutomaticas(allPedidosData); // Pasar allPedidosData como argumento
    }).fail(function () {
        console.error('Error al cargar los datos de los pedidos');
    });
}

function cargarTabla(data) {
    let tbody = $('#tablepedidosbody');
    tbody.empty(); // Limpia el contenido de la tabla

    // Inicializa el DataTable si no está inicializado
    if (!$.fn.DataTable.isDataTable('#table_id')) {
        $("#table_id").DataTable({
            "pageLength": 5,
            lengthMenu: [
                [5, 10, 25, 50],
                [5, 10, 25, 50]
            ],
            "language": {
                "url": "https://cdn.datatables.net/plug-ins/1.13.1/i18n/es-ES.json"
            }
        });
    }

    // Limpiar cualquier fila existente en la tabla
    $("#table_id").DataTable().clear();

    // Si hay datos, cargarlos en el DataTable
    if (data.length > 0) {
        data.forEach(function (pedido) {
            let fecha = new Date(pedido.FechaCreacion);
            let dia = String(fecha.getDate()).padStart(2, '0');
            let mes = String(fecha.getMonth() + 1).padStart(2, '0');
            let anio = fecha.getFullYear();
            let fechaFormateada = `${dia}/${mes}/${anio}`;

            // Verificar si el pedido es de tipo 'Unico' para no permitir dar de baja
            let botonBaja = '';
            if (pedido.TipoPedido !== 'Unico') { 
                if (pedido.FechaBaja) {
                    botonBaja = `<button type="button" class="btn btnbaja btn-sm" onclick="mostrarAlerta()">Dar de Baja</button>`;
                } else {
                    botonBaja = `<button type="button" class="btn btnbaja btn-sm" onclick="darDeBaja(${pedido.IDPedido}, ${pedido.IDdias})">Dar de Baja</button>`;
                }
            }

            // Botón de cancelar
            let botonCancelar = `<button class="btn btn-danger btncancelar btn-sm" onclick="cancelarPedido(${pedido.IDPedido}, ${pedido.IDdias})">Cancelar</button>`;

            tbody.append(`
                <tr>
                    <td class="text-center">${pedido.IDPedido}</td>
                    <td>${pedido.Cliente}</td>
                    <td>${pedido.Direccion}</td>
                    <td class="text-center">${pedido.Barrio}</td> <!-- Barrio -->
                    <td class="text-center">${pedido.Localidad}</td> <!-- Localidad -->
                    <td class="text-center">${pedido.TipoPedido}</td>
                    <td class="text-center">${fechaFormateada}</td>
                    <td class="text-center">${pedido.DiaNombre}</td>
                    <td class="text-center acciones">
                        <button type="button" class="btn agregarc2 btn-sm" onclick="verpedido(${pedido.IDPedido}, ${pedido.IDdias})">Ver pedido</button>
                        <button type="button" class="btn modificar2 btn-sm" onclick="editarpedido(${pedido.IDPedido}, ${pedido.IDdias})">Modificar</button>
                        ${botonBaja} <!-- Solo muestra el botón de baja si no es un pedido único -->
                        ${botonCancelar}
                    </td>
                </tr>
            `);
        });

        // Actualiza el DataTable con los nuevos datos
        $("#table_id").DataTable().rows.add(tbody.find('tr')).draw();
    } else {
        tbody.append('<tr><td colspan="7" class="text-center">No hay pedidos disponibles.</td></tr>');
    }
}

function darDeBaja(pedidoID, diaID) {
    // Redirigir a la página de dar de baja, pasando los parámetros en la URL
    window.location.href = `dardebaja.html?id=${pedidoID}&diaId=${diaID}`;
}

function editarpedido(pedidoID, diaID) {
    window.location.href = `editar.html?id=${pedidoID}&diaId=${diaID}`;
}

// Agregar evento para el botón "Ver pedido"
function verpedido(pedidoID, diaID) {
    // Redirigir a la página de detalle con los parámetros de ID del pedido y ID del día
    window.location.href = `pedidodetalle.html?id=${pedidoID}&diaId=${diaID}`;
}

function cancelarPedido(pedidoID, diaID) { 
    // Buscar el pedido correspondiente en allPedidosData
    const pedido = allPedidosData.find(p => p.IDPedido === pedidoID && p.IDdias === diaID);
    
    // Verificar si hay una fecha de baja establecida para el pedido
    if (pedido) {
        const fechaBaja = new Date(pedido.FechaBaja);
        const fechaHoy = new Date();
        
        // Ajustar la fecha de "hoy" para comprobar si es mañana
        const fechaMañana = new Date();
        fechaMañana.setDate(fechaMañana.getDate() + 1); // Sumar un día a la fecha de hoy

        // Verificar si la fecha de baja es mañana
        if (fechaBaja.toISOString().split('T')[0] === fechaMañana.toISOString().split('T')[0]) {
            Swal.fire({
                icon: 'warning',
                title: 'No se puede cancelar',
                text: 'Este pedido no se puede cancelar ya que tiene una fecha de baja para mañana.'
            });
            return; // Salir de la función
        }
    }

    const fechaCancelado = new Date().toISOString().split('T')[0]; // Obtener la fecha actual en formato YYYY-MM-DD
    $.ajax({
        url: `http://localhost:3000/detallepedido/${pedidoID}/${diaID}`, 
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({ 
            cancelado: true,
            fechacancelado: fechaCancelado // Añadir la fecha de cancelación
        }),
        success: function () {
            console.log(`Pedido ${pedidoID} cancelado.`);
            Swal.fire({
                icon: 'success',
                title: 'Cancelado',
                text: 'El pedido ha sido cancelado correctamente.'
            });
            cargarPedidos(); // Recargar la lista de pedidos para reflejar el cambio
        },
        error: function (error) {
            console.error('Error al cancelar el pedido:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo cancelar el pedido. Intente de nuevo más tarde.'
            });
        }
    });
}


function verificarBajasAutomaticas() {
    const hoy = new Date(); // Obtener la fecha y hora actual
    const hoyISO = hoy.toISOString().split('T')[0]; // Solo la fecha en formato YYYY-MM-DD
    console.log(`Verificando bajas automáticas para la fecha: ${hoyISO}`);

    // Iterar sobre todos los pedidos y verificar si tienen una baja programada
    allPedidosData.forEach(pedido => {
        // Asegúrate de que FechaBaja esté en el formato YYYY-MM-DD
        let fechaBaja = new Date(pedido.FechaBaja);
        let fechaBajaISO = fechaBaja.toISOString().split('T')[0];

        // Verifica si la fecha de baja es hoy y si la hora ha pasado las 23:59
        if (fechaBajaISO === hoyISO && hoy.getHours() >= 23 && hoy.getMinutes() >= 59) {
            darDeBajaAutomatica(pedido.IDPedido, pedido.IDdias); // Llama a la función para dar de baja
        }
    });
}


function darDeBajaAutomatica(idPedido, diaId) {
    // Lógica para actualizar el estado del pedido en la base de datos
    $.ajax({
        url: `http://localhost:3000/detallepedido/${idPedido}/${diaId}`, // Asegúrate de que esta sea la URL correcta
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({ dardebaja: true }),
        success: function () {
            console.log(`Pedido ${pedidoID} dado de baja automáticamente.`);
            // Aquí podrías volver a cargar la tabla o manejar la interfaz de usuario si es necesario
            cargarPedidos(); // Recarga los pedidos para reflejar los cambios
        },
        error: function (error) {
            console.error('Error al dar de baja automáticamente:', error);
        }
    });
}

// Llama a verificarBajasAutomaticas cada minuto
setInterval(verificarBajasAutomaticas, 60 * 1000); // 60 segundos
