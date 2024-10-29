$(document).ready(function () {
    // Obtener el ID de la categoría de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const idCategoria = urlParams.get('id');

    console.log("ID de categoría obtenido:", idCategoria); // Agregar esta línea para depuración

    // Verifica si se obtuvo un idCategoria de la URL
    if (idCategoria) {
        // Realiza la solicitud GET a la API para cargar los datos de la categoría
        $.get(`http://localhost:3000/categorias/${idCategoria}`, function (data) {
            // Muestra los datos en la consola
            console.log("Datos de la categoría:", data);

            // Establecer el valor del campo de ID
            $('#idcategoria').val(data.ID); // Agregar esta línea
            // Rellena el campo de nombre de categoría con los datos obtenidos
            $('#nombrecategoria').val(data.nombre); // Asegúrate de que el campo tenga el ID correcto
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.error("Error en la solicitud:", textStatus, errorThrown);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al obtener los datos de la categoría.',
            });
        });
    } else {
        console.log("No se proporcionó un ID de categoría en la URL.");
        Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'No se proporcionó un ID de categoría.',
        });
    }

    // Maneja el envío del formulario para actualizar la categoría
    $('#edit-category-form').submit(function (event) {
        event.preventDefault(); // Evita el envío tradicional del formulario

        const nombre = $('#nombrecategoria').val(); // Obtiene el nombre de la categoría

        // Realiza la solicitud PUT para actualizar la categoría
        $.ajax({
            url: `http://localhost:3000/categorias/${idCategoria}`,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ nombre }), // Envía solo el nombre
            success: function () {
                console.log('Categoría actualizada correctamente.'); // Mensaje en consola
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Categoría actualizada correctamente.',
                }).then(() => {
                    console.log('Redirigiendo a la lista de categorías...'); // Mensaje en consola
                    window.location.href = 'categorias.html'; // Redirige a la lista de categorías
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error("Error al actualizar la categoría:", textStatus, errorThrown);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al actualizar la categoría.',
                });
            }
        });
    });
});
