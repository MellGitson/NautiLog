<?php

namespace App\Controller;

use App\Dto\ReservationDto;
use App\Dto\ReservationStatutDto;
use App\Entity\Boat;
use App\Entity\Reservation;
use App\Entity\User;
use App\Security\Voter\BoatVoter;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/reservations', name: 'api_reservations_')]
class ReservationController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private ValidatorInterface $validator,
        private SerializerInterface $serializer,
    ) {
    }

    #[Route('', name: 'liste', methods: ['GET'])]
    public function liste(): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        /** @var User $user */
        $user = $this->getUser();

        if ($this->isGranted('ROLE_ADMIN')) {
            $reservations = $this->em->getRepository(Reservation::class)->findAll();
        } else {
            $reservations = $this->em->getRepository(Reservation::class)
                ->createQueryBuilder('r')
                ->join('r.boat', 'b')
                ->where('r.renter = :user OR b.owner = :user')
                ->setParameter('user', $user)
                ->orderBy('r.startDate', 'DESC')
                ->getQuery()
                ->getResult();
        }

        $donnees = array_map(fn (Reservation $r) => $this->serialiser($r), $reservations);

        return $this->json($donnees, Response::HTTP_OK);
    }

    #[Route('', name: 'creer', methods: ['POST'])]
    public function creer(Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        /** @var User $user */
        $user = $this->getUser();

        $dto = $this->serializer->deserialize($request->getContent(), ReservationDto::class, 'json');

        $erreurs = $this->validator->validate($dto);
        if (count($erreurs) > 0) {
            return $this->json($this->formaterErreurs($erreurs), Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $bateau = $this->em->getRepository(Boat::class)->find($dto->bateauId);
        if (!$bateau) {
            return $this->json(['erreur' => 'Bateau introuvable.'], Response::HTTP_NOT_FOUND);
        }

        try {
            $dateDebut = new \DateTimeImmutable($dto->dateDebut);
            $dateFin = new \DateTimeImmutable($dto->dateFin);
        } catch (\Exception) {
            return $this->json(['erreurs' => ['dateDebut' => 'Les dates fournies sont invalides.']], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ($dateFin < $dateDebut) {
            return $this->json(['erreurs' => ['dateFin' => 'La date de fin doit être postérieure à la date de début.']], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $chevauchement = $this->em->getRepository(Reservation::class)
            ->trouverChevauchement($bateau, $dateDebut, $dateFin);
        if ($chevauchement) {
            return $this->json(['erreur' => 'Ce bateau est déjà réservé sur cette période.'], Response::HTTP_CONFLICT);
        }

        $reservation = new Reservation();
        $reservation->setBoat($bateau);
        $reservation->setRenter($user);
        $reservation->setStartDate($dateDebut);
        $reservation->setEndDate($dateFin);

        $this->em->persist($reservation);
        $this->em->flush();

        return $this->json($this->serialiser($reservation), Response::HTTP_CREATED);
    }

    #[Route('/{id}/statut', name: 'modifier_statut', methods: ['PATCH'])]
    public function modifierStatut(int $id, Request $request): JsonResponse
    {
        $reservation = $this->em->getRepository(Reservation::class)->find($id);
        if (!$reservation) {
            return $this->json(['erreur' => 'Réservation introuvable.'], Response::HTTP_NOT_FOUND);
        }

        /** @var User $user */
        $user = $this->getUser();
        $estLocataire = $reservation->getRenter() === $user;
        $peutGererBateau = $this->isGranted(BoatVoter::EDIT, $reservation->getBoat());

        if (!$estLocataire && !$peutGererBateau) {
            return $this->json(['erreur' => 'Accès refusé.'], Response::HTTP_FORBIDDEN);
        }

        $dto = $this->serializer->deserialize($request->getContent(), ReservationStatutDto::class, 'json');

        $erreurs = $this->validator->validate($dto);
        if (count($erreurs) > 0) {
            return $this->json($this->formaterErreurs($erreurs), Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Un locataire ne peut qu'annuler sa propre réservation, pas la confirmer.
        if ($estLocataire && !$peutGererBateau && $dto->statut !== Reservation::STATUS_CANCELLED) {
            return $this->json(['erreur' => 'Vous ne pouvez qu\'annuler votre réservation.'], Response::HTTP_FORBIDDEN);
        }

        if ($dto->statut === Reservation::STATUS_CONFIRMED) {
            $chevauchement = $this->em->getRepository(Reservation::class)
                ->trouverChevauchement($reservation->getBoat(), $reservation->getStartDate(), $reservation->getEndDate(), $reservation->getId());
            if ($chevauchement) {
                return $this->json(['erreur' => 'Ce bateau est déjà réservé sur cette période.'], Response::HTTP_CONFLICT);
            }
        }

        $reservation->setStatus($dto->statut);
        $this->em->flush();

        return $this->json($this->serialiser($reservation), Response::HTTP_OK);
    }

    private function serialiser(Reservation $reservation): array
    {
        return [
            'id' => $reservation->getId(),
            'statut' => $reservation->getStatus(),
            'dateDebut' => $reservation->getStartDate()?->format('Y-m-d'),
            'dateFin' => $reservation->getEndDate()?->format('Y-m-d'),
            'creeLe' => $reservation->getCreatedAt()?->format('Y-m-d H:i:s'),
            'bateau' => [
                'id' => $reservation->getBoat()->getId(),
                'nom' => $reservation->getBoat()->getName(),
            ],
            'locataire' => [
                'id' => $reservation->getRenter()->getId(),
                'email' => $reservation->getRenter()->getEmail(),
            ],
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
