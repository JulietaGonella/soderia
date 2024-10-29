$(document).ready(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const idProvincia = urlParams.get('id');

    // Verifica si se obtuvo un idProvincia de la URL
    if (idProvincia) {
        // Realiza la solicitud GET a la API
        $.get(`http://localhost:3000/provincias/${idProvincia}`, function(data) {
            // Muestra los datos en la consola
            console.log("Datos de la provincia:", data);
            
            // Rellena los campos del formulario con los datos de la provincia
            $('#idprovincia').val(data.ID); // Rellena el campo de ID
            $('#nombreprovincia').val(data.nombre); // Rellena el campo de nombre
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error("Error en la solicitud:", textStatus, errorThrown);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al obtener los datos de la provincia.'
            });
        });
    } else {
        console.log("No se proporcionó un ID de provincia en la URL.");
    }

    // Maneja el envío del formulario para actualizar la provincia
    $('#editProvinciaForm').submit(function(event) {
        event.preventDefault(); // Evita el envío tradicional del formulario

        const nombre = $('#nombreprovincia').val(); // Obtiene el nombre de la provincia

        // Realiza la solicitud PUT para actualizar la provincia
        $.ajax({
            url: `http://localhost:3000/provincias/${idProvincia}`,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ nombre }), // Envía solo el nombre
            success: function() {
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Provincia actualizada con éxito.'
                }).then(() => {
                    window.location.href = 'lugares.html'; // Redirige a la página de lugares
                });
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error("Error al actualizar la provincia:", textStatus, errorThrown);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al actualizar la provincia.'
                });
            }
        });
    });
});
