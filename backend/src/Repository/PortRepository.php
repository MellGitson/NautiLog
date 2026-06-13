<?php

namespace App\Repository;

use App\Entity\Port;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class PortRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Port::class);
    }

    public function findByCity(string $city): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.city = :city')
            ->setParameter('city', $city)
            ->orderBy('p.name', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
