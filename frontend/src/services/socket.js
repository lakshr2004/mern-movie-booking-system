import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : ''
  }
});

export default socket;
