<?php

namespace App\Controller;

use App\Dto\BateauDto;
use App\Entity\Boat;
use App\Entity\LogEntry;
use App\Entity\Port;
use App\Security\Voter\BoatVoter;
use App\Service\CarnetPdfService;
use App\Service\UploadService;
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
        private UploadService $uploadService,
        private CarnetPdfService $carnetPdfService,
    ) {
    }

    #[Route('', name: 'liste', methods: ['GET'])]
    public function liste(): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $utilisateur = $this->getUser();
        $estProprietaireSeul = \in_array('ROLE_OWNER', $utilisateur->getRoles(), true)
            && !\in_array('ROLE_ADMIN', $utilisateur->getRoles(), true)
            && !\in_array('ROLE_RENTER', $utilisateur->getRoles(), true);

        if ($estProprietaireSeul) {
            $bateaux = $this->em->getRepository(Boat::class)->findBy(['owner' => $utilisateur]);
        } else {
            $bateaux = $this->em->getRepository(Boat::class)->findAll();
        }

        $donnees = array_map(fn (Boat $bateau) => $this->serialiser($bateau), $bateaux);

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

        $dto = $request->files->count() > 0
            ? $this->deserialiserDepuisFormulaire($request)
            : $this->serializer->deserialize($request->getContent(), BateauDto::class, 'json');

        $erreurs = $this->validator->validate($dto);
        if (count($erreurs) > 0) {
            return $this->json($this->formaterErreurs($erreurs), Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $photo = $request->files->get('photo');
        $photoUrl = null;
        if ($photo) {
            try {
                $photoUrl = $this->uploadService->uploaderPhotoBateau($photo);
            } catch (\InvalidArgumentException $e) {
                return $this->json(['erreur' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        $bateau = new Boat();
        $bateau->setName($dto->nom);
        $bateau->setType($dto->type);
        $bateau->setStatus($dto->statut);
        $bateau->setDescription($dto->description);
        $bateau->setOwner($this->getUser());

        if ($photoUrl) {
            $bateau->setPhotoUrl($photoUrl);
        }

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

    private function deserialiserDepuisFormulaire(Request $request): BateauDto
    {
        $dto = new BateauDto();
        $dto->nom = (string) $request->request->get('nom', '');
        $dto->type = (string) $request->request->get('type', '');
        $dto->statut = (string) $request->request->get('statut', Boat::STATUS_AVAILABLE);
        $portId = $request->request->get('portId');
        $dto->portId = $portId !== null && $portId !== '' ? (int) $portId : null;
        $description = $request->request->get('description');
        $dto->description = $description !== null && $description !== '' ? (string) $description : null;

        return $dto;
    }

    #[Route('/{id}', name: 'modifier', methods: ['PUT'])]
    public function modifier(int $id, Request $request): JsonResponse
    {
        $bateau = $this->em->getRepository(Boat::class)->find($id);

        if (!$bateau) {
            return $this->json(['erreur' => 'Bateau introuvable.'], Response::HTTP_NOT_FOUND);
        }

        if (!$this->isGranted(BoatVoter::EDIT, $bateau)) {
            return $this->json(['erreur' => 'Accès refusé : vous n\'êtes pas le propriétaire de ce bateau.'], Response::HTTP_FORBIDDEN);
        }

        $dto = $this->serializer->deserialize($request->getContent(), BateauDto::class, 'json');

        $erreurs = $this->validator->validate($dto);
        if (count($erreurs) > 0) {
            return $this->json($this->formaterErreurs($erreurs), Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (
            $bateau->getStatus() === Boat::STATUS_REPAIR
            && $dto->statut !== Boat::STATUS_REPAIR
            && !$this->isGranted('ROLE_ADMIN')
        ) {
            return $this->json(['erreur' => 'Seul un administrateur peut changer le statut d\'un bateau en réparation.'], Response::HTTP_FORBIDDEN);
        }

        $bateau->setName($dto->nom);
        $bateau->setType($dto->type);
        $bateau->setStatus($dto->statut);
        $bateau->setDescription($dto->description);

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

        if (!$this->isGranted(BoatVoter::DELETE, $bateau)) {
            return $this->json(['erreur' => 'Accès refusé : vous n\'êtes pas le propriétaire de ce bateau.'], Response::HTTP_FORBIDDEN);
        }

        $this->em->remove($bateau);
        $this->em->flush();

        return $this->json(['message' => 'Bateau supprimé avec succès.'], Response::HTTP_OK);
    }

    #[Route('/{id}/photo', name: 'photo', methods: ['POST'])]
    public function uploaderPhoto(int $id, Request $request): JsonResponse
    {
        $bateau = $this->em->getRepository(Boat::class)->find($id);

        if (!$bateau) {
            return $this->json(['erreur' => 'Bateau introuvable.'], Response::HTTP_NOT_FOUND);
        }

        if (!$this->isGranted(BoatVoter::EDIT, $bateau)) {
            return $this->json(['erreur' => 'Accès refusé : vous n\'êtes pas le propriétaire de ce bateau.'], Response::HTTP_FORBIDDEN);
        }

        $fichier = $request->files->get('photo');
        if (!$fichier) {
            return $this->json(['erreur' => 'Aucun fichier reçu.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $photoUrl = $this->uploadService->uploaderPhotoBateau($fichier);
        } catch (\InvalidArgumentException $e) {
            return $this->json(['erreur' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $bateau->setPhotoUrl($photoUrl);
        $this->em->flush();

        return $this->json($this->serialiser($bateau), Response::HTTP_OK);
    }

    #[Route('/{id}/export-pdf', name: 'export_pdf', methods: ['GET'])]
    public function exporterPdf(int $id): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $bateau = $this->em->getRepository(Boat::class)->find($id);

        if (!$bateau) {
            return $this->json(['erreur' => 'Bateau introuvable.'], Response::HTTP_NOT_FOUND);
        }

        if (!$this->isGranted(BoatVoter::EDIT, $bateau)) {
            return $this->json(['erreur' => 'Accès refusé : vous n\'êtes pas le propriétaire de ce bateau.'], Response::HTTP_FORBIDDEN);
        }

        $trajets = $this->em->getRepository(LogEntry::class)->findBy(
            ['boat' => $bateau],
            ['departureDate' => 'DESC']
        );

        $pdf = $this->carnetPdfService->genererCarnetNavigation($bateau, $trajets);

        $nomFichier = 'carnet-navigation-'.$bateau->getId().'.pdf';

        return new Response($pdf, Response::HTTP_OK, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => sprintf('attachment; filename="%s"', $nomFichier),
        ]);
    }

    private function serialiser(Boat $bateau): array
    {
        return [
            'id' => $bateau->getId(),
            'nom' => $bateau->getName(),
            'type' => $bateau->getType(),
            'statut' => $bateau->getStatus(),
            'description' => $bateau->getDescription(),
            'photoUrl' => $bateau->getPhotoUrl(),
            'creeLe' => $bateau->getCreatedAt()?->format('Y-m-d H:i:s'),
            'proprietaire' => [
                'id' => $bateau->getOwner()?->getId(),
                'email' => $bateau->getOwner()?->getEmail(),
            ],
            'port' => $bateau->getPort() ? [
                'id' => $bateau->getPort()->getId(),
                'nom' => $bateau->getPort()->getName(),
                'ville' => $bateau->getPort()->getCity(),
            ] : null,
            'reparations' => array_map(fn ($r) => [
                'id' => $r->getId(),
                'description' => $r->getDescription(),
                'date' => $r->getDate()?->format('Y-m-d'),
            ], $bateau->getRepairs()->toArray()),
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
