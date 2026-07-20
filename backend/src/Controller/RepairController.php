<?php

namespace App\Controller;

use App\Dto\RepairDto;
use App\Entity\Boat;
use App\Entity\Repair;
use App\Security\Voter\BoatVoter;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/bateaux/{id}/reparations', name: 'api_reparations_')]
class RepairController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private ValidatorInterface $validator,
        private SerializerInterface $serializer,
    ) {
    }

    #[Route('', name: 'creer', methods: ['POST'])]
    public function creer(int $id, Request $request): JsonResponse
    {
        $bateau = $this->em->getRepository(Boat::class)->find($id);

        if (!$bateau) {
            return $this->json(['erreur' => 'Bateau introuvable.'], Response::HTTP_NOT_FOUND);
        }

        if (!$this->isGranted(BoatVoter::EDIT, $bateau)) {
            return $this->json(['erreur' => 'Accès refusé : vous n\'êtes pas le propriétaire de ce bateau.'], Response::HTTP_FORBIDDEN);
        }

        $dto = $this->serializer->deserialize($request->getContent(), RepairDto::class, 'json');

        $erreurs = $this->validator->validate($dto);
        if (count($erreurs) > 0) {
            $messages = [];
            foreach ($erreurs as $erreur) {
                $messages[$erreur->getPropertyPath()] = $erreur->getMessage();
            }

            return $this->json(['erreurs' => $messages], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $date = new \DateTimeImmutable($dto->date);
        } catch (\Exception) {
            return $this->json(['erreurs' => ['date' => 'La date fournie est invalide.']], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $reparation = new Repair();
        $reparation->setBoat($bateau);
        $reparation->setDescription($dto->description);
        $reparation->setDate($date);

        $this->em->persist($reparation);
        $this->em->flush();

        return $this->json([
            'id' => $reparation->getId(),
            'description' => $reparation->getDescription(),
            'date' => $reparation->getDate()->format('Y-m-d'),
        ], Response::HTTP_CREATED);
    }
}
