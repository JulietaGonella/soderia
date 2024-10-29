document.getElementById('entrarButton').addEventListener('click', async function() {  
    const email = document.getElementById('exampleInputEmail1').value;
    const password = document.getElementById('exampleInputPassword1').value;
    const errorMessage = document.getElementById('error-message');
    
    // Limpiar el mensaje de error antes de intentar iniciar sesión
    errorMessage.textContent = '';

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include' // Asegura que las cookies de sesión se envíen
        });
        

        const data = await response.json();

        if (data.success) {
            // Redirigir al panel de control
            window.location.href = '../PaneldeControl/Panelcontrol.html';
        } else {
            // Mostrar mensaje de error
            errorMessage.textContent = 'Correo o contraseña incorrectos';
        }
    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        errorMessage.textContent = 'Error en el servidor. Intente más tarde.';
    }
});
