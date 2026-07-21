<?php

namespace App\Service;

use App\Entity\Notification;
use App\Entity\Reservation;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class NotificationService
{
    public function __construct(
        private EntityManagerInterface $em,
    ) {
    }

    public function notifier(
        User $recipient,
        string $type,
        string $message,
        ?array $suggestions = null,
        ?Reservation $reservation = null,
    ): Notification {
        $notification = new Notification();
        $notification->setRecipient($recipient);
        $notification->setType($type);
        $notification->setMessage($message);
        $notification->setSuggestions($suggestions);
        $notification->setReservation($reservation);
        $this->em->persist($notification);

        return $notification;
    }

    /**
     * Détache les notifications existantes de la réservation qu'on s'apprête à
     * supprimer (la relation Notification -> Reservation est nullable, la notif
     * reste visible mais perd simplement son lien cliquable). Couvre aussi les
     * notifications tout juste créées mais pas encore flush (non trouvables via
     * une requête SQL classique).
     */
    public function detacherReservation(Reservation $reservation): void
    {
        $notifications = $this->em->getRepository(Notification::class)->findBy(['reservation' => $reservation]);
        foreach ($notifications as $notification) {
            $notification->setReservation(null);
        }

        foreach ($this->em->getUnitOfWork()->getScheduledEntityInsertions() as $entity) {
            if ($entity instanceof Notification && $entity->getReservation() === $reservation) {
                $entity->setReservation(null);
            }
        }
    }

    /**
     * Notifie tous les administrateurs (activité générique). Ne flush pas :
     * l'appelant est responsable du flush final de sa transaction.
     */
    public function notifierAdmins(string $message, ?Reservation $reservation = null): void
    {
        $admins = array_filter(
            $this->em->getRepository(User::class)->findAll(),
            static fn (User $u) => \in_array('ROLE_ADMIN', $u->getRoles(), true)
        );

        foreach ($admins as $admin) {
            $this->notifier($admin, Notification::TYPE_ADMIN_ACTIVITE, $message, null, $reservation);
        }
    }
}
