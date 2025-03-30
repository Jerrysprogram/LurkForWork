import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';

console.log('Let\'s go!');
function showLoginPage() {
    document.getElementById('login-page').classList.remove('hide');
    document.getElementById('register-page').classList.add('hide');
    document.getElementById('home-page').classList.add('hide');
 
    document.getElementById('main-header').style.display = 'none';
  }

  function showRegisterPage() {
    document.getElementById('login-page').classList.add('hide');
    document.getElementById('register-page').classList.remove('hide');
    document.getElementById('home-page').classList.add('hide');

    document.getElementById('main-header').style.display = 'none';
  }

  function showHomePage() {
    document.getElementById('login-page').classList.add('hide');
    document.getElementById('register-page').classList.add('hide');
    document.getElementById('home-page').classList.remove('hide');
  
    document.getElementById('main-header').style.display = 'block';
  }

  function showPage1() {
    document.getElementById('page1').classList.remove('hide');
    document.querySelectorAll('.page').forEach((dom) => {
      if (dom.id === 'page1') return;
      dom.classList.add('hide');
    });
  }

  function showPage2() {
    document.getElementById('page2').classList.remove('hide');
    document.querySelectorAll('.page').forEach((dom) => {
      if (dom.id === 'page2') return;
      dom.classList.add('hide');
    });
  }


  window.addEventListener('hashchange', function() {
    const hash = location.hash;
    console.log('当前 Hash 值为：', hash);

    switch (hash) {
      case '#/login':
        showLoginPage();
        break;
      case '#/register':
        showRegisterPage();
        break;
      case '#/feed':
        showHomePage();
        break;
      case '#/page1':
        showHomePage();
        showPage1();
        break;
      case '#/page2':
        showHomePage();
        showPage2();
        break;
      default:

        showLoginPage();
    }
  });


  if (!location.hash) {
    location.hash = '#/login';
  } else {

    window.dispatchEvent(new Event('hashchange'));
  }


document.getElementById('loginForm').addEventListener('submit', function (event) {

  event.preventDefault();
  

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  fetch('http://localhost:5005/auth/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        email: email,
        password: password
    })
  })
.then(data => {

  if (data.error) {
    // alert('Login failed: ' + data.error);
    showErrorPopup('Login failed: ' + data.error, 'error');

  } else {
    // alert('Login successful');
    showErrorPopup('Login successful', 'success');
    location.hash = '#/feed';
  }
})
.catch(error => {

  console.error('Login request error:', error);
  showErrorPopup('An error occurred during login', 'error');
  // alert('An error occurred during login');

});
});