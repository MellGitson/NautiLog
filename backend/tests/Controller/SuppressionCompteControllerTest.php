<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class SuppressionCompteControllerTest extends WebTestCase
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

    // DELETE /api/me — sans authentification → 401
    public function testSupprimerCompteSansAuth(): void
    {
        $client = static::createClient();
        $client->request('DELETE', '/api/me');

        $this->assertResponseStatusCodeSame(401);
    }

    // DELETE /api/me — suppression simple sans données liées
    public function testSupprimerCompteSimple(): void
    {
        $client = static::createClient();
        $token = $this->creerUtilisateurEtToken($client, 'suppression_simple@nautilog.fr', 'ROLE_RENTER');

        $client->request('DELETE', '/api/me', [], [], [
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ]);

        $this->assertResponseIsSuccessful();

        // Le token doit désormais être invalide car l'utilisateur n'existe plus.
        $client->request('GET', '/api/me', [], [], [
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ]);
        $this->assertResponseStatusCodeSame(401);
    }

    // DELETE /api/me — supprime les bateaux du propriétaire en cascade
    public function testSupprimerCompteSupprimeSesBateaux(): void
    {
        $client = static::createClient();
        $token = $this->creerUtilisateurEtToken($client, 'suppression_owner@nautilog.fr', 'ROLE_OWNER');

        $client->request('POST', '/api/bateaux', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode([
            'nom' => 'Bateau à supprimer',
            'type' => 'Voilier',
            'statut' => 'DISPONIBLE',
        ]));
        $bateauId = json_decode($client->getResponse()->getContent(), true)['id'];

        $client->request('DELETE', '/api/me', [], [], [
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ]);
        $this->assertResponseIsSuccessful();

        $client->request('GET', "/api/bateaux/$bateauId");
        $this->assertResponseStatusCodeSame(404);
    }

    // DELETE /api/me — notifie les locataires et propose des alternatives
    public function testSuppressionNotifieLesLocataires(): void
    {
        $client = static::createClient();
        $tokenOwner = $this->creerUtilisateurEtToken($client, 'suppression_owner_notif@nautilog.fr', 'ROLE_OWNER');

        $client->request('POST', '/api/bateaux', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenOwner",
        ], json_encode([
            'nom' => 'Bateau Réservé',
            'type' => 'Voilier',
            'statut' => 'DISPONIBLE',
        ]));
        $bateauId = json_decode($client->getResponse()->getContent(), true)['id'];

        $tokenRenter = $this->creerUtilisateurEtToken($client, 'suppression_renter_notif@nautilog.fr', 'ROLE_RENTER');
        $client->request('POST', '/api/reservations', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenRenter",
        ], json_encode([
            'bateauId' => $bateauId,
            'dateDebut' => '2026-08-01',
            'dateFin' => '2026-08-05',
        ]));
        $this->assertResponseStatusCodeSame(201);

        $client->request('DELETE', '/api/me', [], [], [
            'HTTP_AUTHORIZATION' => "Bearer $tokenOwner",
        ]);
        $this->assertResponseIsSuccessful();

        $client->request('GET', '/api/notifications', [], [], [
            'HTTP_AUTHORIZATION' => "Bearer $tokenRenter",
        ]);
        $this->assertResponseIsSuccessful();
        $notifications = json_decode($client->getResponse()->getContent(), true);
        $this->assertCount(1, $notifications);
        $this->assertStringContainsString('Bateau Réservé', $notifications[0]['message']);
        $this->assertFalse($notifications[0]['lu']);
    }

    // PATCH /api/notifications/{id}/lu — marque une notification comme lue
    public function testMarquerNotificationLue(): void
    {
        $client = static::createClient();
        $tokenOwner = $this->creerUtilisateurEtToken($client, 'suppression_owner_lu@nautilog.fr', 'ROLE_OWNER');

        $client->request('POST', '/api/bateaux', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenOwner",
        ], json_encode([
            'nom' => 'Bateau Lu',
            'type' => 'Voilier',
            'statut' => 'DISPONIBLE',
        ]));
        $bateauId = json_decode($client->getResponse()->getContent(), true)['id'];

        $tokenRenter = $this->creerUtilisateurEtToken($client, 'suppression_renter_lu@nautilog.fr', 'ROLE_RENTER');
        $client->request('POST', '/api/reservations', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenRenter",
        ], json_encode([
            'bateauId' => $bateauId,
            'dateDebut' => '2026-09-01',
            'dateFin' => '2026-09-05',
        ]));

        $client->request('DELETE', '/api/me', [], [], [
            'HTTP_AUTHORIZATION' => "Bearer $tokenOwner",
        ]);

        $client->request('GET', '/api/notifications', [], [], [
            'HTTP_AUTHORIZATION' => "Bearer $tokenRenter",
        ]);
        $notificationId = json_decode($client->getResponse()->getContent(), true)[0]['id'];

        $client->request('PATCH', "/api/notifications/$notificationId/lu", [], [], [
            'HTTP_AUTHORIZATION' => "Bearer $tokenRenter",
        ]);

        $this->assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertTrue($data['lu']);
    }

    // GET /api/notifications — sans authentification → 401
    public function testListeNotificationsSansAuth(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/notifications');

        $this->assertResponseStatusCodeSame(401);
    }
}
