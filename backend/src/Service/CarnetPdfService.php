<?php

namespace App\Service;

use App\Entity\Boat;
use App\Entity\LogEntry;
use Dompdf\Dompdf;
use Dompdf\Options;

class CarnetPdfService
{
    /**
     * @param LogEntry[] $trajets
     */
    public function genererCarnetNavigation(Boat $bateau, array $trajets): string
    {
        $options = new Options();
        $options->set('isRemoteEnabled', false);
        $options->set('defaultFont', 'Helvetica');

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($this->genererHtml($bateau, $trajets));
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return $dompdf->output();
    }

    /**
     * @param LogEntry[] $trajets
     */
    private function genererHtml(Boat $bateau, array $trajets): string
    {
        $lignes = '';
        foreach ($trajets as $trajet) {
            $lignes .= \sprintf(
                '<tr>
                    <td>%s</td>
                    <td>%s</td>
                    <td>%s</td>
                    <td>%s</td>
                    <td>%s</td>
                    <td>%s</td>
                </tr>',
                $this->e($trajet->getDepartureDate()?->format('d/m/Y H:i')),
                $this->e($trajet->getArrivalDate()?->format('d/m/Y H:i') ?? 'En cours'),
                $this->e($trajet->getDeparturePort()?->getName()),
                $this->e($trajet->getArrivalPort()?->getName()),
                $trajet->getDistanceNm() !== null ? number_format($trajet->getDistanceNm(), 1).' nm' : '—',
                $this->e($trajet->getNotes() ?? '')
            );
        }

        if ($lignes === '') {
            $lignes = '<tr><td colspan="6" style="text-align:center;color:#888;">Aucun trajet enregistré.</td></tr>';
        }

        $nom = $this->e($bateau->getName());
        $type = $this->e($bateau->getType());
        $proprietaire = $this->e($bateau->getOwner()?->getEmail());
        $genereLe = (new \DateTimeImmutable())->format('d/m/Y à H:i');

        return <<<HTML
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
    body { font-family: Helvetica, Arial, sans-serif; font-size: 11px; color: #1e293b; }
    h1 { font-size: 20px; color: #1e6179; margin-bottom: 4px; }
    .sous-titre { color: #64748b; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
    th { background-color: #f0f9fc; color: #1e6179; }
    .infos { margin-top: 12px; }
    .infos p { margin: 2px 0; }
    .pied { margin-top: 24px; font-size: 9px; color: #94a3b8; }
</style>
</head>
<body>
    <h1>Carnet de navigation — {$nom}</h1>
    <p class="sous-titre">NautiLog &amp; Fleet</p>

    <div class="infos">
        <p><strong>Type :</strong> {$type}</p>
        <p><strong>Propriétaire :</strong> {$proprietaire}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Départ</th>
                <th>Arrivée</th>
                <th>Port de départ</th>
                <th>Port d'arrivée</th>
                <th>Distance</th>
                <th>Notes</th>
            </tr>
        </thead>
        <tbody>
            {$lignes}
        </tbody>
    </table>

    <p class="pied">Document généré le {$genereLe} — NautiLog &amp; Fleet</p>
</body>
</html>
HTML;
    }

    private function e(?string $valeur): string
    {
        return htmlspecialchars($valeur ?? '', \ENT_QUOTES, 'UTF-8');
    }
}
