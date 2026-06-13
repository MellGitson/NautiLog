<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class BateauControllerTest extends WebTestCase
{
    private function creerUtilisateurEtToken(mixed $client, string $email, string $role): string
    {
        $client->request('POST', '/api/auth/register', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email'    => $email,
            'password' => 'Password1234!',
            'role'     => $role,
        ]));

        $client->request('POST', '/api/auth/login', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'username' => $email,
            'password' => 'Password1234!',
        ]));

        return json_decode($client->getResponse()->getContent(), true)['token'];
    }

    // GET /api/bateaux — liste publique
    public function testListeBateauxPublique(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/bateaux');

        $this->assertResponseIsSuccessful();
        $this->assertJson($client->getResponse()->getContent());
    }

    // POST /api/bateaux — créer un bateau en tant qu'owner
    public function testCreerBateauOwner(): void
    {
        $client = static::createClient();
        $token = $this->creerUtilisateurEtToken($client, 'owner_bateau@nautilog.fr', 'ROLE_OWNER');

        $client->request('POST', '/api/bateaux', [], [], [
            'CONTENT_TYPE'  => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode([
            'nom'    => 'Mon Voilier',
            'type'   => 'Voilier',
            'statut' => 'DISPONIBLE',
        ]));

        $this->assertResponseStatusCodeSame(201);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertSame('Mon Voilier', $data['nom']);
    }

    // POST /api/bateaux — sans authentification → 401
    public function testCreerBateauSansAuth(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/bateaux', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'nom'    => 'Bateau Fantôme',
            'type'   => 'Yacht',
            'statut' => 'DISPONIBLE',
        ]));

        $this->assertResponseStatusCodeSame(401);
    }

    // POST /api/bateaux — en tant que renter → 403
    public function testCreerBateauRenter(): void
    {
        $client = static::createClient();
        $token = $this->creerUtilisateurEtToken($client, 'renter_bateau@nautilog.fr', 'ROLE_RENTER');

        $client->request('POST', '/api/bateaux', [], [], [
            'CONTENT_TYPE'       => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode([
            'nom'    => 'Tentative',
            'type'   => 'Voilier',
            'statut' => 'DISPONIBLE',
        ]));

        $this->assertResponseStatusCodeSame(403);
    }

    // POST /api/bateaux — données invalides → 422
    public function testCreerBateauDonneesInvalides(): void
    {
        $client = static::createClient();
        $token = $this->creerUtilisateurEtToken($client, 'owner_invalide@nautilog.fr', 'ROLE_OWNER');

        $client->request('POST', '/api/bateaux', [], [], [
            'CONTENT_TYPE'       => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode([
            'nom'    => '',
            'type'   => '',
            'statut' => 'STATUT_INEXISTANT',
        ]));

        $this->assertResponseStatusCodeSame(422);
    }

    // GET /api/bateaux/{id} — bateau inexistant → 404
    public function testDetailBateauInexistant(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/bateaux/99999');

        $this->assertResponseStatusCodeSame(404);
    }

    // DELETE /api/bateaux/{id} — suppression par le propriétaire
    public function testSupprimerBateauParProprietaire(): void
    {
        $client = static::createClient();
        $token = $this->creerUtilisateurEtToken($client, 'owner_delete@nautilog.fr', 'ROLE_OWNER');

        $client->request('POST', '/api/bateaux', [], [], [
            'CONTENT_TYPE'       => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode([
            'nom'    => 'À Supprimer',
            'type'   => 'Vedette',
            'statut' => 'DISPONIBLE',
        ]));

        $id = json_decode($client->getResponse()->getContent(), true)['id'];

        $client->request('DELETE', "/api/bateaux/$id", [], [], [
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ]);

        $this->assertResponseStatusCodeSame(200);
    }

    // DELETE /api/bateaux/{id} — suppression par un autre owner → 403
    public function testSupprimerBateauAutreProprietaire(): void
    {
        $client = static::createClient();
        $tokenA = $this->creerUtilisateurEtToken($client, 'owner_a@nautilog.fr', 'ROLE_OWNER');
        $tokenB = $this->creerUtilisateurEtToken($client, 'owner_b@nautilog.fr', 'ROLE_OWNER');

        $client->request('POST', '/api/bateaux', [], [], [
            'CONTENT_TYPE'       => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenA",
        ], json_encode([
            'nom'    => 'Bateau de A',
            'type'   => 'Voilier',
            'statut' => 'DISPONIBLE',
        ]));

        $id = json_decode($client->getResponse()->getContent(), true)['id'];

        $client->request('DELETE', "/api/bateaux/$id", [], [], [
            'HTTP_AUTHORIZATION' => "Bearer $tokenB",
        ]);

        $this->assertResponseStatusCodeSame(403);
    }
}
