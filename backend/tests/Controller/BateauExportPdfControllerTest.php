<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class BateauExportPdfControllerTest extends WebTestCase
{
    private function creerUtilisateurEtToken(mixed $client, string $email, string $role): string
    {
        $client->request('POST', '/api/auth/register', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email' => $email,
            'password' => 'Password1234!',
            'role' => $role,
        ]));

        $client->request('POST', '/api/auth/login', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email' => $email,
            'password' => 'Password1234!',
        ]));

        return json_decode($client->getResponse()->getContent(), true)['token'];
    }

    private function creerBateau(mixed $client, string $tokenOwner): int
    {
        $client->request('POST', '/api/bateaux', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenOwner",
        ], json_encode([
            'nom' => 'Bateau Export PDF',
            'type' => 'Voilier',
            'statut' => 'DISPONIBLE',
        ]));

        return json_decode($client->getResponse()->getContent(), true)['id'];
    }

    // GET /api/bateaux/{id}/export-pdf — sans authentification → 401
    public function testExportPdfSansAuth(): void
    {
        $client = static::createClient();
        $tokenOwner = $this->creerUtilisateurEtToken($client, 'owner_pdf_401@nautilog.fr', 'ROLE_OWNER');
        $bateauId = $this->creerBateau($client, $tokenOwner);

        $client->request('GET', "/api/bateaux/$bateauId/export-pdf");

        $this->assertResponseStatusCodeSame(401);
    }

    // GET /api/bateaux/{id}/export-pdf — par un tiers → 403
    public function testExportPdfTiers(): void
    {
        $client = static::createClient();
        $tokenOwner = $this->creerUtilisateurEtToken($client, 'owner_pdf_tiers@nautilog.fr', 'ROLE_OWNER');
        $bateauId = $this->creerBateau($client, $tokenOwner);
        $tokenTiers = $this->creerUtilisateurEtToken($client, 'tiers_pdf@nautilog.fr', 'ROLE_RENTER');

        $client->request('GET', "/api/bateaux/$bateauId/export-pdf", [], [], [
            'HTTP_AUTHORIZATION' => "Bearer $tokenTiers",
        ]);

        $this->assertResponseStatusCodeSame(403);
    }

    // GET /api/bateaux/{id}/export-pdf — par le propriétaire → PDF valide
    public function testExportPdfProprietaire(): void
    {
        $client = static::createClient();
        $tokenOwner = $this->creerUtilisateurEtToken($client, 'owner_pdf_valide@nautilog.fr', 'ROLE_OWNER');
        $bateauId = $this->creerBateau($client, $tokenOwner);

        $client->request('GET', "/api/bateaux/$bateauId/export-pdf", [], [], [
            'HTTP_AUTHORIZATION' => "Bearer $tokenOwner",
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertSame('application/pdf', $client->getResponse()->headers->get('Content-Type'));
        $this->assertStringStartsWith('%PDF', $client->getResponse()->getContent());
    }

    // GET /api/bateaux/{id}/export-pdf — bateau inexistant → 404
    public function testExportPdfBateauInexistant(): void
    {
        $client = static::createClient();
        $token = $this->creerUtilisateurEtToken($client, 'owner_pdf_404@nautilog.fr', 'ROLE_OWNER');

        $client->request('GET', '/api/bateaux/999999/export-pdf', [], [], [
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ]);

        $this->assertResponseStatusCodeSame(404);
    }
}
