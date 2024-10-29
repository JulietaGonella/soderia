$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id'); // Obtiene el ID del usuario de los parámetros de la URL

    let originalNombre;
    let originalEmail;
    let originalRol;
    let originalContraseña;

    // Cargar datos del usuario
    if (userId) {
        $.get(`http://localhost:3000/usuarios/${userId}`, function (userData) {
            console.log("Datos del usuario recibidos:", userData);

            originalNombre = userData.nombre;
            originalEmail = userData.email;
            originalRol = userData.IDrol;
            originalContraseña = userData.contraseña;

            $('#idusuario').val(userData.ID);
            $('#nombre').val(originalNombre);
            $('#email').val(originalEmail);
            $('#rol').val(originalRol);
            $('#contraseña').val(originalContraseña);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.error("Error en la solicitud:", textStatus, errorThrown);
            Swal.fire('Error', 'No se pudo cargar el usuario.', 'error');
        });
    } else {
        console.log("No se proporcionó un ID de usuario en la URL.");
    }

    // Cargar roles en el dropdown
    $.get('http://localhost:3000/roles', function (roles) {
        roles.forEach(rol => {
            $('#rol').append(new Option(rol.nombre, rol.ID));
        });
    }).fail(function () {
        console.error('Error al cargar los roles.');
        Swal.fire('Error', 'No se pudieron cargar los roles.', 'error');
    });

    // Maneja el envío del formulario para actualizar los datos del usuario
    $('#editUserForm').submit(function (event) {
        event.preventDefault();

        const nombre = $('#nombre').val();
        const email = $('#email').val();
        const contraseña = $('#contraseña').val();
        const rol = $('#rol').val();

        let dataToUpdate = {};

        if (nombre && nombre !== originalNombre) {
            dataToUpdate.nombre = nombre;
        }
        if (email && email !== originalEmail) {
            dataToUpdate.email = email;
        }
        if (rol && rol !== originalRol) {
            dataToUpdate.rol = rol;
        }
        if (contraseña && contraseña !== originalContraseña) {
            dataToUpdate.contraseña = contraseña;
        }

        console.log("Datos a actualizar:", dataToUpdate);

        if (Object.keys(dataToUpdate).length > 0) {
            $.ajax({
                url: `http://localhost:3000/usuarios/${userId}`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(dataToUpdate),
                success: function () {
                    Swal.fire('Éxito', 'Usuario actualizado con éxito.', 'success').then(() => {
                        window.location.href = 'usuario.html';
                    });
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error("Error al actualizar el usuario:", textStatus, errorThrown);
                    Swal.fire('Error', 'No se pudo actualizar el usuario.', 'error');
                }
            });
        } else {
            console.log("No se detectaron cambios en el nombre, email, rol o contraseña.");
            Swal.fire('Aviso', 'No se detectaron cambios en el nombre, email, rol o contraseña.', 'info');
        }
    });

    // Funcionalidad para mostrar/ocultar la contraseña
    $('#togglePassword').click(function () {
        const passwordField = $('#contraseña');
        const passwordFieldType = passwordField.attr('type');
        passwordField.attr('type', passwordFieldType === 'password' ? 'text' : 'password');
    });
});
