<?php

namespace App\Controller;

use App\Dto\UtilisateurRoleDto;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/admin/users', name: 'api_admin_users_')]
class AdminUtilisateurController extends AbstractController
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
        $utilisateurs = $this->em->getRepository(User::class)->findAll();
        $donnees = array_map(fn (User $utilisateur) => $this->serialiser($utilisateur), $utilisateurs);

        return $this->json($donnees, Response::HTTP_OK);
    }

    #[Route('/{id}', name: 'detail', methods: ['GET'])]
    public function detail(int $id): JsonResponse
    {
        $utilisateur = $this->em->getRepository(User::class)->find($id);

        if (!$utilisateur) {
            return $this->json(['erreur' => 'Utilisateur introuvable.'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($this->serialiser($utilisateur), Response::HTTP_OK);
    }

    #[Route('/{id}/role', name: 'modifier_role', methods: ['PATCH'])]
    public function modifierRole(int $id, Request $request): JsonResponse
    {
        $utilisateur = $this->em->getRepository(User::class)->find($id);

        if (!$utilisateur) {
            return $this->json(['erreur' => 'Utilisateur introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $dto = $this->serializer->deserialize($request->getContent(), UtilisateurRoleDto::class, 'json');

        $erreurs = $this->validator->validate($dto);
        if (count($erreurs) > 0) {
            $messages = [];
            foreach ($erreurs as $erreur) {
                $messages[$erreur->getPropertyPath()] = $erreur->getMessage();
            }

            return $this->json(['errors' => $messages], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $utilisateur->setRoles([$dto->role]);
        $this->em->flush();

        return $this->json($this->serialiser($utilisateur), Response::HTTP_OK);
    }

    private function serialiser(User $utilisateur): array
    {
        return [
            'id' => $utilisateur->getId(),
            'email' => $utilisateur->getEmail(),
            'roles' => $utilisateur->getRoles(),
            'firstName' => $utilisateur->getFirstName(),
            'lastName' => $utilisateur->getLastName(),
            'phone' => $utilisateur->getPhone(),
            'nombreBateaux' => $utilisateur->getBoats()->count(),
            'createdAt' => $utilisateur->getCreatedAt()?->format(\DATE_ATOM),
        ];
    }
}
