<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class BerthDto
{
    #[Assert\NotBlank(message: "L'emplacement est obligatoire.")]
    #[Assert\Length(
        max: 50,
        maxMessage: "Le nom de l'emplacement ne peut pas dépasser {{ limit }} caractères."
    )]
    public string $label = '';

    #[Assert\Range(min: -90, max: 90, notInRangeMessage: 'La latitude doit être comprise entre {{ min }} et {{ max }}.')]
    public ?float $latitude = null;

    #[Assert\Range(min: -180, max: 180, notInRangeMessage: 'La longitude doit être comprise entre {{ min }} et {{ max }}.')]
    public ?float $longitude = null;

    #[Assert\Type(type: 'integer', message: "L'identifiant du bateau doit être un entier.")]
    public ?int $bateauId = null;
}
