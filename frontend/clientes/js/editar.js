$(document).ready(function () { 
    const urlParams = new URLSearchParams(window.location.search);
    const clienteId = urlParams.get('id'); // Obtener ID del cliente desde la URL

    let originalIdbarrio;
    let originalIdlocalidad;

    // Cargar localidades y barrios al inicio
    $.when(
        $.get('http://localhost:3000/localidades'),
        $.get('http://localhost:3000/barrios')
    ).done(function (localidadList, barrioList) {
        // Cargar localidades en el dropdown
        localidadList[0].forEach(localidad => {
            $('#localidad').append(new Option(localidad.localidad, localidad.ID)); // Cambia 'localidad' por 'nombre'
        });

        // Cargar barrios en el dropdown
        barrioList[0].forEach(barrio => {
            $('#barrio').append(new Option(barrio.barrio, barrio.ID)); // Usar 'barrio' como etiqueta
        });

        // Cargar datos del cliente si se proporciona el ID
        if (clienteId) {
            $.get(`http://localhost:3000/cliente/${clienteId}`, function (cliente) {
                console.log("Datos del cliente recibidos:", cliente);

                originalIdbarrio = cliente.IDbarrio;
                originalIdlocalidad = cliente.IDlocalidad; // Guardar la localidad original

                // Rellenar el formulario con los datos del cliente
                $('#id').val(cliente.IDCliente); // Asumiendo que 'IDCliente' es devuelto correctamente
                $('#nombreyapellido').val(cliente.nombre);
                $('#telefono').val(cliente.telefono);
                $('#direccion').val(cliente.direccion);

                // Establecer localidad
                $('#localidad').val(originalIdlocalidad); 

                // Filtrar los barrios por localidad seleccionada
                cargarBarriosPorLocalidad(originalIdlocalidad, originalIdbarrio);
            }).fail(function (jqXHR, textStatus, errorThrown) {
                console.error("Error al cargar los datos del cliente:", textStatus, errorThrown);
                Swal.fire('Error', 'No se pudo cargar el cliente.', 'error');
            });
        } else {
            console.log("No se proporcionó un ID de cliente en la URL.");
        }
    }).fail(function () {
        console.error('Error al cargar las localidades o barrios.');
        Swal.fire('Error', 'No se pudieron cargar las localidades o barrios.', 'error');
    });

    // Función para cargar barrios según la localidad seleccionada
    function cargarBarriosPorLocalidad(localidadId, idBarrio) {
        // Filtrar los barrios por localidad
        $.get(`http://localhost:3000/barrios?IDlocalidad=${localidadId}`, function(barrioList) {
            $('#barrio').empty().append(new Option("Seleccione un barrio", "", true, true)); // Opción por defecto

            barrioList.forEach(barrio => {
                $('#barrio').append(new Option(barrio.barrio, barrio.ID)); // Usar 'barrio' como etiqueta

                // Seleccionar el barrio correspondiente al cliente
                if (barrio.ID === idBarrio) {
                    $('#barrio').val(idBarrio); // Seleccionar el barrio
                }
            });
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error("Error al cargar los barrios:", textStatus, errorThrown);
            Swal.fire('Error', 'No se pudieron cargar los barrios.', 'error');
        });
    }

    // Manejar el cambio en la localidad para recargar los barrios
    $('#localidad').change(function() {
        const localidadId = $(this).val(); // Obtener la localidad seleccionada
        cargarBarriosPorLocalidad(localidadId); // Llamar a cargar barrios cuando cambia la localidad
    });

    // Manejar el envío del formulario para actualizar el cliente
    $('#clienteEditForm').on('submit', function(event) {
        event.preventDefault(); // Prevenir el envío por defecto

        const clienteData = {
            nombre: $('#nombreyapellido').val(),
            telefono: $('#telefono').val(),
            IDbarrio: $('#barrio').val(),
            direccion: $('#direccion').val()
        };

        // Enviar datos al servidor para actualizar el cliente
        $.ajax({
            url: `http://localhost:3000/cliente/${clienteId}`,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(clienteData),
            success: function(response) {
                Swal.fire('Éxito', 'Cliente actualizado correctamente.', 'success').then(() => {
                    // Redirigir a la página de clientes después de un segundo
                    window.location.href = 'clientes.html';
                });
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error("Error al actualizar el cliente:", textStatus, errorThrown);
                Swal.fire('Error', 'No se pudo actualizar el cliente.', 'error');
            }
        });
    });
});
