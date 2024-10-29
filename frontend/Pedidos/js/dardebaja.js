$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const idPedido = urlParams.get('id');
    const diaId = urlParams.get('diaId');

    $('#idpedido').val(idPedido);
    let pedidoData = null; // Inicializamos la variable aquí

    // Obtener detalles del pedido por ID y diaId
    $.ajax({
        url: `http://localhost:3000/pedidos/${idPedido}/${diaId}`,
        method: 'GET',
        success: function (data) {
            if (data.length > 0) {
                pedidoData = data;
                let detallesIds = data.map(detalle => detalle.IDDetalle).join(', ');
                $('#iddetallepedido').val(detallesIds);

                // Mostrar el selector de opción para baja
                $('#opcion-baja').show();
                $('#fechas-baja').hide();
                $('#labefechafin').hide();
                $('#fecha-inicio').hide();
                $('#fecha-fin').hide();

                // Verifica el tipo de pedido
                switch (data[0].TipoPedido) {
                    case 'Unico':
                        $('#fecha-inicio').show(); // Mostrar solo el campo de fecha de inicio
                        break;
                    case 'Indefinido':
                        $('#fecha-inicio').val(new Date().toISOString().split('T')[0]); // Establecer fecha actual
                        break;
                    case 'Regular':
                    case 'Por Fechas':
                        $('#fecha-inicio').show(); // Mostrar campo de fecha de inicio
                        break;
                }
            } else {
                console.log('No se encontraron detalles para este pedido.');
            }
        },
        error: function (error) {
            console.error('Error al obtener detalles del pedido:', error);
        }
    });

    // Manejo de opciones de baja
    $('#opcion-baja').change(function () {
        const opcionBaja = $(this).val();
        if (opcionBaja === 'por-fecha') {
            $('#fechas-baja').show();
            const tipoPedido = pedidoData && pedidoData.length > 0 ? pedidoData[0].TipoPedido : '';

            if (tipoPedido === 'Unico') {
                $('#fecha-fin').hide(); // Oculta el campo de fecha fin si es único
                $('#labefechafin').hide();
            } else {
                $('#fecha-fin').show(); // Muestra el campo de fecha fin
                $('#labefechafin').show();
            }
        } else {
            $('#fechas-baja').hide();
            $('#fecha-inicio').val(''); // Limpiar campo de fecha de inicio
            $('#fecha-fin').val('');    // Limpiar campo de fecha fin
            $('#labefechafin').hide();
        }
    });

    // Inicializar los campos de fechas de baja
    $('#fechas-baja').hide();

    const hoy = new Date();
    const dd = String(hoy.getDate()).padStart(2, '0');
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const yyyy = hoy.getFullYear();
    const fechaMinima = `${yyyy}-${mm}-${dd}`;

    $('#fecha-inicio').attr('min', fechaMinima);
    $('#fecha-fin').attr('min', fechaMinima);

    // Manejo del formulario para dar de baja el pedido
    $('#form-dar-baja').submit(function (event) {
        event.preventDefault();

        const opcionBaja = $('#opcion-baja').val();
        let bajaIndefinida = 0;
        let fechaInicio = null;
        let fechaFin = null;

        if (opcionBaja === 'indefinido') {
            bajaIndefinida = 1;
            fechaInicio = new Date(); // Fecha actual
        } else if (opcionBaja === 'por-fecha') {
            fechaInicio = $('#fecha-inicio').val() ? new Date($('#fecha-inicio').val()) : null;
            fechaFin = $('#fecha-fin').val() ? new Date($('#fecha-fin').val()) : null;

            if (!fechaInicio || isNaN(fechaInicio.getTime())) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Por favor, ingrese una fecha de inicio válida para la baja.',
                    confirmButtonText: 'Aceptar'
                });
                return;
            } else if (fechaFin && fechaInicio >= fechaFin) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'La fecha de inicio debe ser anterior a la fecha de fin.',
                    confirmButtonText: 'Aceptar'
                });
                return;
            }
        }

        let datosAEnviar = {
            idpedido: idPedido,
            iddia: diaId,
            bajaIndefinida: bajaIndefinida,
            fechaInicio: fechaInicio ? fechaInicio.toISOString().split('T')[0] : null,
            fechaFin: bajaIndefinida ? null : (fechaFin ? fechaFin.toISOString().split('T')[0] : null),
            detalles: $('#iddetallepedido').val().split(',').map(id => ({ ID: id.trim() }))
        };

        $.ajax({
            url: 'http://localhost:3000/periodos_baja',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(datosAEnviar),
            success: function (response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Pedido dado de baja correctamente.',
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    window.location.href = 'pedidos.html';
                });
            },
            error: function (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al registrar la baja. Inténtalo de nuevo.',
                    confirmButtonText: 'Aceptar'
                });
            }
        });
    });

});
