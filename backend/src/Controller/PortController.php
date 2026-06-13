<?php

namespace App\Controller;

use App\Dto\PortDto;
use App\Entity\Port;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/ports', name: 'api_ports_')]
class PortController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private ValidatorInterface $validator,
        private SerializerInterface $serializer,
    ) {}

    #[Route('', name: 'liste', methods: ['GET'])]
    public function liste(): JsonResponse
    {
        $ports = $this->em->getRepository(Port::class)->findAll();
        $donnees = array_map(fn(Port $port) => $this->serialiser($port), $ports);

        return $this->json($donnees, Response::HTTP_OK);
    }

    #[Route('/{id}', name: 'detail', methods: ['GET'])]
    public function detail(int $id): JsonResponse
    {
        $port = $this->em->getRepository(Port::class)->find($id);

        if (!$port) {
            return $this->json(['erreur' => 'Port introuvable.'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($this->serialiser($port), Response::HTTP_OK);
    }

    #[Route('', name: 'creer', methods: ['POST'])]
    public function creer(Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $dto = $this->serializer->deserialize($request->getContent(), PortDto::class, 'json');

        $erreurs = $this->validator->validate($dto);
        if (count($erreurs) > 0) {
            return $this->json($this->formaterErreurs($erreurs), Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $port = new Port();
        $port->setName($dto->nom);
        $port->setCity($dto->ville);
        $port->setLatitude((string) $dto->latitude);
        $port->setLongitude((string) $dto->longitude);
        $port->setCapacity($dto->capacite);

        $this->em->persist($port);
        $this->em->flush();

        return $this->json($this->serialiser($port), Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'modifier', methods: ['PUT'])]
    public function modifier(int $id, Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $port = $this->em->getRepository(Port::class)->find($id);

        if (!$port) {
            return $this->json(['erreur' => 'Port introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $dto = $this->serializer->deserialize($request->getContent(), PortDto::class, 'json');

        $erreurs = $this->validator->validate($dto);
        if (count($erreurs) > 0) {
            return $this->json($this->formaterErreurs($erreurs), Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $port->setName($dto->nom);
        $port->setCity($dto->ville);
        $port->setLatitude((string) $dto->latitude);
        $port->setLongitude((string) $dto->longitude);
        $port->setCapacity($dto->capacite);

        $this->em->flush();

        return $this->json($this->serialiser($port), Response::HTTP_OK);
    }

    #[Route('/{id}', name: 'supprimer', methods: ['DELETE'])]
    public function supprimer(int $id): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $port = $this->em->getRepository(Port::class)->find($id);

        if (!$port) {
            return $this->json(['erreur' => 'Port introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $this->em->remove($port);
        $this->em->flush();

        return $this->json(['message' => 'Port supprimé avec succès.'], Response::HTTP_OK);
    }

    private function serialiser(Port $port): array
    {
        return [
            'id'        => $port->getId(),
            'nom'       => $port->getName(),
            'ville'     => $port->getCity(),
            'latitude'  => (float) $port->getLatitude(),
            'longitude' => (float) $port->getLongitude(),
            'capacite'  => $port->getCapacity(),
            'bateaux'   => $port->getBoats()->count(),
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
