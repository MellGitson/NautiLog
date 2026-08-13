<?php

namespace App\Controller;

use App\Entity\Boat;
use App\Entity\Port;
use App\Entity\Signalement;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/admin/stats', name: 'api_admin_stats_')]
class AdminStatsController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
    ) {
    }

    #[Route('', name: 'get', methods: ['GET'])]
    public function get(): JsonResponse
    {
        $boatRepo = $this->em->getRepository(Boat::class);

        $bateauxParStatut = [];
        foreach (Boat::STATUSES as $statut) {
            $bateauxParStatut[$statut] = $boatRepo->count(['status' => $statut]);
        }

        $utilisateurs = $this->em->getRepository(User::class)->findAll();

        $compteursRoles = ['ROLE_ADMIN' => 0, 'ROLE_OWNER' => 0, 'ROLE_RENTER' => 0];
        foreach ($utilisateurs as $utilisateur) {
            foreach ($compteursRoles as $role => $_) {
                if (\in_array($role, $utilisateur->getRoles(), true)) {
                    ++$compteursRoles[$role];
                }
            }
        }

        return $this->json([
            'bateaux' => [
                'total' => array_sum($bateauxParStatut),
                'parStatut' => $bateauxParStatut,
            ],
            'ports' => [
                'total' => $this->em->getRepository(Port::class)->count([]),
            ],
            'utilisateurs' => [
                'total' => count($utilisateurs),
                'parRole' => $compteursRoles,
            ],
            'signalements' => [
                'ouverts' => $this->em->getRepository(Signalement::class)->count(['status' => Signalement::STATUS_OUVERT]),
            ],
        ]);
    }
}
