<?php

namespace App\Controller;

use App\Dto\BerthDto;
use App\Entity\Berth;
use App\Entity\Boat;
use App\Entity\Port;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/ports/{portId}/emplacements', name: 'api_emplacements_')]
class BerthController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private ValidatorInterface $validator,
        private SerializerInterface $serializer,
    ) {
    }

    #[Route('', name: 'liste', methods: ['GET'])]
    public function liste(int $portId): JsonResponse
    {
        $port = $this->em->getRepository(Port::class)->find($portId);
        if (!$port) {
            return $this->json(['erreur' => 'Port introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $emplacements = $this->em->getRepository(Berth::class)->findBy(['port' => $port]);
        $donnees = array_map(fn (Berth $b) => $this->serialiser($b), $emplacements);

        return $this->json($donnees, Response::HTTP_OK);
    }

    #[Route('', name: 'creer', methods: ['POST'])]
    public function creer(int $portId, Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $port = $this->em->getRepository(Port::class)->find($portId);
        if (!$port) {
            return $this->json(['erreur' => 'Port introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $dto = $this->serializer->deserialize($request->getContent(), BerthDto::class, 'json');

        $erreurs = $this->validator->validate($dto);
        if (count($erreurs) > 0) {
            return $this->json($this->formaterErreurs($erreurs), Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $emplacement = new Berth();
        $emplacement->setPort($port);
        $emplacement->setLabel($dto->label);
        $emplacement->setLatitude($dto->latitude !== null ? (string) $dto->latitude : null);
        $emplacement->setLongitude($dto->longitude !== null ? (string) $dto->longitude : null);

        if ($dto->bateauId) {
            $bateau = $this->em->getRepository(Boat::class)->find($dto->bateauId);
            if (!$bateau) {
                return $this->json(['erreur' => 'Bateau introuvable.'], Response::HTTP_NOT_FOUND);
            }
            $emplacement->setBoat($bateau);
        }

        $this->em->persist($emplacement);
        $this->em->flush();

        return $this->json($this->serialiser($emplacement), Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'modifier', methods: ['PUT'])]
    public function modifier(int $portId, int $id, Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $emplacement = $this->em->getRepository(Berth::class)->find($id);
        if (!$emplacement || $emplacement->getPort()->getId() !== $portId) {
            return $this->json(['erreur' => 'Emplacement introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $dto = $this->serializer->deserialize($request->getContent(), BerthDto::class, 'json');

        $erreurs = $this->validator->validate($dto);
        if (count($erreurs) > 0) {
            return $this->json($this->formaterErreurs($erreurs), Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $emplacement->setLabel($dto->label);
        $emplacement->setLatitude($dto->latitude !== null ? (string) $dto->latitude : null);
        $emplacement->setLongitude($dto->longitude !== null ? (string) $dto->longitude : null);

        if ($dto->bateauId) {
            $bateau = $this->em->getRepository(Boat::class)->find($dto->bateauId);
            if (!$bateau) {
                return $this->json(['erreur' => 'Bateau introuvable.'], Response::HTTP_NOT_FOUND);
            }
            $emplacement->setBoat($bateau);
        } else {
            $emplacement->setBoat(null);
        }

        $this->em->flush();

        return $this->json($this->serialiser($emplacement), Response::HTTP_OK);
    }

    #[Route('/{id}', name: 'supprimer', methods: ['DELETE'])]
    public function supprimer(int $portId, int $id): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $emplacement = $this->em->getRepository(Berth::class)->find($id);
        if (!$emplacement || $emplacement->getPort()->getId() !== $portId) {
            return $this->json(['erreur' => 'Emplacement introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $this->em->remove($emplacement);
        $this->em->flush();

        return $this->json(['message' => 'Emplacement supprimé avec succès.'], Response::HTTP_OK);
    }

    private function serialiser(Berth $emplacement): array
    {
        return [
            'id' => $emplacement->getId(),
            'label' => $emplacement->getLabel(),
            'latitude' => $emplacement->getLatitude() !== null ? (float) $emplacement->getLatitude() : null,
            'longitude' => $emplacement->getLongitude() !== null ? (float) $emplacement->getLongitude() : null,
            'port' => [
                'id' => $emplacement->getPort()->getId(),
                'nom' => $emplacement->getPort()->getName(),
            ],
            'bateau' => $emplacement->getBoat() ? [
                'id' => $emplacement->getBoat()->getId(),
                'nom' => $emplacement->getBoat()->getName(),
                'statut' => $emplacement->getBoat()->getStatus(),
            ] : null,
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
