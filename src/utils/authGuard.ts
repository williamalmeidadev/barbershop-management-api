export function requireAuth() {
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = '/server08/login';
  }
}
