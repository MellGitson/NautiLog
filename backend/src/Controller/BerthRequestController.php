<?php

namespace App\Controller;

use App\Dto\BerthRequestDto;
use App\Dto\BerthRequestStatutDto;
use App\Entity\Berth;
use App\Entity\BerthRequest;
use App\Entity\Boat;
use App\Entity\Notification;
use App\Entity\User;
use App\Security\Voter\BoatVoter;
use App\Service\NotificationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/demandes-emplacements', name: 'api_demandes_emplacements_')]
class BerthRequestController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private ValidatorInterface $validator,
        private SerializerInterface $serializer,
        private NotificationService $notificationService,
    ) {
    }

    #[Route('', name: 'liste', methods: ['GET'])]
    public function liste(): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        /** @var User $user */
        $user = $this->getUser();

        if ($this->isGranted('ROLE_ADMIN')) {
            $demandes = $this->em->getRepository(BerthRequest::class)->findBy([], ['createdAt' => 'DESC']);
        } else {
            $demandes = $this->em->getRepository(BerthRequest::class)->findBy(['requester' => $user], ['createdAt' => 'DESC']);
        }

        $donnees = array_map(fn (BerthRequest $d) => $this->serialiser($d), $demandes);

        return $this->json($donnees, Response::HTTP_OK);
    }

    #[Route('', name: 'creer', methods: ['POST'])]
    public function creer(Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_OWNER');

        /** @var User $user */
        $user = $this->getUser();

        $dto = $this->serializer->deserialize($request->getContent(), BerthRequestDto::class, 'json');

        $erreurs = $this->validator->validate($dto);
        if (count($erreurs) > 0) {
            return $this->json($this->formaterErreurs($erreurs), Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $emplacement = $this->em->getRepository(Berth::class)->find($dto->emplacementId);
        if (!$emplacement) {
            return $this->json(['erreur' => 'Emplacement introuvable.'], Response::HTTP_NOT_FOUND);
        }

        if (null !== $emplacement->getBoat()) {
            return $this->json(['erreur' => 'Cet emplacement est déjà occupé.'], Response::HTTP_CONFLICT);
        }

        $bateau = $this->em->getRepository(Boat::class)->find($dto->bateauId);
        if (!$bateau) {
            return $this->json(['erreur' => 'Bateau introuvable.'], Response::HTTP_NOT_FOUND);
        }

        if (!$this->isGranted(BoatVoter::EDIT, $bateau)) {
            return $this->json(['erreur' => 'Accès refusé : vous n\'êtes pas le propriétaire de ce bateau.'], Response::HTTP_FORBIDDEN);
        }

        $demandeExistante = $this->em->getRepository(BerthRequest::class)->findOneBy([
            'boat' => $bateau,
            'status' => BerthRequest::STATUS_PENDING,
        ]);
        if ($demandeExistante) {
            return $this->json(['erreur' => 'Ce bateau a déjà une demande d\'emplacement en attente.'], Response::HTTP_CONFLICT);
        }

        $demande = new BerthRequest();
        $demande->setBerth($emplacement);
        $demande->setBoat($bateau);
        $demande->setRequester($user);

        $this->em->persist($demande);

        $this->notificationService->notifierAdmins(
            \sprintf(
                '%s demande l\'emplacement "%s" (%s) pour le bateau "%s".',
                $user->getEmail(),
                $emplacement->getLabel(),
                $emplacement->getPort()->getName(),
                $bateau->getName()
            )
        );

        $this->em->flush();

        return $this->json($this->serialiser($demande), Response::HTTP_CREATED);
    }

    #[Route('/{id}/statut', name: 'modifier_statut', methods: ['PATCH'])]
    public function modifierStatut(int $id, Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $demande = $this->em->getRepository(BerthRequest::class)->find($id);
        if (!$demande) {
            return $this->json(['erreur' => 'Demande introuvable.'], Response::HTTP_NOT_FOUND);
        }

        if (BerthRequest::STATUS_PENDING !== $demande->getStatus()) {
            return $this->json(['erreur' => 'Cette demande a déjà été traitée.'], Response::HTTP_CONFLICT);
        }

        $dto = $this->serializer->deserialize($request->getContent(), BerthRequestStatutDto::class, 'json');

        $erreurs = $this->validator->validate($dto);
        if (count($erreurs) > 0) {
            return $this->json($this->formaterErreurs($erreurs), Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (BerthRequest::STATUS_APPROVED === $dto->statut) {
            if (null !== $demande->getBerth()->getBoat()) {
                return $this->json(['erreur' => 'Cet emplacement est déjà occupé.'], Response::HTTP_CONFLICT);
            }
            $demande->getBerth()->setBoat($demande->getBoat());
            $demande->getBoat()->setPort($demande->getBerth()->getPort());
        }

        $demande->setStatus($dto->statut);

        $message = BerthRequest::STATUS_APPROVED === $dto->statut
            ? \sprintf('Votre demande d\'emplacement "%s" pour "%s" a été approuvée.', $demande->getBerth()->getLabel(), $demande->getBoat()->getName())
            : \sprintf('Votre demande d\'emplacement "%s" pour "%s" a été refusée.', $demande->getBerth()->getLabel(), $demande->getBoat()->getName());

        $this->notificationService->notifier($demande->getRequester(), Notification::TYPE_BERTH_REQUEST_STATUT, $message);

        $this->em->flush();

        return $this->json($this->serialiser($demande), Response::HTTP_OK);
    }

    private function serialiser(BerthRequest $demande): array
    {
        return [
            'id' => $demande->getId(),
            'statut' => $demande->getStatus(),
            'creeLe' => $demande->getCreatedAt()?->format('Y-m-d H:i:s'),
            'emplacement' => [
                'id' => $demande->getBerth()->getId(),
                'label' => $demande->getBerth()->getLabel(),
                'port' => [
                    'id' => $demande->getBerth()->getPort()->getId(),
                    'nom' => $demande->getBerth()->getPort()->getName(),
                ],
            ],
            'bateau' => [
                'id' => $demande->getBoat()->getId(),
                'nom' => $demande->getBoat()->getName(),
            ],
            'demandeur' => [
                'id' => $demande->getRequester()->getId(),
                'email' => $demande->getRequester()->getEmail(),
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
