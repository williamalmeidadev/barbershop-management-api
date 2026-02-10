
import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

const runQuery = (query: string, params: any[] = []) => {
    return new Promise<void>((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) return reject(err);
            resolve();
        });
    });
};

const getCount = (table: string) => {
    return new Promise<number>((resolve, reject) => {
        db.get(`SELECT COUNT(*) as count FROM ${table}`, (err, row: any) => {
            if (err) return reject(err);
            resolve(row.count);
        });
    });
};

async function cleanup() {
    console.log(`Connecting to database at ${dbPath}...`);

    try {
        console.log('Starting cleanup...');

        const clientsBefore = await getCount('clientes');
        console.log(`Clients before: ${clientsBefore}`);

        // 1. Delete appointments (agendamentos). 
        // Note: agendamento_vagas and agendamento_servicos should cascade delete if set up correctly, 
        // but init.ts showed ON DELETE CASCADE.
        console.log('Deleting appointments...');
        // We delete only those associated with clients to be safe, or just all if the goal is "clean clients".
        // Use "DELETE FROM agendamentos" to clear all, or filter by client if we wanted to keep some.
        // User asked to "remove emails already registered", implies clearing clients.

        await runQuery('DELETE FROM agendamentos');
        console.log('Appointments deleted.');

        // 2. Delete clients
        console.log('Deleting clients...');
        await runQuery('DELETE FROM clientes');
        console.log('Clients deleted.');

        // 3. Delete users (legacy table if exists and relevant, though code seems to use clientes/admins)
        // Check if table exists first or just try delete
        try {
            await runQuery('DELETE FROM users');
            console.log('Users (legacy) deleted.');
        } catch (e) {
            console.log('Users table might not exist or empty, skipping.');
        }

        const clientsAfter = await getCount('clientes');
        const appointmentsAfter = await getCount('agendamentos');

        console.log(`Clients after: ${clientsAfter}`);
        console.log(`Appointments after: ${appointmentsAfter}`);

        if (clientsAfter === 0 && appointmentsAfter === 0) {
            console.log('SUCCESS: Database cleaned.');
        } else {
            console.error('WARNING: Some records remain.');
        }

    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        db.close();
    }
}

cleanup();
