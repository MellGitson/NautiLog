<?php

namespace App\DataFixtures;

use App\Entity\User;
use Fidry\AliceDataFixtures\ProcessorInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserProcessor implements ProcessorInterface
{
    public function __construct(
        private UserPasswordHasherInterface $hasher
    ) {}

    public function preProcess(string $id, object $object): void
    {
        if (!$object instanceof User) {
            return;
        }

        $plainPassword = match (true) {
            str_contains($id, 'admin')  => 'Admin1234!',
            str_contains($id, 'owner')  => 'Owner1234!',
            str_contains($id, 'renter') => 'Renter1234!',
            default                     => 'Password1234!',
        };

        $object->setPassword($this->hasher->hashPassword($object, $plainPassword));
    }

    public function postProcess(string $id, object $object): void {}
}
