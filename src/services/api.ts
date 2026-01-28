export async function authFetch(
    url: string,
    options: RequestInit = {}
) {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('Usuário não autenticado');
    }

    return fetch(url, {
        ...options,
        headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
}

export function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
}
