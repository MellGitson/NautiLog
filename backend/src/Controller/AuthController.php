<?php

namespace App\Controller;

use App\Dto\RegisterDto;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/auth', name: 'api_auth_')]
class AuthController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $hasher,
        private ValidatorInterface $validator,
        private SerializerInterface $serializer,
    ) {}

    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $dto = $this->serializer->deserialize($request->getContent(), RegisterDto::class, 'json');

        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            $messages = [];
            foreach ($errors as $error) {
                $messages[$error->getPropertyPath()] = $error->getMessage();
            }
            return $this->json(['errors' => $messages], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $existingUser = $this->em->getRepository(User::class)->findOneBy(['email' => $dto->email]);
        if ($existingUser) {
            return $this->json(['errors' => ['email' => 'Cet email est déjà utilisé.']], Response::HTTP_CONFLICT);
        }

        $user = new User();
        $user->setEmail($dto->email);
        $user->setPassword($this->hasher->hashPassword($user, $dto->password));
        $user->setRoles([$dto->role]);
        $user->setLicenseNumber($dto->licenseNumber);

        $this->em->persist($user);
        $this->em->flush();

        return $this->json([
            'message' => 'Compte créé avec succès.',
            'user' => [
                'id'    => $user->getId(),
                'email' => $user->getEmail(),
                'roles' => $user->getRoles(),
            ],
        ], Response::HTTP_CREATED);
    }
}
