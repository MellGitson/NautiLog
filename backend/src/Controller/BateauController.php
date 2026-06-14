<?php

namespace App\Controller;

use App\Dto\BateauDto;
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

#[Route('/api/bateaux', name: 'api_bateaux_')]
class BateauController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private ValidatorInterface $validator,
        private SerializerInterface $serializer,
    ) {}

    #[Route('', name: 'liste', methods: ['GET'])]
    public function liste(): JsonResponse
    {
        $bateaux = $this->em->getRepository(Boat::class)->findAll();
        $donnees = array_map(fn(Boat $bateau) => $this->serialiser($bateau), $bateaux);

        return $this->json($donnees, Response::HTTP_OK);
    }

    #[Route('/{id}', name: 'detail', methods: ['GET'])]
    public function detail(int $id): JsonResponse
    {
        $bateau = $this->em->getRepository(Boat::class)->find($id);

        if (!$bateau) {
            return $this->json(['erreur' => 'Bateau introuvable.'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($this->serialiser($bateau), Response::HTTP_OK);
    }

    #[Route('', name: 'creer', methods: ['POST'])]
    public function creer(Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_OWNER');

        $dto = $this->serializer->deserialize($request->getContent(), BateauDto::class, 'json');

        $erreurs = $this->validator->validate($dto);
        if (count($erreurs) > 0) {
            return $this->json($this->formaterErreurs($erreurs), Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $bateau = new Boat();
        $bateau->setName($dto->nom);
        $bateau->setType($dto->type);
        $bateau->setStatus($dto->statut);
        $bateau->setOwner($this->getUser());

        if ($dto->portId) {
            $port = $this->em->getRepository(Port::class)->find($dto->portId);
            if (!$port) {
                return $this->json(['erreur' => 'Port introuvable.'], Response::HTTP_NOT_FOUND);
            }
            $bateau->setPort($port);
        }

        $this->em->persist($bateau);
        $this->em->flush();

        return $this->json($this->serialiser($bateau), Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'modifier', methods: ['PUT'])]
    public function modifier(int $id, Request $request): JsonResponse
    {
        $bateau = $this->em->getRepository(Boat::class)->find($id);

        if (!$bateau) {
            return $this->json(['erreur' => 'Bateau introuvable.'], Response::HTTP_NOT_FOUND);
        }

        if ($bateau->getOwner() !== $this->getUser()) {
            return $this->json(['erreur' => 'Accès refusé : vous n\'êtes pas le propriétaire de ce bateau.'], Response::HTTP_FORBIDDEN);
        }

        $dto = $this->serializer->deserialize($request->getContent(), BateauDto::class, 'json');

        $erreurs = $this->validator->validate($dto);
        if (count($erreurs) > 0) {
            return $this->json($this->formaterErreurs($erreurs), Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $bateau->setName($dto->nom);
        $bateau->setType($dto->type);
        $bateau->setStatus($dto->statut);

        if ($dto->portId) {
            $port = $this->em->getRepository(Port::class)->find($dto->portId);
            if (!$port) {
                return $this->json(['erreur' => 'Port introuvable.'], Response::HTTP_NOT_FOUND);
            }
            $bateau->setPort($port);
        }

        $this->em->flush();

        return $this->json($this->serialiser($bateau), Response::HTTP_OK);
    }

    #[Route('/{id}', name: 'supprimer', methods: ['DELETE'])]
    public function supprimer(int $id): JsonResponse
    {
        $bateau = $this->em->getRepository(Boat::class)->find($id);

        if (!$bateau) {
            return $this->json(['erreur' => 'Bateau introuvable.'], Response::HTTP_NOT_FOUND);
        }

        if ($bateau->getOwner() !== $this->getUser()) {
            return $this->json(['erreur' => 'Accès refusé : vous n\'êtes pas le propriétaire de ce bateau.'], Response::HTTP_FORBIDDEN);
        }

        $this->em->remove($bateau);
        $this->em->flush();

        return $this->json(['message' => 'Bateau supprimé avec succès.'], Response::HTTP_OK);
    }

    private function serialiser(Boat $bateau): array
    {
        return [
            'id'          => $bateau->getId(),
            'nom'         => $bateau->getName(),
            'type'        => $bateau->getType(),
            'statut'      => $bateau->getStatus(),
            'creeLe'      => $bateau->getCreatedAt()?->format('Y-m-d H:i:s'),
            'proprietaire' => [
                'id'    => $bateau->getOwner()?->getId(),
                'email' => $bateau->getOwner()?->getEmail(),
            ],
            'port' => $bateau->getPort() ? [
                'id'   => $bateau->getPort()->getId(),
                'nom'  => $bateau->getPort()->getName(),
                'ville' => $bateau->getPort()->getCity(),
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
