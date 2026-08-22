<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class UtilisateurRoleDto
{
    #[Assert\NotBlank(message: 'Le rôle est obligatoire.')]
    #[Assert\Choice(
        choices: ['ROLE_OWNER', 'ROLE_RENTER', 'ROLE_ADMIN'],
        message: "Le rôle doit être 'ROLE_OWNER', 'ROLE_RENTER' ou 'ROLE_ADMIN'."
    )]
    public string $role = '';
}
