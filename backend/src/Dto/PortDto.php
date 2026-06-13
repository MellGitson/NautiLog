<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class PortDto
{
    #[Assert\NotBlank(message: 'Le nom du port est obligatoire.')]
    #[Assert\Length(max: 150, maxMessage: 'Le nom ne peut pas dépasser {{ limit }} caractères.')]
    public string $nom = '';

    #[Assert\NotBlank(message: 'La ville est obligatoire.')]
    #[Assert\Length(max: 100, maxMessage: 'La ville ne peut pas dépasser {{ limit }} caractères.')]
    public string $ville = '';

    #[Assert\NotBlank(message: 'La latitude est obligatoire.')]
    #[Assert\Range(
        min: -90,
        max: 90,
        notInRangeMessage: 'La latitude doit être comprise entre {{ min }} et {{ max }}.'
    )]
    public float $latitude = 0.0;

    #[Assert\NotBlank(message: 'La longitude est obligatoire.')]
    #[Assert\Range(
        min: -180,
        max: 180,
        notInRangeMessage: 'La longitude doit être comprise entre {{ min }} et {{ max }}.'
    )]
    public float $longitude = 0.0;

    #[Assert\NotBlank(message: 'La capacité est obligatoire.')]
    #[Assert\Positive(message: 'La capacité doit être un entier positif.')]
    public int $capacite = 0;
}
