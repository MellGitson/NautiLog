<?php

namespace App\Entity;

use App\Repository\BerthRequestRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: BerthRequestRepository::class)]
#[ORM\Table(name: 'berth_requests')]
class BerthRequest
{
    public const STATUS_PENDING = 'EN_ATTENTE';
    public const STATUS_APPROVED = 'APPROUVEE';
    public const STATUS_REJECTED = 'REFUSEE';

    public const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_APPROVED,
        self::STATUS_REJECTED,
    ];

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Berth::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?Berth $berth = null;

    #[ORM\ManyToOne(targetEntity: Boat::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?Boat $boat = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $requester = null;

    #[ORM\Column(length: 20)]
    #[Assert\Choice(choices: BerthRequest::STATUSES)]
    private string $status = self::STATUS_PENDING;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getBerth(): ?Berth
    {
        return $this->berth;
    }

    public function setBerth(?Berth $berth): static
    {
        $this->berth = $berth;

        return $this;
    }

    public function getBoat(): ?Boat
    {
        return $this->boat;
    }

    public function setBoat(?Boat $boat): static
    {
        $this->boat = $boat;

        return $this;
    }

    public function getRequester(): ?User
    {
        return $this->requester;
    }

    public function setRequester(?User $requester): static
    {
        $this->requester = $requester;

        return $this;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }
}
