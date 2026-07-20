<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class ReservationControllerTest extends WebTestCase
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
            'nom' => 'Bateau Réservation',
            'type' => 'Voilier',
            'statut' => 'DISPONIBLE',
        ]));

        return json_decode($client->getResponse()->getContent(), true)['id'];
    }

    // POST /api/reservations — sans authentification → 401
    public function testCreerReservationSansAuth(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/reservations', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'bateauId' => 1,
            'dateDebut' => '2026-08-01',
            'dateFin' => '2026-08-05',
        ]));

        $this->assertResponseStatusCodeSame(401);
    }

    // POST /api/reservations — création valide
    public function testCreerReservationValide(): void
    {
        $client = static::createClient();
        $tokenOwner = $this->creerUtilisateurEtToken($client, 'owner_resa@nautilog.fr', 'ROLE_OWNER');
        $bateauId = $this->creerBateau($client, $tokenOwner);
        $tokenRenter = $this->creerUtilisateurEtToken($client, 'renter_resa@nautilog.fr', 'ROLE_RENTER');

        $client->request('POST', '/api/reservations', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenRenter",
        ], json_encode([
            'bateauId' => $bateauId,
            'dateDebut' => '2026-08-01',
            'dateFin' => '2026-08-05',
        ]));

        $this->assertResponseStatusCodeSame(201);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertSame('EN_ATTENTE', $data['statut']);
        $this->assertSame('renter_resa@nautilog.fr', $data['locataire']['email']);
    }

    // POST /api/reservations — chevauchement de dates → 409
    public function testCreerReservationChevauchement(): void
    {
        $client = static::createClient();
        $tokenOwner = $this->creerUtilisateurEtToken($client, 'owner_resa_chevauche@nautilog.fr', 'ROLE_OWNER');
        $bateauId = $this->creerBateau($client, $tokenOwner);
        $tokenRenter = $this->creerUtilisateurEtToken($client, 'renter_resa_chevauche@nautilog.fr', 'ROLE_RENTER');

        $client->request('POST', '/api/reservations', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenRenter",
        ], json_encode([
            'bateauId' => $bateauId,
            'dateDebut' => '2026-08-01',
            'dateFin' => '2026-08-10',
        ]));
        $this->assertResponseStatusCodeSame(201);

        $client->request('POST', '/api/reservations', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenRenter",
        ], json_encode([
            'bateauId' => $bateauId,
            'dateDebut' => '2026-08-05',
            'dateFin' => '2026-08-15',
        ]));

        $this->assertResponseStatusCodeSame(409);
    }

    // POST /api/reservations — date de fin avant date de début → 422
    public function testCreerReservationDatesInvalides(): void
    {
        $client = static::createClient();
        $tokenOwner = $this->creerUtilisateurEtToken($client, 'owner_resa_dates@nautilog.fr', 'ROLE_OWNER');
        $bateauId = $this->creerBateau($client, $tokenOwner);
        $tokenRenter = $this->creerUtilisateurEtToken($client, 'renter_resa_dates@nautilog.fr', 'ROLE_RENTER');

        $client->request('POST', '/api/reservations', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenRenter",
        ], json_encode([
            'bateauId' => $bateauId,
            'dateDebut' => '2026-08-10',
            'dateFin' => '2026-08-01',
        ]));

        $this->assertResponseStatusCodeSame(422);
    }

    // PATCH /api/reservations/{id}/statut — le propriétaire du bateau confirme
    public function testProprietaireConfirmeReservation(): void
    {
        $client = static::createClient();
        $tokenOwner = $this->creerUtilisateurEtToken($client, 'owner_resa_confirme@nautilog.fr', 'ROLE_OWNER');
        $bateauId = $this->creerBateau($client, $tokenOwner);
        $tokenRenter = $this->creerUtilisateurEtToken($client, 'renter_resa_confirme@nautilog.fr', 'ROLE_RENTER');

        $client->request('POST', '/api/reservations', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenRenter",
        ], json_encode([
            'bateauId' => $bateauId,
            'dateDebut' => '2026-09-01',
            'dateFin' => '2026-09-05',
        ]));
        $reservationId = json_decode($client->getResponse()->getContent(), true)['id'];

        $client->request('PATCH', "/api/reservations/$reservationId/statut", [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenOwner",
        ], json_encode(['statut' => 'CONFIRMEE']));

        $this->assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertSame('CONFIRMEE', $data['statut']);
    }

    // PATCH /api/reservations/{id}/statut — le locataire ne peut pas confirmer, seulement annuler
    public function testLocataireNePeutPasConfirmer(): void
    {
        $client = static::createClient();
        $tokenOwner = $this->creerUtilisateurEtToken($client, 'owner_resa_refus@nautilog.fr', 'ROLE_OWNER');
        $bateauId = $this->creerBateau($client, $tokenOwner);
        $tokenRenter = $this->creerUtilisateurEtToken($client, 'renter_resa_refus@nautilog.fr', 'ROLE_RENTER');

        $client->request('POST', '/api/reservations', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenRenter",
        ], json_encode([
            'bateauId' => $bateauId,
            'dateDebut' => '2026-09-10',
            'dateFin' => '2026-09-15',
        ]));
        $reservationId = json_decode($client->getResponse()->getContent(), true)['id'];

        $client->request('PATCH', "/api/reservations/$reservationId/statut", [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenRenter",
        ], json_encode(['statut' => 'CONFIRMEE']));

        $this->assertResponseStatusCodeSame(403);
    }

    // PATCH /api/reservations/{id}/statut — le locataire peut annuler sa réservation
    public function testLocataireAnnuleReservation(): void
    {
        $client = static::createClient();
        $tokenOwner = $this->creerUtilisateurEtToken($client, 'owner_resa_annule@nautilog.fr', 'ROLE_OWNER');
        $bateauId = $this->creerBateau($client, $tokenOwner);
        $tokenRenter = $this->creerUtilisateurEtToken($client, 'renter_resa_annule@nautilog.fr', 'ROLE_RENTER');

        $client->request('POST', '/api/reservations', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenRenter",
        ], json_encode([
            'bateauId' => $bateauId,
            'dateDebut' => '2026-09-20',
            'dateFin' => '2026-09-25',
        ]));
        $reservationId = json_decode($client->getResponse()->getContent(), true)['id'];

        $client->request('PATCH', "/api/reservations/$reservationId/statut", [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenRenter",
        ], json_encode(['statut' => 'ANNULEE']));

        $this->assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertSame('ANNULEE', $data['statut']);
    }

    // PATCH /api/reservations/{id}/statut — un tiers non concerné → 403
    public function testTiersNonConcerne(): void
    {
        $client = static::createClient();
        $tokenOwner = $this->creerUtilisateurEtToken($client, 'owner_resa_tiers@nautilog.fr', 'ROLE_OWNER');
        $bateauId = $this->creerBateau($client, $tokenOwner);
        $tokenRenter = $this->creerUtilisateurEtToken($client, 'renter_resa_tiers@nautilog.fr', 'ROLE_RENTER');
        $tokenTiers = $this->creerUtilisateurEtToken($client, 'tiers_resa@nautilog.fr', 'ROLE_RENTER');

        $client->request('POST', '/api/reservations', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenRenter",
        ], json_encode([
            'bateauId' => $bateauId,
            'dateDebut' => '2026-10-01',
            'dateFin' => '2026-10-05',
        ]));
        $reservationId = json_decode($client->getResponse()->getContent(), true)['id'];

        $client->request('PATCH', "/api/reservations/$reservationId/statut", [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenTiers",
        ], json_encode(['statut' => 'ANNULEE']));

        $this->assertResponseStatusCodeSame(403);
    }

    // GET /api/reservations — le locataire ne voit que ses réservations (et celles de ses bateaux)
    public function testListeFiltreeParUtilisateur(): void
    {
        $client = static::createClient();
        $tokenOwner = $this->creerUtilisateurEtToken($client, 'owner_resa_liste@nautilog.fr', 'ROLE_OWNER');
        $bateauId = $this->creerBateau($client, $tokenOwner);
        $tokenRenter = $this->creerUtilisateurEtToken($client, 'renter_resa_liste@nautilog.fr', 'ROLE_RENTER');
        $tokenAutre = $this->creerUtilisateurEtToken($client, 'autre_resa_liste@nautilog.fr', 'ROLE_RENTER');

        $client->request('POST', '/api/reservations', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenRenter",
        ], json_encode([
            'bateauId' => $bateauId,
            'dateDebut' => '2026-11-01',
            'dateFin' => '2026-11-05',
        ]));

        $client->request('GET', '/api/reservations', [], [], [
            'HTTP_AUTHORIZATION' => "Bearer $tokenAutre",
        ]);

        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertSame([], $data);
    }
}
