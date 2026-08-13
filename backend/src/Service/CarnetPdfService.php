<?php

namespace App\Service;

use App\Entity\Boat;
use App\Entity\Repair;
use Dompdf\Dompdf;
use Dompdf\Options;

class CarnetPdfService
{
    /**
     * @param Repair[] $reparations
     */
    public function genererFicheBateau(Boat $bateau, array $reparations): string
    {
        $options = new Options();
        $options->set('isRemoteEnabled', false);
        $options->set('defaultFont', 'Helvetica');

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($this->genererHtml($bateau, $reparations));
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return $dompdf->output();
    }

    /**
     * @param Repair[] $reparations
     */
    private function genererHtml(Boat $bateau, array $reparations): string
    {
        $lignes = '';
        foreach ($reparations as $reparation) {
            $lignes .= \sprintf(
                '<tr>
                    <td>%s</td>
                    <td>%s</td>
                </tr>',
                $this->e($reparation->getDate()?->format('d/m/Y')),
                $this->e($reparation->getDescription())
            );
        }

        if ($lignes === '') {
            $lignes = '<tr><td colspan="2" style="text-align:center;color:#888;">Aucune réparation enregistrée.</td></tr>';
        }

        $nom = $this->e($bateau->getName());
        $type = $this->e($bateau->getType());
        $statut = $this->e($bateau->getStatus());
        $proprietaire = $this->e($bateau->getOwner()?->getEmail());
        $port = $this->e($bateau->getPort()?->getName());
        $description = $this->e($bateau->getDescription() ?? '');
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
    <h1>Fiche bateau — {$nom}</h1>
    <p class="sous-titre">NautiLog &amp; Fleet</p>

    <div class="infos">
        <p><strong>Type :</strong> {$type}</p>
        <p><strong>Statut :</strong> {$statut}</p>
        <p><strong>Propriétaire :</strong> {$proprietaire}</p>
        <p><strong>Port d'attache :</strong> {$port}</p>
        <p><strong>Description :</strong> {$description}</p>
    </div>

    <h2 style="font-size:14px;color:#1e6179;margin-top:20px;">Historique des réparations</h2>
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Description</th>
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
