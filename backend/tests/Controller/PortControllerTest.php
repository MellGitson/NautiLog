<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class PortControllerTest extends WebTestCase
{
    private function creerAdminEtToken(mixed $client): string
    {
        $client->request('POST', '/api/auth/register', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email'    => 'admin_port@nautilog.fr',
            'password' => 'Admin1234!',
            'role'     => 'ROLE_ADMIN',
        ]));

        $client->request('POST', '/api/auth/login', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'username' => 'admin_port@nautilog.fr',
            'password' => 'Admin1234!',
        ]));

        return json_decode($client->getResponse()->getContent(), true)['token'];
    }

    // GET /api/ports — liste publique
    public function testListePortsPublique(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/ports');

        $this->assertResponseIsSuccessful();
        $this->assertJson($client->getResponse()->getContent());
    }

    // GET /api/ports/{id} — port inexistant → 404
    public function testDetailPortInexistant(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/ports/99999');

        $this->assertResponseStatusCodeSame(404);
    }

    // POST /api/ports — créer un port en tant qu'admin
    public function testCreerPortAdmin(): void
    {
        $client = static::createClient();
        $token = $this->creerAdminEtToken($client);

        $client->request('POST', '/api/ports', [], [], [
            'CONTENT_TYPE'       => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode([
            'nom'       => 'Port de Test',
            'ville'     => 'Testville',
            'latitude'  => 43.2965,
            'longitude' => 5.3698,
            'capacite'  => 50,
        ]));

        $this->assertResponseStatusCodeSame(201);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertSame('Port de Test', $data['nom']);
        $this->assertSame('Testville', $data['ville']);
    }

    // POST /api/ports — sans authentification → 401
    public function testCreerPortSansAuth(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/ports', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'nom'       => 'Port Fantôme',
            'ville'     => 'Nulle Part',
            'latitude'  => 0.0,
            'longitude' => 0.0,
            'capacite'  => 10,
        ]));

        $this->assertResponseStatusCodeSame(401);
    }

    // POST /api/ports — données invalides (latitude hors range) → 422
    public function testCreerPortDonneesInvalides(): void
    {
        $client = static::createClient();
        $token = $this->creerAdminEtToken($client);

        $client->request('POST', '/api/ports', [], [], [
            'CONTENT_TYPE'       => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode([
            'nom'       => '',
            'ville'     => 'Testville',
            'latitude'  => 999.0,
            'longitude' => 5.3698,
            'capacite'  => -5,
        ]));

        $this->assertResponseStatusCodeSame(422);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('erreurs', $data);
    }

    // PUT /api/ports/{id} — modifier un port en tant qu'admin
    public function testModifierPortAdmin(): void
    {
        $client = static::createClient();
        $token = $this->creerAdminEtToken($client);

        $client->request('POST', '/api/ports', [], [], [
            'CONTENT_TYPE'       => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode([
            'nom'       => 'Port Original',
            'ville'     => 'Marseille',
            'latitude'  => 43.2965,
            'longitude' => 5.3698,
            'capacite'  => 100,
        ]));

        $id = json_decode($client->getResponse()->getContent(), true)['id'];

        $client->request('PUT', "/api/ports/$id", [], [], [
            'CONTENT_TYPE'       => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode([
            'nom'       => 'Port Modifié',
            'ville'     => 'Marseille',
            'latitude'  => 43.2965,
            'longitude' => 5.3698,
            'capacite'  => 200,
        ]));

        $this->assertResponseStatusCodeSame(200);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertSame('Port Modifié', $data['nom']);
        $this->assertSame(200, $data['capacite']);
    }

    // DELETE /api/ports/{id} — supprimer un port en tant qu'admin
    public function testSupprimerPortAdmin(): void
    {
        $client = static::createClient();
        $token = $this->creerAdminEtToken($client);

        $client->request('POST', '/api/ports', [], [], [
            'CONTENT_TYPE'       => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode([
            'nom'       => 'Port à Supprimer',
            'ville'     => 'Lyon',
            'latitude'  => 45.7640,
            'longitude' => 4.8357,
            'capacite'  => 30,
        ]));

        $id = json_decode($client->getResponse()->getContent(), true)['id'];

        $client->request('DELETE', "/api/ports/$id", [], [], [
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ]);

        $this->assertResponseStatusCodeSame(200);

        $client->request('GET', "/api/ports/$id");
        $this->assertResponseStatusCodeSame(404);
    }
}
