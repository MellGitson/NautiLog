<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class LogEntreeDto
{
    #[Assert\NotBlank(message: "L'identifiant du bateau est obligatoire.")]
    #[Assert\Type(type: 'integer', message: "L'identifiant du bateau doit être un entier.")]
    public int $bateauId = 0;

    #[Assert\NotBlank(message: "Le port de départ est obligatoire.")]
    #[Assert\Type(type: 'integer', message: "L'identifiant du port de départ doit être un entier.")]
    public int $portDepartId = 0;

    #[Assert\NotBlank(message: "Le port d'arrivée est obligatoire.")]
    #[Assert\Type(type: 'integer', message: "L'identifiant du port d'arrivée doit être un entier.")]
    public int $portArriveeId = 0;

    #[Assert\NotBlank(message: "La date de départ est obligatoire.")]
    #[Assert\DateTime(format: 'Y-m-d H:i:s', message: "La date de départ doit être au format YYYY-MM-DD HH:MM:SS.")]
    public string $dateDepart = '';

    #[Assert\DateTime(format: 'Y-m-d H:i:s', message: "La date d'arrivée doit être au format YYYY-MM-DD HH:MM:SS.")]
    public ?string $dateArrivee = null;

    #[Assert\PositiveOrZero(message: "La distance doit être un nombre positif ou nul.")]
    public ?float $distanceNm = null;

    public ?string $notes = null;
}
