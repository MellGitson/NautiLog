<?php

namespace App\Tests\Controller;

use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class PortControllerTest extends WebTestCase
{
    // ROLE_ADMIN n'est pas créable via /api/auth/register (accès public volontairement
    // restreint à ROLE_OWNER/ROLE_RENTER), donc l'utilisateur admin est créé directement
    // en base pour ces tests.
    private function creerAdminEtToken(mixed $client): string
    {
        $email = 'admin_port_'.uniqid().'@nautilog.fr';
        $password = 'Admin1234!';

        $container = static::getContainer();
        $em = $container->get('doctrine')->getManager();
        $hasher = $container->get(UserPasswordHasherInterface::class);

        $admin = new User();
        $admin->setEmail($email);
        $admin->setRoles(['ROLE_ADMIN']);
        $admin->setPassword($hasher->hashPassword($admin, $password));
        $em->persist($admin);
        $em->flush();

        $client->request('POST', '/api/auth/login', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email' => $email,
            'password' => $password,
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
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode([
            'nom' => 'Port de Test',
            'ville' => 'Testville',
            'latitude' => 43.2965,
            'longitude' => 5.3698,
            'capacite' => 8,
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
            'nom' => 'Port Fantôme',
            'ville' => 'Nulle Part',
            'latitude' => 0.0,
            'longitude' => 0.0,
            'capacite' => 10,
        ]));

        $this->assertResponseStatusCodeSame(401);
    }

    // POST /api/ports — données invalides (latitude hors range) → 422
    public function testCreerPortDonneesInvalides(): void
    {
        $client = static::createClient();
        $token = $this->creerAdminEtToken($client);

        $client->request('POST', '/api/ports', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode([
            'nom' => '',
            'ville' => 'Testville',
            'latitude' => 999.0,
            'longitude' => 5.3698,
            'capacite' => -5,
        ]));

        $this->assertResponseStatusCodeSame(422);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('erreurs', $data);
    }

    // POST /api/ports — capacité supérieure à 10 → 422 (pas de monopole sur les emplacements du port)
    public function testCreerPortCapaciteTropElevee(): void
    {
        $client = static::createClient();
        $token = $this->creerAdminEtToken($client);

        $client->request('POST', '/api/ports', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode([
            'nom' => 'Port Trop Grand',
            'ville' => 'Testville',
            'latitude' => 43.2965,
            'longitude' => 5.3698,
            'capacite' => 200,
        ]));

        $this->assertResponseStatusCodeSame(422);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('capacite', $data['erreurs']);
    }

    // PUT /api/ports/{id} — modifier un port en tant qu'admin
    public function testModifierPortAdmin(): void
    {
        $client = static::createClient();
        $token = $this->creerAdminEtToken($client);

        $client->request('POST', '/api/ports', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode([
            'nom' => 'Port Original',
            'ville' => 'Marseille',
            'latitude' => 43.2965,
            'longitude' => 5.3698,
            'capacite' => 8,
        ]));

        $id = json_decode($client->getResponse()->getContent(), true)['id'];

        $client->request('PUT', "/api/ports/$id", [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode([
            'nom' => 'Port Modifié',
            'ville' => 'Marseille',
            'latitude' => 43.2965,
            'longitude' => 5.3698,
            'capacite' => 10,
        ]));

        $this->assertResponseStatusCodeSame(200);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertSame('Port Modifié', $data['nom']);
        $this->assertSame(10, $data['capacite']);
    }

    // DELETE /api/ports/{id} — supprimer un port en tant qu'admin
    public function testSupprimerPortAdmin(): void
    {
        $client = static::createClient();
        $token = $this->creerAdminEtToken($client);

        $client->request('POST', '/api/ports', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode([
            'nom' => 'Port à Supprimer',
            'ville' => 'Lyon',
            'latitude' => 45.7640,
            'longitude' => 4.8357,
            'capacite' => 8,
        ]));

        $id = json_decode($client->getResponse()->getContent(), true)['id'];

        $client->request('DELETE', "/api/ports/$id", [], [], [
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ]);

        $this->assertResponseStatusCodeSame(200);

        $client->request('GET', "/api/ports/$id");
        $this->assertResponseStatusCodeSame(404);
    }

    // DELETE /api/ports/{id} — port avec un emplacement vide (aucun bateau amarré) → suppression autorisée
    public function testSupprimerPortAvecEmplacementVide(): void
    {
        $client = static::createClient();
        $token = $this->creerAdminEtToken($client);

        $client->request('POST', '/api/ports', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode([
            'nom' => 'Port Avec Emplacement Vide',
            'ville' => 'Nice',
            'latitude' => 43.7009,
            'longitude' => 7.2683,
            'capacite' => 8,
        ]));
        $portId = json_decode($client->getResponse()->getContent(), true)['id'];

        $client->request('POST', "/api/ports/$portId/emplacements", [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode(['label' => 'A1']));
        $this->assertResponseStatusCodeSame(201);

        $client->request('DELETE', "/api/ports/$portId", [], [], [
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ]);

        $this->assertResponseStatusCodeSame(200);

        $client->request('GET', "/api/ports/$portId");
        $this->assertResponseStatusCodeSame(404);
    }

    // DELETE /api/ports/{id} — port avec bateaux rattachés → 409
    public function testSupprimerPortAvecBateauxRattaches(): void
    {
        $client = static::createClient();
        $tokenAdmin = $this->creerAdminEtToken($client);

        $client->request('POST', '/api/ports', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenAdmin",
        ], json_encode([
            'nom' => 'Port Occupé',
            'ville' => 'Nice',
            'latitude' => 43.7009,
            'longitude' => 7.2683,
            'capacite' => 8,
        ]));
        $portId = json_decode($client->getResponse()->getContent(), true)['id'];

        $email = 'owner_port_occupe_'.uniqid().'@nautilog.fr';
        $client->request('POST', '/api/auth/register', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email' => $email,
            'password' => 'Password1234!',
            'role' => 'ROLE_OWNER',
        ]));
        $client->request('POST', '/api/auth/login', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email' => $email,
            'password' => 'Password1234!',
        ]));
        $tokenOwner = json_decode($client->getResponse()->getContent(), true)['token'];

        $client->request('POST', '/api/bateaux', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenOwner",
        ], json_encode([
            'nom' => 'Bateau du Port Occupé',
            'type' => 'Voilier',
            'statut' => 'DISPONIBLE',
            'portId' => $portId,
        ]));

        $client->request('DELETE', "/api/ports/$portId", [], [], [
            'HTTP_AUTHORIZATION' => "Bearer $tokenAdmin",
        ]);

        $this->assertResponseStatusCodeSame(409);
    }

    // DELETE /api/ports/lot — suppression groupée en tant qu'admin
    public function testSupprimerLotPortsAdmin(): void
    {
        $client = static::createClient();
        $token = $this->creerAdminEtToken($client);

        $client->request('POST', '/api/ports', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode([
            'nom' => 'Port Lot 1', 'ville' => 'Brest', 'latitude' => 48.3904, 'longitude' => -4.4861, 'capacite' => 5,
        ]));
        $id1 = json_decode($client->getResponse()->getContent(), true)['id'];

        $client->request('POST', '/api/ports', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode([
            'nom' => 'Port Lot 2', 'ville' => 'Brest', 'latitude' => 48.3904, 'longitude' => -4.4861, 'capacite' => 5,
        ]));
        $id2 = json_decode($client->getResponse()->getContent(), true)['id'];

        $client->request('DELETE', '/api/ports/lot', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode(['ids' => [$id1, $id2]]));

        $this->assertResponseStatusCodeSame(200);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertContains($id1, $data['supprimes']);
        $this->assertContains($id2, $data['supprimes']);

        $client->request('GET', "/api/ports/$id1");
        $this->assertResponseStatusCodeSame(404);
    }

    // DELETE /api/ports/lot — sans authentification → 401
    public function testSupprimerLotPortsSansAuth(): void
    {
        $client = static::createClient();
        $client->request('DELETE', '/api/ports/lot', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode(['ids' => [1]]));

        $this->assertResponseStatusCodeSame(401);
    }

    // DELETE /api/ports/lot — en tant qu'owner → 403
    public function testSupprimerLotPortsOwnerRefuse(): void
    {
        $client = static::createClient();
        $email = 'owner_lot_refuse_'.uniqid().'@nautilog.fr';
        $client->request('POST', '/api/auth/register', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email' => $email,
            'password' => 'Password1234!',
            'role' => 'ROLE_OWNER',
        ]));
        $client->request('POST', '/api/auth/login', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email' => $email,
            'password' => 'Password1234!',
        ]));
        $token = json_decode($client->getResponse()->getContent(), true)['token'];

        $client->request('DELETE', '/api/ports/lot', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode(['ids' => [1]]));

        $this->assertResponseStatusCodeSame(403);
    }
}
