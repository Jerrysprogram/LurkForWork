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