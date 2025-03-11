// Configura Stripe con tu clave pública
const stripe = Stripe('pk_Live_51OpdmhJaeP6i0xi8jRwNDGcYTYdAwSApd8oNwL3oOcnm12IaGZnAWDxVefXYW1A5xQtemIcWbHEBk9DVNnnzBjG200wsAT4SJR'); // Reemplaza con tu clave pública de prueba

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

// Maneja el envío del formulario
const form = document.getElementById('formPago');
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  // Crea un token de pago con Stripe
  const { token, error } = await stripe.createToken(cardNumber, {
    name: document.getElementById('nombreApellidos').value.trim(),
  });

  if (error) {
    displayError.textContent = error.message;
  } else {
    displayError.textContent = '';
    console.log('Token generado:', token.id);
    // Aquí puedes enviar el token a tu servidor para procesar el pago
    alert('Pago procesado correctamente. Token: ' + token.id);
  }
});