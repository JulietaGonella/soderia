$(document).ready(function () {   
    const urlParams = new URLSearchParams(window.location.search);
    const pedidoID = urlParams.get('id');
    const diaId = urlParams.get('diaId'); // Obtener el ID del día

    if (pedidoID) {
        $.get(`http://localhost:3000/pedidos/${pedidoID}/${diaId}`, function (data) { // Incluir diaId en la URL
            if (data.length > 0) {
                const pedido = data[0];
                console.log("Datos del pedido recibidos:", pedido);

                $('.card-header').text(`Pedido #${pedido.IDPedido}`);
                $('#cliente').text(`Cliente: ${pedido.Cliente}`);
                $('#direccion').html(`<span class="resaltar">Dirección</span>: ${pedido.Direccion}`);
                $('#dias').append(`${pedido.DiaEntrega}`); // Mostrar solo el día específico

                $('#dias-lista').empty();
                $('#productos-lista').empty();
                $('#cantidad-lista').empty();

               
                let productosHtml = '';
                let cantidadesHtml = '';
                let totalPrecio = 0; // Inicializa el total de precio

                data.forEach(function (detalle, index) {
                    // Usar index + 1 para numeración
                    productosHtml += `${index + 1}. ${detalle.Producto}<br>`; // Agregar un salto de línea
                    cantidadesHtml += `${index + 1}. ${detalle.cantidad}<br>`; // Agregar un salto de línea
                    totalPrecio += parseFloat(detalle.preciototal) || 0;
                });

                $('#productos-lista').append(productosHtml);
                $('#cantidad-lista').append(cantidadesHtml);

                // Resaltar "Precio Total" en negrita
                $('#preciototal').html(`<strong>Precio Total:</strong> $${totalPrecio.toFixed(2)}`); // Mostrar el total acumulado
                $('#estado').html(`<span class="resaltar">Estado</span>: ${pedido.Estado}`);

                $('#btn-entregado').click(function() {
                    console.log("Botón Entregado presionado");
                    marcarComoEntregado(pedidoID, diaId);
                });
                
            } else {
                console.log('No se encontraron detalles para este pedido.');
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.error("Error al obtener los detalles del pedido:", textStatus, errorThrown);
        });
    } else {
        console.error('No se encontró el ID del pedido en la URL');
    }
});

function marcarComoEntregado(pedidoID, diaId) {
    console.log("Ejecutando marcarComoEntregado", pedidoID, diaId);
    const fechaEntrega = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD

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
            // Mostrar notificación de éxito
            Swal.fire('Éxito', 'El pedido ha sido marcado como entregado', 'success').then(() => {
                // Redirigir a la página de pedidos pendientes después de que el usuario cierre la alerta
                window.location.href = "../pedidos/pedidos.html"; // Redirige a la tabla de pedidos pendientes
            });
        },
        error: function(error) {
            console.error('Error al marcar el pedido como entregado:', error);
            Swal.fire('Error', 'Hubo un problema al procesar la solicitud', 'error');
        }
    });
}
