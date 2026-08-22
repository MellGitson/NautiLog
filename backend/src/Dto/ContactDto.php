<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class ContactDto
{
    #[Assert\NotBlank(message: 'Le nom est obligatoire.')]
    #[Assert\Length(
        max: 100,
        maxMessage: 'Le nom ne peut pas dépasser {{ limit }} caractères.'
    )]
    public string $nom = '';

    #[Assert\NotBlank(message: "L'email est obligatoire.")]
    #[Assert\Email(message: "L'adresse email '{{ value }}' n'est pas valide.")]
    public string $email = '';

    #[Assert\NotBlank(message: 'Le message est obligatoire.')]
    #[Assert\Length(
        max: 2000,
        maxMessage: 'Le message ne peut pas dépasser {{ limit }} caractères.'
    )]
    public string $message = '';
}
