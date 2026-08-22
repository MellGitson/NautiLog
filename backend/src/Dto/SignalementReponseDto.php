<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class SignalementReponseDto
{
    #[Assert\NotBlank(message: 'La réponse est obligatoire.')]
    #[Assert\Length(max: 2000)]
    public string $reponse = '';
}
