<?php

namespace App\Service;

use App\Entity\Berth;
use App\Entity\Boat;
use App\Entity\Notification;
use App\Entity\Repair;
use App\Entity\Reservation;
use App\Entity\Signalement;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class SuppressionCompteService
{
    public function __construct(
        private EntityManagerInterface $em,
        private NotificationService $notificationService,
    ) {
    }

    public function supprimerCompte(User $user): void
    {
        $bateaux = $this->em->getRepository(Boat::class)->findBy(['owner' => $user]);

        foreach ($bateaux as $bateau) {
            $this->notifierLocatairesEtSupprimerBateau($bateau);
        }

        // Réservations de cet utilisateur en tant que locataire sur les bateaux d'autrui.
        $reservationsLocataire = $this->em->getRepository(Reservation::class)->findBy(['renter' => $user]);
        foreach ($reservationsLocataire as $reservation) {
            $this->notificationService->detacherReservation($reservation);
            foreach ($this->em->getRepository(Signalement::class)->findBy(['reservation' => $reservation]) as $signalement) {
                $this->em->remove($signalement);
            }
            $this->em->remove($reservation);
        }

        $this->notificationService->notifierAdmins(
            \sprintf('Le compte "%s" a été supprimé (RGPD).', $user->getEmail())
        );

        // Flush séparé : les notifications détachées (UPDATE) doivent être persistées
        // avant que les réservations qu'elles référençaient soient supprimées, sans quoi
        // Doctrine peut ordonner le DELETE de la réservation avant l'UPDATE de la notif.
        $this->em->flush();

        foreach ($this->em->getRepository(Notification::class)->findBy(['recipient' => $user]) as $notification) {
            $this->em->remove($notification);
        }

        $this->em->remove($user);
        $this->em->flush();
    }

    private function notifierLocatairesEtSupprimerBateau(Boat $bateau): void
    {
        $reservations = $this->em->getRepository(Reservation::class)->findBy(['boat' => $bateau]);
        $suggestions = $this->trouverBateauxAlternatifs($bateau);

        foreach ($reservations as $reservation) {
            $notifierCeLocataire = $reservation->getRenter() !== $bateau->getOwner()
                && Reservation::STATUS_CANCELLED !== $reservation->getStatus();

            if ($notifierCeLocataire) {
                $this->notificationService->notifier(
                    $reservation->getRenter(),
                    Notification::TYPE_RGPD_SUPPRESSION,
                    \sprintf(
                        'Votre réservation sur "%s" du %s au %s a été annulée : le propriétaire a supprimé son compte.',
                        $bateau->getName(),
                        $reservation->getStartDate()->format('d/m/Y'),
                        $reservation->getEndDate()->format('d/m/Y')
                    ),
                    $suggestions
                );
            }

            $this->notificationService->detacherReservation($reservation);
            foreach ($this->em->getRepository(Signalement::class)->findBy(['reservation' => $reservation]) as $signalement) {
                $this->em->remove($signalement);
            }
            $this->em->remove($reservation);
        }

        foreach ($this->em->getRepository(Repair::class)->findBy(['boat' => $bateau]) as $reparation) {
            $this->em->remove($reparation);
        }

        foreach ($this->em->getRepository(Berth::class)->findBy(['boat' => $bateau]) as $emplacement) {
            $emplacement->setBoat(null);
        }

        $this->em->remove($bateau);
    }

    /**
     * @return array<int, array{id: int, nom: string, port: ?string}>
     */
    private function trouverBateauxAlternatifs(Boat $bateauSupprime): array
    {
        if (!$bateauSupprime->getPort()) {
            return [];
        }

        $alternatives = $this->em->getRepository(Boat::class)->createQueryBuilder('b')
            ->andWhere('b.port = :port')
            ->andWhere('b.id != :id')
            ->andWhere('b.status = :statut')
            ->setParameter('port', $bateauSupprime->getPort())
            ->setParameter('id', $bateauSupprime->getId())
            ->setParameter('statut', Boat::STATUS_AVAILABLE)
            ->setMaxResults(5)
            ->getQuery()
            ->getResult();

        return array_map(static fn (Boat $b) => [
            'id' => $b->getId(),
            'nom' => $b->getName(),
            'port' => $b->getPort()?->getName(),
        ], $alternatives);
    }
}
