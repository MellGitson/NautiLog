<?php

namespace App\Repository;

use App\Entity\Boat;
use App\Entity\Reservation;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class ReservationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Reservation::class);
    }

    public function trouverChevauchement(
        Boat $boat,
        \DateTimeImmutable $startDate,
        \DateTimeImmutable $endDate,
        ?int $excludeId = null,
    ): ?Reservation {
        $qb = $this->createQueryBuilder('r')
            ->andWhere('r.boat = :boat')
            ->andWhere('r.status != :cancelled')
            ->andWhere('r.startDate <= :endDate')
            ->andWhere('r.endDate >= :startDate')
            ->setParameter('boat', $boat)
            ->setParameter('cancelled', Reservation::STATUS_CANCELLED)
            ->setParameter('startDate', $startDate)
            ->setParameter('endDate', $endDate)
            ->setMaxResults(1);

        if ($excludeId !== null) {
            $qb->andWhere('r.id != :excludeId')->setParameter('excludeId', $excludeId);
        }

        return $qb->getQuery()->getOneOrNullResult();
    }
}
