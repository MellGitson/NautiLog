<?php

namespace App\Controller;

use App\Dto\ProfilDto;
use App\Entity\User;
use App\Service\SuppressionCompteService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/me', name: 'api_profil_')]
class ProfilController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private ValidatorInterface $validator,
        private SerializerInterface $serializer,
        private SuppressionCompteService $suppressionCompteService,
    ) {
    }

    #[Route('', name: 'get', methods: ['GET'])]
    public function get(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        return $this->json($this->serialize($user));
    }

    #[Route('', name: 'update', methods: ['PATCH'])]
    public function update(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $dto = $this->serializer->deserialize($request->getContent(), ProfilDto::class, 'json');

        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            $messages = [];
            foreach ($errors as $error) {
                $messages[$error->getPropertyPath()] = $error->getMessage();
            }

            return $this->json(['errors' => $messages], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $user->setFirstName($dto->firstName);
        $user->setLastName($dto->lastName);
        $user->setPhone($dto->phone);
        $user->setAvatarUrl($dto->avatarUrl);

        $this->em->flush();

        return $this->json($this->serialize($user));
    }

    #[Route('', name: 'supprimer', methods: ['DELETE'])]
    public function supprimer(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $this->suppressionCompteService->supprimerCompte($user);

        return $this->json(['message' => 'Votre compte et toutes les données associées ont été supprimés.'], Response::HTTP_OK);
    }

    private function serialize(User $user): array
    {
        return [
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'phone' => $user->getPhone(),
            'avatarUrl' => $user->getAvatarUrl(),
            'createdAt' => $user->getCreatedAt()?->format(\DATE_ATOM),
        ];
    }
}
