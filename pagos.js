// Configura Stripe con tu clave pública
const stripe = Stripe('pk_live_51OpdmhJaeP6i0xi8jRwNDGcYTYdAwSApd8oNwL3oOcnm12IaGZnAWDxVefXYW1A5xQtemIcWbHEBk9DVNnnzBjG200wsAT4SJR'); // Reemplaza con tu clave pública

// Crea una instancia de Elements
const elements = stripe.elements();

// Crea y monta los elementos de Stripe
const cardNumber = elements.create('cardNumber', {
  placeholder: 'Número de tarjeta',
  style: {
    base: {
      fontSize: '16px',
      color: '#32325d',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#fa755a'
    }
  }
});
cardNumber.mount('#card-number');

const cardExpiry = elements.create('cardExpiry', {
  placeholder: 'MM/AA',
  style: {
    base: {
      fontSize: '16px',
      color: '#32325d'
    }
  }
});
cardExpiry.mount('#card-expiry');

const cardCvc = elements.create('cardCvc', {
  placeholder: 'CVC',
  style: {
    base: {
      fontSize: '16px',
      color: '#32325d'
    }
  }
});
cardCvc.mount('#card-cvc');

// Maneja errores de la tarjeta
const displayError = document.getElementById('card-errors');
cardNumber.on('change', (event) => {
  displayError.textContent = event.error ? event.error.message : '';
});

// Función para validar los campos del formulario
function validarCampos() {
  const nombreApellidos = document.getElementById("nombreApellidos").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const correo = document.getElementById("correo").value.trim();

  if (!nombreApellidos || !telefono || !correo) {
    alert("Por favor, completa todos los campos del formulario.");
    return false;
  }

  if (!/^\d{9}$/.test(telefono)) {
    alert("El teléfono debe ser un número de 9 dígitos.");
    return false;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    alert("Por favor, introduce una dirección de correo válida.");
    return false;
  }

  return true;
}

// Maneja el envío del formulario
document.getElementById("formPago").addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validarCampos()) return;

  const total = parseFloat(document.getElementById("pagoTotal").textContent);

  try {
    const { token, error } = await stripe.createToken(cardNumber, {
      name: document.getElementById("nombreApellidos").value.trim(),
    });

    if (error) {
      displayError.textContent = error.message;
    } else {
      displayError.textContent = '';
      console.log('Token generado:', token.id);
      alert('Pago procesado correctamente. Token: ' + token.id);

      // Aquí puedes enviar el token al backend para procesar el pago
      const response = await fetch("/procesar-pago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token.id,
          amount: Math.round(total * 100),
          currency: 'eur',
          description: `Pago de trámite - ${document.getElementById("nombreApellidos").value.trim()}`
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert("Pago exitoso.");
        window.location.href = '/success'; // Redirección tras pago exitoso
      } else {
        alert("Hubo un problema al procesar el pago.");
      }
    }
  } catch (error) {
    console.error("Error al procesar el pago:", error.message);
    alert("Hubo un problema al realizar el pago. Por favor, inténtalo más tarde.");
  }
});