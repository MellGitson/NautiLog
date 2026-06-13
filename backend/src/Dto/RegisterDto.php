<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class RegisterDto
{
    #[Assert\NotBlank(message: "L'email est obligatoire.")]
    #[Assert\Email(message: "L'adresse email '{{ value }}' n'est pas valide.")]
    public string $email = '';

    #[Assert\NotBlank(message: 'Le mot de passe est obligatoire.')]
    #[Assert\Length(
        min: 8,
        minMessage: 'Le mot de passe doit contenir au moins {{ limit }} caractères.'
    )]
    public string $password = '';

    #[Assert\NotBlank(message: 'Le rôle est obligatoire.')]
    #[Assert\Choice(
        choices: ['ROLE_OWNER', 'ROLE_RENTER'],
        message: "Le rôle doit être 'ROLE_OWNER' (propriétaire) ou 'ROLE_RENTER' (locataire)."
    )]
    public string $role = 'ROLE_RENTER';

    #[Assert\Length(
        max: 100,
        maxMessage: 'Le numéro de permis ne peut pas dépasser {{ limit }} caractères.'
    )]
    public ?string $licenseNumber = null;
}
