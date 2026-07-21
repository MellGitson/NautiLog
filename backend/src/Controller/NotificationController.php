<?php

namespace App\Controller;

use App\Entity\Notification;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/notifications', name: 'api_notifications_')]
class NotificationController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
    ) {
    }

    #[Route('', name: 'liste', methods: ['GET'])]
    public function liste(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $notifications = $this->em->getRepository(Notification::class)->findBy(
            ['recipient' => $user],
            ['createdAt' => 'DESC']
        );

        return $this->json(array_map(fn (Notification $n) => $this->serialiser($n), $notifications), Response::HTTP_OK);
    }

    #[Route('/{id}/lu', name: 'marquer_lu', methods: ['PATCH'])]
    public function marquerLu(int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $notification = $this->em->getRepository(Notification::class)->find($id);

        if (!$notification || $notification->getRecipient() !== $user) {
            return $this->json(['erreur' => 'Notification introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $notification->setRead(true);
        $this->em->flush();

        return $this->json($this->serialiser($notification), Response::HTTP_OK);
    }

    private function serialiser(Notification $notification): array
    {
        return [
            'id' => $notification->getId(),
            'message' => $notification->getMessage(),
            'suggestions' => $notification->getSuggestions(),
            'lu' => $notification->isRead(),
            'creeLe' => $notification->getCreatedAt()?->format('Y-m-d H:i:s'),
        ];
    }
}
