<?php

namespace App\Entity;

use App\Repository\LogEntryRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: LogEntryRepository::class)]
#[ORM\Table(name: 'log_entries')]
class LogEntry
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Boat::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?Boat $boat = null;

    #[ORM\ManyToOne(targetEntity: Port::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?Port $departurePort = null;

    #[ORM\ManyToOne(targetEntity: Port::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?Port $arrivalPort = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $departureDate = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $arrivalDate = null;

    #[ORM\Column(nullable: true)]
    private ?float $distanceNm = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $notes = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }

    public function getBoat(): ?Boat { return $this->boat; }
    public function setBoat(?Boat $boat): static { $this->boat = $boat; return $this; }

    public function getDeparturePort(): ?Port { return $this->departurePort; }
    public function setDeparturePort(?Port $departurePort): static { $this->departurePort = $departurePort; return $this; }

    public function getArrivalPort(): ?Port { return $this->arrivalPort; }
    public function setArrivalPort(?Port $arrivalPort): static { $this->arrivalPort = $arrivalPort; return $this; }

    public function getDepartureDate(): ?\DateTimeImmutable { return $this->departureDate; }
    public function setDepartureDate(\DateTimeImmutable $departureDate): static { $this->departureDate = $departureDate; return $this; }

    public function getArrivalDate(): ?\DateTimeImmutable { return $this->arrivalDate; }
    public function setArrivalDate(?\DateTimeImmutable $arrivalDate): static { $this->arrivalDate = $arrivalDate; return $this; }

    public function getDistanceNm(): ?float { return $this->distanceNm; }
    public function setDistanceNm(?float $distanceNm): static { $this->distanceNm = $distanceNm; return $this; }

    public function getNotes(): ?string { return $this->notes; }
    public function setNotes(?string $notes): static { $this->notes = $notes; return $this; }

    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
}
