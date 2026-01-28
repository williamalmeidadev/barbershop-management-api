import { authFetch } from './services/api';
import { requireAuth } from './utils/authGuard';

requireAuth();

async function loadData() {
  const response = await authFetch('http://localhost:3333/activities');
  const data = await response.json();
  console.log(data);
}

loadData();
const logoutBtn = document.getElementById('logout');

logoutBtn?.addEventListener('click', () => {
  localStorage.clear();
  window.location.href = 'login.html';
});