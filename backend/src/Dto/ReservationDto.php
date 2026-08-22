<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class ReservationDto
{
    #[Assert\NotBlank(message: 'Le bateau est obligatoire.')]
    #[Assert\Type(type: 'integer', message: "L'identifiant du bateau doit être un entier.")]
    public ?int $bateauId = null;

    #[Assert\NotBlank(message: 'La date de début est obligatoire.')]
    public string $dateDebut = '';

    #[Assert\NotBlank(message: 'La date de fin est obligatoire.')]
    public string $dateFin = '';

    #[Assert\Type(type: 'integer', message: "L'identifiant du locataire doit être un entier.")]
    public ?int $locataireId = null;
}
