<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class SignalementDto
{
    #[Assert\NotBlank(message: 'La réservation est obligatoire.')]
    #[Assert\Type(type: 'integer', message: "L'identifiant de la réservation doit être un entier.")]
    public ?int $reservationId = null;

    #[Assert\NotBlank(message: 'Le message est obligatoire.')]
    #[Assert\Length(max: 2000)]
    public string $message = '';
}
