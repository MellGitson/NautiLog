<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class ProfilControllerTest extends WebTestCase
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

    // GET /api/me — sans authentification → 401
    public function testGetProfilNonAuthentifie(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/me');

        $this->assertResponseStatusCodeSame(401);
    }

    // GET /api/me — retourne le profil de l'utilisateur connecté
    public function testGetProfilAuthentifie(): void
    {
        $client = static::createClient();
        $token = $this->creerUtilisateurEtToken($client, 'profil_get@nautilog.fr', 'ROLE_OWNER');

        $client->request('GET', '/api/me', [], [], [
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ]);

        $this->assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertSame('profil_get@nautilog.fr', $data['email']);
        $this->assertArrayNotHasKey('password', $data);
        $this->assertArrayNotHasKey('licenseNumber', $data);
    }

    // PATCH /api/me — met à jour les champs autorisés
    public function testUpdateProfilValide(): void
    {
        $client = static::createClient();
        $token = $this->creerUtilisateurEtToken($client, 'profil_update@nautilog.fr', 'ROLE_RENTER');

        $client->request('PATCH', '/api/me', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode([
            'firstName' => 'Jean',
            'lastName' => 'Dupont',
            'phone' => '0601020304',
        ]));

        $this->assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertSame('Jean', $data['firstName']);
        $this->assertSame('Dupont', $data['lastName']);
        $this->assertSame('0601020304', $data['phone']);
    }

    // PATCH /api/me — téléphone invalide → 422
    public function testUpdateProfilTelephoneInvalide(): void
    {
        $client = static::createClient();
        $token = $this->creerUtilisateurEtToken($client, 'profil_tel@nautilog.fr', 'ROLE_RENTER');

        $client->request('PATCH', '/api/me', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode([
            'phone' => 'abc',
        ]));

        $this->assertResponseStatusCodeSame(422);
    }

    // PATCH /api/me — tentative d'injection du champ roles → ignorée
    public function testUpdateProfilIgnoreChampRoles(): void
    {
        $client = static::createClient();
        $token = $this->creerUtilisateurEtToken($client, 'profil_roles@nautilog.fr', 'ROLE_RENTER');

        $client->request('PATCH', '/api/me', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode([
            'firstName' => 'Test',
            'roles' => ['ROLE_ADMIN'],
        ]));

        $this->assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertSame(['ROLE_RENTER', 'ROLE_USER'], $data['roles']);
    }
}
