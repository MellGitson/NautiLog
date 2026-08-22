<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class RepairDto
{
    #[Assert\NotBlank(message: 'La description est obligatoire.')]
    #[Assert\Length(
        max: 2000,
        maxMessage: 'La description ne peut pas dépasser {{ limit }} caractères.'
    )]
    public string $description = '';

    #[Assert\NotBlank(message: 'La date est obligatoire.')]
    public string $date = '';
}
