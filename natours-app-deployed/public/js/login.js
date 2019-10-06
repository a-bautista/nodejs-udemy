// The function from below will be exported
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password
      }
    });
    if (res.data.status === 'success') {
      showAlert('success', 'You logged in successfully');
      window.setTimeout(() => {
        location.assign('/'); // redirect to the home page after successful log in
      }, 1500);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout'
    });
    // the best solution would be to redirect the user to the home page after logging out
    // in the video the res.data.status is set to = but it would be ===
    if (res.data.status === 'success') location.reload(true);
  } catch (error) {
    showAlert('error', 'Error! Logging out! ');
  }
};
// This is going to be set in the index.js file.
/*
document.querySelector('.form').addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
*/
