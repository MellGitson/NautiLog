<?php

namespace App\Dto;

use App\Entity\Boat;
use Symfony\Component\Validator\Constraints as Assert;

class BateauDto
{
    #[Assert\NotBlank(message: "Le nom du bateau est obligatoire.")]
    #[Assert\Length(
        max: 150,
        maxMessage: "Le nom ne peut pas dépasser {{ limit }} caractères."
    )]
    public string $nom = '';

    #[Assert\NotBlank(message: "Le type de bateau est obligatoire.")]
    #[Assert\Length(
        max: 100,
        maxMessage: "Le type ne peut pas dépasser {{ limit }} caractères."
    )]
    public string $type = '';

    #[Assert\Choice(
        choices: Boat::STATUSES,
        message: "Le statut doit être l'un des suivants : DISPONIBLE, LOUÉ, EN_RÉPARATION."
    )]
    public string $statut = Boat::STATUS_AVAILABLE;

    #[Assert\Type(type: 'integer', message: "L'identifiant du port doit être un entier.")]
    public ?int $portId = null;
}
