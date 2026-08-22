<?php

namespace App\Dto;

use App\Entity\BerthRequest;
use Symfony\Component\Validator\Constraints as Assert;

class BerthRequestStatutDto
{
    #[Assert\NotBlank(message: 'Le statut est obligatoire.')]
    #[Assert\Choice(
        choices: [BerthRequest::STATUS_APPROVED, BerthRequest::STATUS_REJECTED],
        message: "Le statut doit être 'APPROUVEE' ou 'REFUSEE'."
    )]
    public string $statut = '';
}
