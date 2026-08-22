<?php

namespace App\Controller;

use App\Dto\ContactDto;
use App\Service\MailService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/contact', name: 'api_contact_')]
class ContactController extends AbstractController
{
    public function __construct(
        private ValidatorInterface $validator,
        private SerializerInterface $serializer,
        private MailService $mailService,
    ) {
    }

    #[Route('', name: 'envoyer', methods: ['POST'])]
    public function envoyer(Request $request): JsonResponse
    {
        $dto = $this->serializer->deserialize($request->getContent(), ContactDto::class, 'json');

        $erreurs = $this->validator->validate($dto);
        if (count($erreurs) > 0) {
            return $this->json($this->formaterErreurs($erreurs), Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $envoye = $this->mailService->envoyerMessageContact($dto->nom, $dto->email, $dto->message);
        if (!$envoye) {
            return $this->json(['erreur' => "L'envoi du message a échoué. Réessayez plus tard."], Response::HTTP_BAD_GATEWAY);
        }

        return $this->json(['succes' => true], Response::HTTP_OK);
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
