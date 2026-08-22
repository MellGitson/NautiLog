<?php

namespace App\Service;

use Psr\Log\LoggerInterface;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

class MailService
{
    private const EXPEDITEUR = 'no-reply@nautilog.fr';

    public function __construct(
        private MailerInterface $mailer,
        private LoggerInterface $logger,
        private string $contactDestinataire,
    ) {
    }

    public function envoyerAlerteSignalementRepondu(string $destinataire): void
    {
        $email = (new Email())
            ->from(self::EXPEDITEUR)
            ->to($destinataire)
            ->subject('NautiLog — Réponse à votre signalement')
            ->text(
                "Bonjour,\n\n"
                ."L'administrateur NautiLog a répondu à votre signalement.\n"
                ."Connectez-vous à votre espace pour consulter la réponse dans vos notifications.\n\n"
                .'— L\'équipe NautiLog'
            );

        try {
            $this->mailer->send($email);
        } catch (TransportExceptionInterface $e) {
            $this->logger->error('Échec de l\'envoi de l\'email de notification de signalement.', [
                'destinataire' => $destinataire,
                'exception' => $e->getMessage(),
            ]);
        }
    }

    public function envoyerMessageContact(string $nom, string $expediteur, string $message): bool
    {
        $email = (new Email())
            ->from(self::EXPEDITEUR)
            ->to($this->contactDestinataire)
            ->replyTo($expediteur)
            ->subject(\sprintf('NautiLog — Nouveau message de contact de %s', $nom))
            ->text(
                "Nouveau message via le formulaire de contact du site.\n\n"
                ."Nom : {$nom}\n"
                ."Email : {$expediteur}\n\n"
                ."Message :\n{$message}"
            );

        try {
            $this->mailer->send($email);

            return true;
        } catch (TransportExceptionInterface $e) {
            $this->logger->error('Échec de l\'envoi de l\'email de contact.', [
                'expediteur' => $expediteur,
                'exception' => $e->getMessage(),
            ]);

            return false;
        }
    }
}
