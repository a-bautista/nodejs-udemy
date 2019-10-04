import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe('pk_test_lMrAVQKlNFoF44EvYZBZQq8O00vVNXAcee');

export const bookTour = async tourId => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);
    // 2) Create checkout form + charge in credit card

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (error) {
    console.log(error);
    showAlert('error', error);
  }
};
