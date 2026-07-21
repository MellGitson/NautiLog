<?php

namespace App\Controller;

use App\Dto\SignalementDto;
use App\Dto\SignalementReponseDto;
use App\Entity\Notification;
use App\Entity\Reservation;
use App\Entity\Signalement;
use App\Entity\User;
use App\Security\Voter\BoatVoter;
use App\Service\MailService;
use App\Service\NotificationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/signalements', name: 'api_signalements_')]
class SignalementController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private ValidatorInterface $validator,
        private SerializerInterface $serializer,
        private NotificationService $notificationService,
        private MailService $mailService,
    ) {
    }

    #[Route('', name: 'liste', methods: ['GET'])]
    public function liste(): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        /** @var User $user */
        $user = $this->getUser();

        if ($this->isGranted('ROLE_ADMIN')) {
            $signalements = $this->em->getRepository(Signalement::class)->findAll();
        } else {
            $signalements = $this->em->getRepository(Signalement::class)->findBy(['auteur' => $user]);
        }

        usort($signalements, static function (Signalement $a, Signalement $b) {
            if ($a->getStatus() !== $b->getStatus()) {
                return $a->getStatus() === Signalement::STATUS_OUVERT ? -1 : 1;
            }

            return $b->getCreatedAt() <=> $a->getCreatedAt();
        });

        return $this->json(array_map(fn (Signalement $s) => $this->serialiser($s), $signalements), Response::HTTP_OK);
    }

    #[Route('', name: 'creer', methods: ['POST'])]
    public function creer(Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        /** @var User $user */
        $user = $this->getUser();

        $dto = $this->serializer->deserialize($request->getContent(), SignalementDto::class, 'json');

        $erreurs = $this->validator->validate($dto);
        if (count($erreurs) > 0) {
            return $this->json($this->formaterErreurs($erreurs), Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $reservation = $this->em->getRepository(Reservation::class)->find($dto->reservationId);
        if (!$reservation) {
            return $this->json(['erreur' => 'Réservation introuvable.'], Response::HTTP_NOT_FOUND);
        }

        if (!$this->isGranted(BoatVoter::EDIT, $reservation->getBoat())) {
            return $this->json(['erreur' => 'Accès refusé.'], Response::HTTP_FORBIDDEN);
        }

        $signalement = new Signalement();
        $signalement->setReservation($reservation);
        $signalement->setAuteur($user);
        $signalement->setMessage($dto->message);

        $this->em->persist($signalement);

        $this->notificationService->notifierAdmins(
            \sprintf('Nouveau signalement sur la réservation du bateau "%s".', $reservation->getBoat()->getName()),
            $reservation
        );

        $this->em->flush();

        return $this->json($this->serialiser($signalement), Response::HTTP_CREATED);
    }

    #[Route('/{id}/repondre', name: 'repondre', methods: ['PATCH'])]
    public function repondre(int $id, Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $signalement = $this->em->getRepository(Signalement::class)->find($id);
        if (!$signalement) {
            return $this->json(['erreur' => 'Signalement introuvable.'], Response::HTTP_NOT_FOUND);
        }

        /** @var User $admin */
        $admin = $this->getUser();

        $dto = $this->serializer->deserialize($request->getContent(), SignalementReponseDto::class, 'json');

        $erreurs = $this->validator->validate($dto);
        if (count($erreurs) > 0) {
            return $this->json($this->formaterErreurs($erreurs), Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $signalement->setReponseAdmin($dto->reponse);
        $signalement->setStatus(Signalement::STATUS_REPONDU);
        $signalement->setRepondantAdmin($admin);
        $signalement->setRespondedAt(new \DateTimeImmutable());

        $proprietaire = $signalement->getAuteur();

        $this->notificationService->notifier(
            $proprietaire,
            Notification::TYPE_SIGNALEMENT_REPONSE,
            \sprintf(
                'L\'administrateur a répondu à votre signalement sur la réservation du bateau "%s".',
                $signalement->getReservation()->getBoat()->getName()
            ),
            null,
            $signalement->getReservation()
        );

        $this->em->flush();

        $this->mailService->envoyerAlerteSignalementRepondu($proprietaire->getEmail());

        return $this->json($this->serialiser($signalement), Response::HTTP_OK);
    }

    private function serialiser(Signalement $s): array
    {
        return [
            'id' => $s->getId(),
            'reservationId' => $s->getReservation()?->getId(),
            'auteurEmail' => $s->getAuteur()?->getEmail(),
            'bateauNom' => $s->getReservation()?->getBoat()?->getName(),
            'message' => $s->getMessage(),
            'reponseAdmin' => $s->getReponseAdmin(),
            'statut' => $s->getStatus(),
            'creeLe' => $s->getCreatedAt()?->format('Y-m-d H:i:s'),
            'reponduLe' => $s->getRespondedAt()?->format('Y-m-d H:i:s'),
        ];
    }

    private function formaterErreurs(mixed $erreurs): array
    {
        $messages = [];
        foreach ($erreurs as $erreur) {
            $messages[$erreur->getPropertyPath()] = $erreur->getMessage();
        }

        return ['erreurs' => $messages];
    }
}
