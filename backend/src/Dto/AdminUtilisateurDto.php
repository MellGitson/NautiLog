<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class AdminUtilisateurDto
{
    #[Assert\NotBlank(message: "L'email est obligatoire.")]
    #[Assert\Email(message: "L'adresse email '{{ value }}' n'est pas valide.")]
    public string $email = '';

    #[Assert\Length(
        max: 100,
        maxMessage: 'Le prénom ne peut pas dépasser {{ limit }} caractères.'
    )]
    public ?string $firstName = null;

    #[Assert\Length(
        max: 100,
        maxMessage: 'Le nom ne peut pas dépasser {{ limit }} caractères.'
    )]
    public ?string $lastName = null;

    #[Assert\Regex(
        pattern: '/^[0-9+() .-]{6,20}$/',
        message: 'Le numéro de téléphone est invalide.'
    )]
    public ?string $phone = null;
}
