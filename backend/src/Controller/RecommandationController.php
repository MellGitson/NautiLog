<?php

namespace App\Controller;

use App\Entity\LogEntry;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/recommandations', name: 'api_recommandations_')]
class RecommandationController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
    ) {
    }

    #[Route('', name: 'index', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $user = $this->getUser();

        $trajets = $this->em->getRepository(LogEntry::class)
            ->createQueryBuilder('l')
            ->join('l.boat', 'b')
            ->where('b.owner = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getResult();

        if (0 === count($trajets)) {
            return $this->json([
                'message' => 'Pas encore assez de données pour générer des recommandations.',
            ]);
        }

        return $this->json([
            'portsFrequents' => $this->portsFrequents($trajets),
            'portDepartFavori' => $this->portDepartFavori($trajets),
            'distanceMoyenne' => $this->distanceMoyenne($trajets),
            'checklistDepart' => $this->checklistDepart(),
        ]);
    }

    private function portsFrequents(array $trajets): array
    {
        $comptage = [];

        foreach ($trajets as $trajet) {
            $port = $trajet->getArrivalPort();
            $id = $port->getId();

            if (!isset($comptage[$id])) {
                $comptage[$id] = [
                    'id' => $id,
                    'nom' => $port->getName(),
                    'ville' => $port->getCity(),
                    'nbVisites' => 0,
                ];
            }

            ++$comptage[$id]['nbVisites'];
        }

        usort($comptage, fn ($a, $b) => $b['nbVisites'] <=> $a['nbVisites']);

        return array_values(array_slice($comptage, 0, 3));
    }

    private function portDepartFavori(array $trajets): ?array
    {
        $comptage = [];

        foreach ($trajets as $trajet) {
            $port = $trajet->getDeparturePort();
            $id = $port->getId();

            if (!isset($comptage[$id])) {
                $comptage[$id] = [
                    'id' => $id,
                    'nom' => $port->getName(),
                    'ville' => $port->getCity(),
                    'nbDepartures' => 0,
                ];
            }

            ++$comptage[$id]['nbDepartures'];
        }

        if (empty($comptage)) {
            return null;
        }

        usort($comptage, fn ($a, $b) => $b['nbDepartures'] <=> $a['nbDepartures']);

        return $comptage[0];
    }

    private function distanceMoyenne(array $trajets): ?float
    {
        $distances = array_filter(
            array_map(fn (LogEntry $l) => $l->getDistanceNm(), $trajets),
            fn ($d) => null !== $d
        );

        if (empty($distances)) {
            return null;
        }

        return round(array_sum($distances) / count($distances), 1);
    }

    private function checklistDepart(): array
    {
        return [
            'Vérifier la météo marine et les prévisions de vent',
            'Contrôler les niveaux de carburant',
            'Vérifier les équipements de sécurité (gilets, fusées, extincteur)',
            'Informer les autorités portuaires du départ',
            'Tester les feux de navigation',
            'Vérifier la VHF et les communications',
        ];
    }
}
