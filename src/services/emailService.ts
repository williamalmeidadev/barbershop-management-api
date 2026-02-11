// src/services/emailService.ts
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export class EmailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    private getTemplate(fileName: string, variables: { [key: string]: string }) {
        const filePath = path.join(__dirname, '..', 'templates', 'email', fileName);
        let html = fs.readFileSync(filePath, 'utf8');

        Object.keys(variables).forEach(key => {
            const regex = new RegExp(`\\$\\{${key}\\}|\\{\\{${key}\\}\\}`, 'g');
            html = html.replace(regex, variables[key]);
        });

        return html;
    }

    async sendWelcomeEmail(to: string, nome: string) {
        const html = this.getTemplate('welcomeEmail.html', { nome });
        await this.send(to, "Bem-vindo à AlphaCuts! 💈", html);
    }

    async sendAppointmentConfirmation(to: string, nome: string, data: string) {
        const appLink = process.env.FRONTEND_URL || 'http://localhost:3000';
        const html = this.getTemplate('appointmentConfirmed.html', { nome, data, appLink });
        await this.send(to, "Agendamento Confirmado! ✂️", html);
    }

    async sendAdminNotification(details: string) {
        const adminLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin`;
        const html = this.getTemplate('appointmentScheduling.html', { details, adminLink });
        await this.send(process.env.ADMIN_EMAIL || '', "Novo Agendamento Recebido 📢", html);
    }

    async sendPaymentReceipt(to: string, nome: string, servico: string, valor: string) {
        const html = this.getTemplate('payedScheduling.html', { nome, servico, valor });
        await this.send(to, "Recibo do seu atendimento - AlphaCuts 💳", html);
    }

    async sendVerificationEmail(to: string, nome: string, token: string) {
        const link = `${process.env.API_URL || 'http://localhost:3333'}/auth/verify?token=${token}`;
        const html = this.getTemplate('verificationEmail.html', { nome, verificationLink: link });
        await this.send(to, "Verifique sua conta AlphaCuts 🔒", html);
    }

    private async send(to: string, subject: string, html: string) {
        try {
            await this.transporter.sendMail({
                from: '"AlphaCuts" <no-reply@alphacuts.com>',
                to,
                subject,
                html,
            });
        } catch (error) {
            console.error("Erro ao enviar e-mail:", error);
        }
    }
}