// Se asegura de que el código se ejecute después de que el documento esté listo
$(document).ready(function () {    
    // Obtiene los parámetros de la URL, como el ID del pedido y el ID del día
    const urlParams = new URLSearchParams(window.location.search);
    const pedidoID = urlParams.get('id');
    const diaId = urlParams.get('diaId'); // Obtener el ID del día

    // Si existe un ID de pedido
    if (pedidoID) {
        // Realiza una solicitud GET para obtener los detalles del pedido utilizando el pedidoID y diaId
        $.get(`http://localhost:3000/pedidos/${pedidoID}/${diaId}`, function (data) {
            if (data.length > 0) {
                const pedido = data[0];
                console.log("Datos del pedido recibidos:", pedido);

                // Muestra el número de pedido y detalles del cliente en la interfaz
                $('.card-header').text(`Pedido #${pedido.IDPedido}`);
                $('#cliente').text(`Cliente: ${pedido.Cliente}`);
                $('#direccion').html(`<span class="resaltar">Dirección</span>: ${pedido.Direccion}`);
                $('#dias').append(`${pedido.DiaEntrega}`); // Muestra el día específico de entrega

                // Limpia las listas antes de rellenarlas con datos nuevos
                $('#dias-lista').empty();
                $('#productos-lista').empty();
                $('#cantidad-lista').empty();

                // Variables para construir las listas de productos y cantidades, y para calcular el precio total
                let productosHtml = '';
                let cantidadesHtml = '';
                let totalPrecio = 0; // Inicializa el total de precio

                // Recorre cada detalle del pedido para construir las listas y calcular el total
                data.forEach(function (detalle, index) {
                    // Usar index + 1 para numeración
                    productosHtml += `${index + 1}. ${detalle.Producto}<br>`; // Agregar un salto de línea
                    cantidadesHtml += `${index + 1}. ${detalle.cantidad}<br>`; // Agregar un salto de línea
                    totalPrecio += parseFloat(detalle.preciototal) || 0; // Suma el precio total
                });

                // Muestra las listas de productos y cantidades en la interfaz
                $('#productos-lista').append(productosHtml);
                $('#cantidad-lista').append(cantidadesHtml);

                // Muestra el precio total en la interfaz con el texto "Precio Total" en negrita
                $('#preciototal').html(`<strong>Precio Total:</strong> $${totalPrecio.toFixed(2)}`);
                $('#estado').html(`<span class="resaltar">Estado</span>: ${pedido.Estado}`);

                // Asigna una función de clic al botón "Entregado"
                $('#btn-entregado').click(function() {
                    console.log("Botón Entregado presionado");
                    marcarComoEntregado(pedidoID, diaId);
                });
                
            } else {
                console.log('No se encontraron detalles para este pedido.');
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            // Manejo de errores en caso de fallo al obtener los detalles del pedido
            console.error("Error al obtener los detalles del pedido:", textStatus, errorThrown);
        });
    } else {
        // Mensaje de error si no se encuentra el ID del pedido en la URL
        console.error('No se encontró el ID del pedido en la URL');
    }
});

// Función para marcar un pedido como entregado
function marcarComoEntregado(pedidoID, diaId) {
    console.log("Ejecutando marcarComoEntregado", pedidoID, diaId);
    // Obtiene la fecha actual en formato YYYY-MM-DD
    const fechaEntrega = new Date().toISOString().split('T')[0];

    // Realiza una solicitud POST para marcar el pedido como entregado
    $.ajax({
        url: `http://localhost:3000/entregarpedido`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            pedidoID: pedidoID,
            diaId: diaId,
            fechaEntrega: fechaEntrega
        }),
        success: function(response) {
            // Muestra una notificación de éxito y redirige a la página de pedidos
            Swal.fire('Éxito', 'El pedido ha sido marcado como entregado', 'success').then(() => {
                window.location.href = "../pedidos/pedidos.html"; // Redirige a la tabla de pedidos pendientes
            });
        },
        error: function(error) {
            // Muestra una alerta de error si no se pudo procesar la solicitud
            console.error('Error al marcar el pedido como entregado:', error);
            Swal.fire('Error', 'Hubo un problema al procesar la solicitud', 'error');
        }
    });
}
