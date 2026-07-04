<?php

namespace App\Controller;

use App\Dto\LogEntreeDto;
use App\Entity\Boat;
use App\Entity\LogEntry;
use App\Entity\Port;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/trajets', name: 'api_trajets_')]
class LogEntreeController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private ValidatorInterface $validator,
        private SerializerInterface $serializer,
    ) {}

    #[Route('', name: 'liste', methods: ['GET'])]
    public function liste(): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $user = $this->getUser();

        $trajets = $this->em->getRepository(LogEntry::class)
            ->createQueryBuilder('l')
            ->join('l.boat', 'b')
            ->where('b.owner = :user')
            ->setParameter('user', $user)
            ->orderBy('l.departureDate', 'DESC')
            ->getQuery()
            ->getResult();

        return $this->json(array_map(fn(LogEntry $l) => $this->serialiser($l), $trajets));
    }

    #[Route('/{id}', name: 'detail', methods: ['GET'])]
    public function detail(int $id): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $trajet = $this->em->getRepository(LogEntry::class)->find($id);

        if (!$trajet) {
            return $this->json(['erreur' => 'Trajet introuvable.'], Response::HTTP_NOT_FOUND);
        }

        if ($trajet->getBoat()->getOwner() !== $this->getUser()) {
            return $this->json(['erreur' => 'Accès refusé.'], Response::HTTP_FORBIDDEN);
        }

        return $this->json($this->serialiser($trajet));
    }

    #[Route('', name: 'creer', methods: ['POST'])]
    public function creer(Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $dto = $this->serializer->deserialize($request->getContent(), LogEntreeDto::class, 'json');

        $erreurs = $this->validator->validate($dto);
        if (count($erreurs) > 0) {
            return $this->json($this->formaterErreurs($erreurs), Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $bateau = $this->em->getRepository(Boat::class)->find($dto->bateauId);
        if (!$bateau || $bateau->getOwner() !== $this->getUser()) {
            return $this->json(['erreur' => 'Bateau introuvable ou accès refusé.'], Response::HTTP_FORBIDDEN);
        }

        $portDepart = $this->em->getRepository(Port::class)->find($dto->portDepartId);
        if (!$portDepart) {
            return $this->json(['erreur' => 'Port de départ introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $portArrivee = $this->em->getRepository(Port::class)->find($dto->portArriveeId);
        if (!$portArrivee) {
            return $this->json(['erreur' => "Port d'arrivée introuvable."], Response::HTTP_NOT_FOUND);
        }

        $trajet = new LogEntry();
        $trajet->setBoat($bateau);
        $trajet->setDeparturePort($portDepart);
        $trajet->setArrivalPort($portArrivee);
        $trajet->setDepartureDate(new \DateTimeImmutable($dto->dateDepart));
        $trajet->setArrivalDate($dto->dateArrivee ? new \DateTimeImmutable($dto->dateArrivee) : null);
        $trajet->setDistanceNm($dto->distanceNm);
        $trajet->setNotes($dto->notes);

        $this->em->persist($trajet);
        $this->em->flush();

        return $this->json($this->serialiser($trajet), Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'modifier', methods: ['PUT'])]
    public function modifier(int $id, Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $trajet = $this->em->getRepository(LogEntry::class)->find($id);

        if (!$trajet) {
            return $this->json(['erreur' => 'Trajet introuvable.'], Response::HTTP_NOT_FOUND);
        }

        if ($trajet->getBoat()->getOwner() !== $this->getUser()) {
            return $this->json(['erreur' => 'Accès refusé.'], Response::HTTP_FORBIDDEN);
        }

        $dto = $this->serializer->deserialize($request->getContent(), LogEntreeDto::class, 'json');

        $erreurs = $this->validator->validate($dto);
        if (count($erreurs) > 0) {
            return $this->json($this->formaterErreurs($erreurs), Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $bateau = $this->em->getRepository(Boat::class)->find($dto->bateauId);
        if (!$bateau || $bateau->getOwner() !== $this->getUser()) {
            return $this->json(['erreur' => 'Bateau introuvable ou accès refusé.'], Response::HTTP_FORBIDDEN);
        }

        $portDepart = $this->em->getRepository(Port::class)->find($dto->portDepartId);
        if (!$portDepart) {
            return $this->json(['erreur' => 'Port de départ introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $portArrivee = $this->em->getRepository(Port::class)->find($dto->portArriveeId);
        if (!$portArrivee) {
            return $this->json(['erreur' => "Port d'arrivée introuvable."], Response::HTTP_NOT_FOUND);
        }

        $trajet->setBoat($bateau);
        $trajet->setDeparturePort($portDepart);
        $trajet->setArrivalPort($portArrivee);
        $trajet->setDepartureDate(new \DateTimeImmutable($dto->dateDepart));
        $trajet->setArrivalDate($dto->dateArrivee ? new \DateTimeImmutable($dto->dateArrivee) : null);
        $trajet->setDistanceNm($dto->distanceNm);
        $trajet->setNotes($dto->notes);

        $this->em->flush();

        return $this->json($this->serialiser($trajet));
    }

    #[Route('/{id}', name: 'supprimer', methods: ['DELETE'])]
    public function supprimer(int $id): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $trajet = $this->em->getRepository(LogEntry::class)->find($id);

        if (!$trajet) {
            return $this->json(['erreur' => 'Trajet introuvable.'], Response::HTTP_NOT_FOUND);
        }

        if ($trajet->getBoat()->getOwner() !== $this->getUser()) {
            return $this->json(['erreur' => 'Accès refusé.'], Response::HTTP_FORBIDDEN);
        }

        $this->em->remove($trajet);
        $this->em->flush();

        return $this->json(['message' => 'Trajet supprimé avec succès.']);
    }

    private function serialiser(LogEntry $trajet): array
    {
        return [
            'id'          => $trajet->getId(),
            'bateau'      => [
                'id'  => $trajet->getBoat()->getId(),
                'nom' => $trajet->getBoat()->getName(),
            ],
            'portDepart'  => [
                'id'   => $trajet->getDeparturePort()->getId(),
                'nom'  => $trajet->getDeparturePort()->getName(),
                'ville' => $trajet->getDeparturePort()->getCity(),
            ],
            'portArrivee' => [
                'id'   => $trajet->getArrivalPort()->getId(),
                'nom'  => $trajet->getArrivalPort()->getName(),
                'ville' => $trajet->getArrivalPort()->getCity(),
            ],
            'dateDepart'  => $trajet->getDepartureDate()->format('Y-m-d H:i:s'),
            'dateArrivee' => $trajet->getArrivalDate()?->format('Y-m-d H:i:s'),
            'distanceNm'  => $trajet->getDistanceNm(),
            'notes'       => $trajet->getNotes(),
            'creeLe'      => $trajet->getCreatedAt()->format('Y-m-d H:i:s'),
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
