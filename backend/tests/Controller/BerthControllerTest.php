<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class BerthControllerTest extends WebTestCase
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

    private function creerAdminEtToken(mixed $client): string
    {
        $email = 'admin_berth_'.uniqid().'@nautilog.fr';
        $this->creerUtilisateurEtToken($client, $email, 'ROLE_OWNER');

        $container = static::getContainer();
        $em = $container->get('doctrine')->getManager();
        $user = $em->getRepository(\App\Entity\User::class)->findOneBy(['email' => $email]);
        $user->setRoles(['ROLE_ADMIN']);
        $em->flush();

        $client->request('POST', '/api/auth/login', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email' => $email,
            'password' => 'Password1234!',
        ]));

        return json_decode($client->getResponse()->getContent(), true)['token'];
    }

    private function creerPort(mixed $client, string $tokenAdmin): int
    {
        $client->request('POST', '/api/ports', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenAdmin",
        ], json_encode([
            'nom' => 'Port Test Berth',
            'ville' => 'Marseille',
            'latitude' => 43.2965,
            'longitude' => 5.3698,
            'capacite' => 50,
        ]));

        return json_decode($client->getResponse()->getContent(), true)['id'];
    }

    // GET /api/ports/{portId}/emplacements — accès public
    public function testListeEmplacementsPublique(): void
    {
        $client = static::createClient();
        $tokenAdmin = $this->creerAdminEtToken($client);
        $portId = $this->creerPort($client, $tokenAdmin);

        $client->request('GET', "/api/ports/$portId/emplacements");

        $this->assertResponseIsSuccessful();
        $this->assertJson($client->getResponse()->getContent());
    }

    // POST /api/ports/{portId}/emplacements — sans authentification → 401
    public function testCreerEmplacementSansAuth(): void
    {
        $client = static::createClient();
        $tokenAdmin = $this->creerAdminEtToken($client);
        $portId = $this->creerPort($client, $tokenAdmin);

        $client->request('POST', "/api/ports/$portId/emplacements", [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'label' => 'Ponton A-1',
        ]));

        $this->assertResponseStatusCodeSame(401);
    }

    // POST /api/ports/{portId}/emplacements — non admin → 403
    public function testCreerEmplacementNonAdmin(): void
    {
        $client = static::createClient();
        $tokenAdmin = $this->creerAdminEtToken($client);
        $portId = $this->creerPort($client, $tokenAdmin);
        $tokenOwner = $this->creerUtilisateurEtToken($client, 'owner_berth@nautilog.fr', 'ROLE_OWNER');

        $client->request('POST', "/api/ports/$portId/emplacements", [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenOwner",
        ], json_encode([
            'label' => 'Ponton A-1',
        ]));

        $this->assertResponseStatusCodeSame(403);
    }

    // POST /api/ports/{portId}/emplacements — admin, création valide
    public function testCreerEmplacementAdmin(): void
    {
        $client = static::createClient();
        $tokenAdmin = $this->creerAdminEtToken($client);
        $portId = $this->creerPort($client, $tokenAdmin);

        $client->request('POST', "/api/ports/$portId/emplacements", [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenAdmin",
        ], json_encode([
            'label' => 'Ponton A-1',
            'latitude' => 43.2970,
            'longitude' => 5.3700,
        ]));

        $this->assertResponseStatusCodeSame(201);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertSame('Ponton A-1', $data['label']);
        $this->assertNull($data['bateau']);
    }

    // POST /api/ports/{portId}/emplacements — avec bateau assigné
    public function testCreerEmplacementAvecBateau(): void
    {
        $client = static::createClient();
        $tokenAdmin = $this->creerAdminEtToken($client);
        $portId = $this->creerPort($client, $tokenAdmin);
        $tokenOwner = $this->creerUtilisateurEtToken($client, 'owner_berth_bateau@nautilog.fr', 'ROLE_OWNER');

        $client->request('POST', '/api/bateaux', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenOwner",
        ], json_encode([
            'nom' => 'Bateau Emplacement',
            'type' => 'Voilier',
            'statut' => 'DISPONIBLE',
        ]));
        $bateauId = json_decode($client->getResponse()->getContent(), true)['id'];

        $client->request('POST', "/api/ports/$portId/emplacements", [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenAdmin",
        ], json_encode([
            'label' => 'Ponton B-2',
            'bateauId' => $bateauId,
        ]));

        $this->assertResponseStatusCodeSame(201);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertSame($bateauId, $data['bateau']['id']);
    }

    // POST /api/ports/{portId}/emplacements — label vide → 422
    public function testCreerEmplacementInvalide(): void
    {
        $client = static::createClient();
        $tokenAdmin = $this->creerAdminEtToken($client);
        $portId = $this->creerPort($client, $tokenAdmin);

        $client->request('POST', "/api/ports/$portId/emplacements", [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenAdmin",
        ], json_encode([
            'label' => '',
        ]));

        $this->assertResponseStatusCodeSame(422);
    }

    // DELETE /api/ports/{portId}/emplacements/{id} — admin
    public function testSupprimerEmplacement(): void
    {
        $client = static::createClient();
        $tokenAdmin = $this->creerAdminEtToken($client);
        $portId = $this->creerPort($client, $tokenAdmin);

        $client->request('POST', "/api/ports/$portId/emplacements", [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenAdmin",
        ], json_encode(['label' => 'Ponton C-3']));
        $id = json_decode($client->getResponse()->getContent(), true)['id'];

        $client->request('DELETE', "/api/ports/$portId/emplacements/$id", [], [], [
            'HTTP_AUTHORIZATION' => "Bearer $tokenAdmin",
        ]);

        $this->assertResponseStatusCodeSame(200);
    }
}
