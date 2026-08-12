<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class BerthRequestDto
{
    #[Assert\NotBlank(message: "L'emplacement est obligatoire.")]
    #[Assert\Type(type: 'integer', message: "L'identifiant de l'emplacement doit être un entier.")]
    public ?int $emplacementId = null;

    #[Assert\NotBlank(message: 'Le bateau est obligatoire.')]
    #[Assert\Type(type: 'integer', message: "L'identifiant du bateau doit être un entier.")]
    public ?int $bateauId = null;
}
