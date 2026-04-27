import io from 'socket.io-client';

const getToken = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.token || '';
  } catch {
    return '';
  }
};

const socket = io('http://localhost:5000', {
  auth: {
    token: getToken()
  }
});

export default socket;
