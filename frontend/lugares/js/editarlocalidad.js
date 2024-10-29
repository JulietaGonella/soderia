$(document).ready(function() {  
    const urlParams = new URLSearchParams(window.location.search);
    const idLocalidad = urlParams.get('id');

    let originalNombre;
    let originalIdProvincia; // Variable para almacenar el ID de la provincia original

    // Cargar provincias en el dropdown
    $.get('http://localhost:3000/provincias', function(data) {
        data.forEach(provincia => {
            $('#provincia').append(new Option(provincia.nombre, provincia.ID));
        });

        // Cargar localidad si se proporciona el ID
        if (idLocalidad) {
            $.get(`http://localhost:3000/localidades/${idLocalidad}`, function(data) {
                console.log("Datos de la localidad recibidos:", data);

                originalNombre = data.nombre;
                originalIdProvincia = data.IDprovincia; // Almacena el ID de la provincia original

                $('#idlocalidad').val(data.ID);
                $('#nombrelocalidad').val(originalNombre);
                $('#provincia').val(originalIdProvincia); // Selecciona la provincia correcta
            }).fail(function(jqXHR, textStatus, errorThrown) {
                console.error("Error en la solicitud:", textStatus, errorThrown);
                Swal.fire('Error', 'No se pudo cargar la localidad.', 'error');
            });
        } else {
            console.log("No se proporcionó un ID de localidad en la URL.");
        }
    }).fail(function() {
        console.error('Error al cargar las provincias.');
        Swal.fire('Error', 'No se pudieron cargar las provincias.', 'error');
    });

    // Maneja el envío del formulario para actualizar el nombre de la localidad y la provincia
    $('form').submit(function(event) {
        event.preventDefault(); // Evita el envío tradicional del formulario

        const nombre = $('#nombrelocalidad').val();
        const idProvincia = $('#provincia').val(); // Obtiene el ID de la provincia seleccionada

        // Prepara los datos a actualizar
        let dataToUpdate = {};

        // Verifica si hay un cambio en el nombre o en la provincia
        if (nombre && nombre !== originalNombre) {
            dataToUpdate.nombre = nombre; // Solo actualiza el nombre
        }
        if (idProvincia && idProvincia !== originalIdProvincia) {
            dataToUpdate.idProvincia = idProvincia; // Actualiza el ID de la provincia
        }

        // Debug: Verifica los datos que se están enviando
        console.log("Datos a actualizar:", dataToUpdate);

        // Realiza la solicitud de actualización solo si hay cambios
        if (Object.keys(dataToUpdate).length > 0) {
            $.ajax({
                url: `http://localhost:3000/localidades/${idLocalidad}`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(dataToUpdate),
                success: function(response) {
                    // Mostrar alerta de éxito
                    Swal.fire('Éxito', 'Localidad actualizada con éxito.', 'success').then(() => {
                        // Redirigir a lugares.html
                        window.location.href = 'lugares.html';
                    });
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error("Error al actualizar la localidad:", textStatus, errorThrown);
                    Swal.fire('Error', 'No se pudo actualizar la localidad.', 'error');
                }
            });
        } else {
            console.log("No se detectaron cambios en el nombre o en la provincia.");
            Swal.fire('Aviso', 'No se detectaron cambios en el nombre o en la provincia.', 'info');
        }
    });
});
