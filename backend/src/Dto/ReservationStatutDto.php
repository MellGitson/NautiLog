<?php

namespace App\Dto;

use App\Entity\Reservation;
use Symfony\Component\Validator\Constraints as Assert;

class ReservationStatutDto
{
    #[Assert\NotBlank(message: 'Le statut est obligatoire.')]
    #[Assert\Choice(
        choices: Reservation::STATUSES,
        message: "Le statut doit être l'un des suivants : EN_ATTENTE, CONFIRMEE, ANNULEE."
    )]
    public string $statut = '';
}
