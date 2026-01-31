import { authFetch } from './services/api';
import { requireAuth } from './utils/authGuard';

requireAuth();

async function loadData() {
  const response = await authFetch('/server08/teste');
  const data = await response.json();
  console.log(data);
}

loadData();
const logoutBtn = document.getElementById('logout');

logoutBtn?.addEventListener('click', () => {
  localStorage.clear();
  window.location.href = '/server08/login';
});
