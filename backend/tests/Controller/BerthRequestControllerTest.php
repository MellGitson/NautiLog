<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class BerthRequestControllerTest extends WebTestCase
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
        $email = 'admin_berth_req_'.uniqid().'@nautilog.fr';
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
            'nom' => 'Port Test Demande',
            'ville' => 'Marseille',
            'latitude' => 43.2965,
            'longitude' => 5.3698,
            'capacite' => 8,
        ]));

        return json_decode($client->getResponse()->getContent(), true)['id'];
    }

    private function creerEmplacement(mixed $client, string $tokenAdmin, int $portId, string $label = 'Ponton A-1'): int
    {
        $client->request('POST', "/api/ports/$portId/emplacements", [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenAdmin",
        ], json_encode(['label' => $label]));

        return json_decode($client->getResponse()->getContent(), true)['id'];
    }

    private function creerBateau(mixed $client, string $tokenOwner, string $nom = 'Bateau Demande'): int
    {
        $client->request('POST', '/api/bateaux', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenOwner",
        ], json_encode([
            'nom' => $nom,
            'type' => 'Voilier',
            'statut' => 'DISPONIBLE',
        ]));

        return json_decode($client->getResponse()->getContent(), true)['id'];
    }

    // POST /api/demandes-emplacements — owner crée une demande valide
    public function testCreerDemandeOwner(): void
    {
        $client = static::createClient();
        $tokenAdmin = $this->creerAdminEtToken($client);
        $portId = $this->creerPort($client, $tokenAdmin);
        $emplacementId = $this->creerEmplacement($client, $tokenAdmin, $portId);
        $tokenOwner = $this->creerUtilisateurEtToken($client, 'owner_demande@nautilog.fr', 'ROLE_OWNER');
        $bateauId = $this->creerBateau($client, $tokenOwner);

        $client->request('POST', '/api/demandes-emplacements', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenOwner",
        ], json_encode([
            'emplacementId' => $emplacementId,
            'bateauId' => $bateauId,
        ]));

        $this->assertResponseStatusCodeSame(201);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertSame('EN_ATTENTE', $data['statut']);
        $this->assertSame($bateauId, $data['bateau']['id']);
    }

    // POST /api/demandes-emplacements — demande pour le bateau d'un autre → 403
    public function testCreerDemandePourBateauDautrui(): void
    {
        $client = static::createClient();
        $tokenAdmin = $this->creerAdminEtToken($client);
        $portId = $this->creerPort($client, $tokenAdmin);
        $emplacementId = $this->creerEmplacement($client, $tokenAdmin, $portId);
        $tokenOwnerA = $this->creerUtilisateurEtToken($client, 'owner_demande_a@nautilog.fr', 'ROLE_OWNER');
        $bateauId = $this->creerBateau($client, $tokenOwnerA);
        $tokenOwnerB = $this->creerUtilisateurEtToken($client, 'owner_demande_b@nautilog.fr', 'ROLE_OWNER');

        $client->request('POST', '/api/demandes-emplacements', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenOwnerB",
        ], json_encode([
            'emplacementId' => $emplacementId,
            'bateauId' => $bateauId,
        ]));

        $this->assertResponseStatusCodeSame(403);
    }

    // POST /api/demandes-emplacements — emplacement déjà occupé → 409
    public function testCreerDemandeEmplacementOccupe(): void
    {
        $client = static::createClient();
        $tokenAdmin = $this->creerAdminEtToken($client);
        $portId = $this->creerPort($client, $tokenAdmin);
        $tokenOwner = $this->creerUtilisateurEtToken($client, 'owner_demande_occupe@nautilog.fr', 'ROLE_OWNER');
        $bateauOccupant = $this->creerBateau($client, $tokenOwner, 'Bateau Occupant');

        $client->request('POST', "/api/ports/$portId/emplacements", [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenAdmin",
        ], json_encode(['label' => 'Ponton Occupé', 'bateauId' => $bateauOccupant]));
        $emplacementId = json_decode($client->getResponse()->getContent(), true)['id'];

        $bateauDemandeur = $this->creerBateau($client, $tokenOwner, 'Bateau Demandeur');

        $client->request('POST', '/api/demandes-emplacements', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenOwner",
        ], json_encode([
            'emplacementId' => $emplacementId,
            'bateauId' => $bateauDemandeur,
        ]));

        $this->assertResponseStatusCodeSame(409);
    }

    // PATCH /api/demandes-emplacements/{id}/statut — admin approuve → assigne le bateau
    public function testApprouverDemandeAssigneLeBateau(): void
    {
        $client = static::createClient();
        $tokenAdmin = $this->creerAdminEtToken($client);
        $portId = $this->creerPort($client, $tokenAdmin);
        $emplacementId = $this->creerEmplacement($client, $tokenAdmin, $portId);
        $tokenOwner = $this->creerUtilisateurEtToken($client, 'owner_demande_approuve@nautilog.fr', 'ROLE_OWNER');
        $bateauId = $this->creerBateau($client, $tokenOwner);

        $client->request('POST', '/api/demandes-emplacements', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenOwner",
        ], json_encode(['emplacementId' => $emplacementId, 'bateauId' => $bateauId]));
        $demandeId = json_decode($client->getResponse()->getContent(), true)['id'];

        $client->request('PATCH', "/api/demandes-emplacements/$demandeId/statut", [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenAdmin",
        ], json_encode(['statut' => 'APPROUVEE']));

        $this->assertResponseStatusCodeSame(200);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertSame('APPROUVEE', $data['statut']);

        $client->request('GET', "/api/ports/$portId/emplacements", [], [], [
            'HTTP_AUTHORIZATION' => "Bearer $tokenOwner",
        ]);
        $emplacements = json_decode($client->getResponse()->getContent(), true);
        $emplacement = current(array_filter($emplacements, fn ($e) => $e['id'] === $emplacementId));
        $this->assertSame($bateauId, $emplacement['bateau']['id']);

        $client->request('GET', "/api/ports/$portId", [], [], [
            'HTTP_AUTHORIZATION' => "Bearer $tokenOwner",
        ]);
        $portData = json_decode($client->getResponse()->getContent(), true);
        $this->assertSame(1, $portData['bateaux']);
    }

    // PUT /api/ports/{portId}/emplacements/{id} — libérer un emplacement retire aussi le port du bateau
    public function testLibererEmplacementRetireLePortDuBateau(): void
    {
        $client = static::createClient();
        $tokenAdmin = $this->creerAdminEtToken($client);
        $portId = $this->creerPort($client, $tokenAdmin);
        $emplacementId = $this->creerEmplacement($client, $tokenAdmin, $portId);
        $tokenOwner = $this->creerUtilisateurEtToken($client, 'owner_demande_libere@nautilog.fr', 'ROLE_OWNER');
        $bateauId = $this->creerBateau($client, $tokenOwner);

        $client->request('POST', '/api/demandes-emplacements', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenOwner",
        ], json_encode(['emplacementId' => $emplacementId, 'bateauId' => $bateauId]));
        $demandeId = json_decode($client->getResponse()->getContent(), true)['id'];

        $client->request('PATCH', "/api/demandes-emplacements/$demandeId/statut", [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenAdmin",
        ], json_encode(['statut' => 'APPROUVEE']));

        $client->request('PUT', "/api/ports/$portId/emplacements/$emplacementId", [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenAdmin",
        ], json_encode(['label' => 'Ponton A-1', 'bateauId' => null]));

        $this->assertResponseStatusCodeSame(200);

        $client->request('GET', "/api/ports/$portId", [], [], [
            'HTTP_AUTHORIZATION' => "Bearer $tokenOwner",
        ]);
        $portData = json_decode($client->getResponse()->getContent(), true);
        $this->assertSame(0, $portData['bateaux']);
    }

    // PATCH /api/demandes-emplacements/{id}/statut — owner ne peut pas traiter → 403
    public function testTraiterDemandeNonAdmin(): void
    {
        $client = static::createClient();
        $tokenAdmin = $this->creerAdminEtToken($client);
        $portId = $this->creerPort($client, $tokenAdmin);
        $emplacementId = $this->creerEmplacement($client, $tokenAdmin, $portId);
        $tokenOwner = $this->creerUtilisateurEtToken($client, 'owner_demande_refus@nautilog.fr', 'ROLE_OWNER');
        $bateauId = $this->creerBateau($client, $tokenOwner);

        $client->request('POST', '/api/demandes-emplacements', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenOwner",
        ], json_encode(['emplacementId' => $emplacementId, 'bateauId' => $bateauId]));
        $demandeId = json_decode($client->getResponse()->getContent(), true)['id'];

        $client->request('PATCH', "/api/demandes-emplacements/$demandeId/statut", [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenOwner",
        ], json_encode(['statut' => 'APPROUVEE']));

        $this->assertResponseStatusCodeSame(403);
    }

    // GET /api/demandes-emplacements — owner ne voit que ses propres demandes
    public function testListeDemandesOwnerNeVoitQueLesSiennes(): void
    {
        $client = static::createClient();
        $tokenAdmin = $this->creerAdminEtToken($client);
        $portId = $this->creerPort($client, $tokenAdmin);

        $tokenOwnerA = $this->creerUtilisateurEtToken($client, 'owner_liste_demande_a@nautilog.fr', 'ROLE_OWNER');
        $emplacementA = $this->creerEmplacement($client, $tokenAdmin, $portId, 'Ponton Liste A');
        $bateauA = $this->creerBateau($client, $tokenOwnerA, 'Bateau Liste A');
        $client->request('POST', '/api/demandes-emplacements', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenOwnerA",
        ], json_encode(['emplacementId' => $emplacementA, 'bateauId' => $bateauA]));

        $tokenOwnerB = $this->creerUtilisateurEtToken($client, 'owner_liste_demande_b@nautilog.fr', 'ROLE_OWNER');
        $emplacementB = $this->creerEmplacement($client, $tokenAdmin, $portId, 'Ponton Liste B');
        $bateauB = $this->creerBateau($client, $tokenOwnerB, 'Bateau Liste B');
        $client->request('POST', '/api/demandes-emplacements', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenOwnerB",
        ], json_encode(['emplacementId' => $emplacementB, 'bateauId' => $bateauB]));

        $client->request('GET', '/api/demandes-emplacements', [], [], [
            'HTTP_AUTHORIZATION' => "Bearer $tokenOwnerB",
        ]);

        $this->assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);
        $noms = array_map(fn (array $d) => $d['bateau']['nom'], $data);
        $this->assertContains('Bateau Liste B', $noms);
        $this->assertNotContains('Bateau Liste A', $noms);
    }
}
