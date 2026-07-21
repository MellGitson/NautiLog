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
}
