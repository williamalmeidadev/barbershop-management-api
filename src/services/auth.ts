export async function login(email: string, password: string) {
    const response = await fetch('/server08/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error('Credenciais inválidas');
    }

    const data = await response.json();

    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);

    return data;
}
