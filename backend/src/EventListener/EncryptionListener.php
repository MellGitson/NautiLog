<?php

namespace App\EventListener;

use App\Attribute\Encrypted;
use App\Service\EncryptionService;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsDoctrineListener;
use Doctrine\ORM\Events;
use Doctrine\Persistence\Event\LifecycleEventArgs;

#[AsDoctrineListener(event: Events::prePersist)]
#[AsDoctrineListener(event: Events::preUpdate)]
#[AsDoctrineListener(event: Events::postLoad)]
class EncryptionListener
{
    public function __construct(
        private EncryptionService $encryption,
    ) {}

    public function prePersist(LifecycleEventArgs $args): void
    {
        $this->chiffrer($args->getObject());
    }

    public function preUpdate(LifecycleEventArgs $args): void
    {
        $this->chiffrer($args->getObject());
    }

    public function postLoad(LifecycleEventArgs $args): void
    {
        $this->dechiffrer($args->getObject());
    }

    private function chiffrer(object $entity): void
    {
        foreach ($this->champsChiffres($entity) as [$reflection, $property]) {
            $valeur = $property->getValue($entity);
            if ($valeur !== null) {
                $property->setValue($entity, $this->encryption->encrypt($valeur));
            }
        }
    }

    private function dechiffrer(object $entity): void
    {
        foreach ($this->champsChiffres($entity) as [$reflection, $property]) {
            $valeur = $property->getValue($entity);
            if ($valeur !== null) {
                $property->setValue($entity, $this->encryption->decrypt($valeur));
            }
        }
    }

    private function champsChiffres(object $entity): array
    {
        $reflection = new \ReflectionClass($entity);
        $champs     = [];

        foreach ($reflection->getProperties() as $property) {
            if (!empty($property->getAttributes(Encrypted::class))) {
                $property->setAccessible(true);
                $champs[] = [$reflection, $property];
            }
        }

        return $champs;
    }
}
