export interface IUser {
    id: string;
    email: string;
    role: 'admin' | 'user'; // Define que só aceitamos esses dois tipos
}