<?php

namespace App\Controller;

use App\Dto\PortDto;
use App\Entity\Berth;
use App\Entity\BerthRequest;
use App\Entity\Port;
use App\Service\WeatherService;
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
        private WeatherService $weatherService,
    ) {
    }

    #[Route('', name: 'liste', methods: ['GET'])]
    public function liste(): JsonResponse
    {
        $ports = $this->em->getRepository(Port::class)->findAll();
        $donnees = array_map(fn (Port $port) => $this->serialiser($port), $ports);

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

    #[Route('/{id}/meteo', name: 'meteo', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function meteo(int $id): JsonResponse
    {
        $port = $this->em->getRepository(Port::class)->find($id);

        if (!$port) {
            return $this->json(['erreur' => 'Port introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $meteo = $this->weatherService->meteoActuelle(
            (float) $port->getLatitude(),
            (float) $port->getLongitude(),
        );

        if (!$meteo) {
            return $this->json(['erreur' => 'Météo indisponible.'], Response::HTTP_SERVICE_UNAVAILABLE);
        }

        return $this->json($meteo, Response::HTTP_OK);
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

    #[Route('/lot', name: 'supprimer_lot', methods: ['DELETE'])]
    public function supprimerLot(Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $donnees = json_decode($request->getContent(), true);
        $ids = \is_array($donnees['ids'] ?? null) ? array_map('intval', $donnees['ids']) : [];

        if (empty($ids)) {
            return $this->json(['erreur' => 'Aucun identifiant fourni.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $ports = $this->em->getRepository(Port::class)->findBy(['id' => $ids]);
        $trouves = array_map(fn (Port $p) => $p->getId(), $ports);
        $introuvables = array_values(array_diff($ids, $trouves));

        $bloques = [];
        foreach ($ports as $port) {
            $obstacles = $this->obstaclesSuppression($port);
            if (!empty($obstacles)) {
                $bloques[] = ['id' => $port->getId(), 'nom' => $port->getName(), 'obstacles' => $obstacles];
            }
        }

        if (!empty($bloques)) {
            return $this->json([
                'erreur' => 'Certains ports contiennent encore des bateaux ou demandes en attente et ne peuvent pas être supprimés.',
                'bloques' => $bloques,
            ], Response::HTTP_CONFLICT);
        }

        foreach ($ports as $port) {
            $this->supprimerBerthsVides($port);
            $this->em->remove($port);
        }
        $this->em->flush();

        return $this->json([
            'supprimes' => $trouves,
            'introuvables' => $introuvables,
        ], Response::HTTP_OK);
    }

    #[Route('/{id}', name: 'supprimer', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function supprimer(int $id): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $port = $this->em->getRepository(Port::class)->find($id);

        if (!$port) {
            return $this->json(['erreur' => 'Port introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $obstacles = $this->obstaclesSuppression($port);
        if (!empty($obstacles)) {
            return $this->json([
                'erreur' => \sprintf('Ce port contient encore %d bateau(x) ou demande(s) en attente, à traiter avant de le supprimer.', \count($obstacles)),
                'obstacles' => $obstacles,
            ], Response::HTTP_CONFLICT);
        }

        $this->supprimerBerthsVides($port);
        $this->em->remove($port);
        $this->em->flush();

        return $this->json(['message' => 'Port supprimé avec succès.'], Response::HTTP_OK);
    }

    /**
     * @return array<int, array{type: string, bateau: ?string, emplacement: ?string, demandeur: ?string}>
     */
    private function obstaclesSuppression(Port $port): array
    {
        $obstacles = [];

        foreach ($port->getBoats() as $bateau) {
            $obstacles[] = [
                'type' => 'bateau_amarre',
                'bateau' => $bateau->getName(),
                'emplacement' => null,
                'demandeur' => null,
            ];
        }

        foreach ($this->em->getRepository(Berth::class)->findBy(['port' => $port]) as $berth) {
            $demandesEnAttente = $this->em->getRepository(BerthRequest::class)
                ->findBy(['berth' => $berth, 'status' => BerthRequest::STATUS_PENDING]);

            foreach ($demandesEnAttente as $demande) {
                $obstacles[] = [
                    'type' => 'demande_en_attente',
                    'bateau' => $demande->getBoat()->getName(),
                    'emplacement' => $berth->getLabel(),
                    'demandeur' => $demande->getRequester()->getEmail(),
                ];
            }
        }

        return $obstacles;
    }

    private function supprimerBerthsVides(Port $port): void
    {
        foreach ($this->em->getRepository(Berth::class)->findBy(['port' => $port]) as $berth) {
            foreach ($this->em->getRepository(BerthRequest::class)->findBy(['berth' => $berth]) as $demande) {
                $this->em->remove($demande);
            }
            $this->em->remove($berth);
        }
    }

    private function serialiser(Port $port): array
    {
        return [
            'id' => $port->getId(),
            'nom' => $port->getName(),
            'ville' => $port->getCity(),
            'latitude' => (float) $port->getLatitude(),
            'longitude' => (float) $port->getLongitude(),
            'capacite' => $port->getCapacity(),
            'bateaux' => $port->getBoats()->count(),
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
