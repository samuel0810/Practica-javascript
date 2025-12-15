const nombreUsuario = prompt("Por favor, introduce tu nombre:");

const anioNacimiento = parseInt(prompt("Por favor, introduce tu año de nacimiento (ej: 1990):"));

const anioActual = new Date().getFullYear();

let mensajeResultado = "";

if (!nombreUsuario) {
    mensajeResultado = "Hola. No introdujiste un nombre.";
} 

else if (isNaN(anioNacimiento) || anioNacimiento <= 1900 || anioNacimiento > anioActual) {
    mensajeResultado = `Hola, ${nombreUsuario}. El año de nacimiento introducido no es válido.`;
} 

else {
    const edad = anioActual - anioNacimiento;
    mensajeResultado = `Hola, ${nombreUsuario}. Tienes ${edad} años de edad.`;
}

const elementoResultado = document.getElementById("resultado-edad");

if (elementoResultado) {
    elementoResultado.textContent = mensajeResultado;
} else {
    console.error("No se encontró el elemento con el ID 'resultado-edad' en el HTML.");
    alert(mensajeResultado);
}