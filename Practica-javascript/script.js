// Solicitar el nombre del usuario
const nombreUsuario = prompt("Por favor, introduce tu nombre:");

// Solicitar el año de nacimiento
// Usamos parseInt() para asegurarnos de que el valor sea un número entero
const anioNacimiento = parseInt(prompt("Por favor, introduce tu año de nacimiento (ej: 1990):"));

// Obtener el año actual
// Creamos un nuevo objeto Date y usamos el método getFullYear()
const anioActual = new Date().getFullYear();

// Variable para almacenar el mensaje a mostrar
let mensajeResultado = "";

// 1. Validar que se haya introducido un nombre
if (!nombreUsuario) {
    mensajeResultado = "Hola. No introdujiste un nombre.";
} 
// 2. Validar que el año de nacimiento sea un número válido y razonable
else if (isNaN(anioNacimiento) || anioNacimiento <= 1900 || anioNacimiento > anioActual) {
    mensajeResultado = `Hola, ${nombreUsuario}. El año de nacimiento introducido no es válido.`;
} 
// 3. Si todo es válido, calcular la edad y generar el mensaje
else {
    const edad = anioActual - anioNacimiento;
    mensajeResultado = `Hola, ${nombreUsuario}. Tienes ${edad} años de edad.`;
}

// Encontrar el elemento <h2> por su ID y actualizar su contenido
// Necesitarás añadir un ID al elemento <h2> en tu HTML (ver la sección siguiente)
const elementoResultado = document.getElementById("resultado-edad");

// Verificar si el elemento existe antes de intentar cambiar su contenido
if (elementoResultado) {
    elementoResultado.textContent = mensajeResultado;
} else {
    // Esto es un mensaje de respaldo si el ID no existe en el HTML
    console.error("No se encontró el elemento con el ID 'resultado-edad' en el HTML.");
    alert(mensajeResultado); // Muestra el mensaje en una alerta si no se puede poner en el HTML
}