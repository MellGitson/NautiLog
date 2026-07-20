<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class AdminUtilisateurControllerTest extends WebTestCase
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
        // Contourne la contrainte Assert\Choice de RegisterDto (ROLE_ADMIN non autorisé à l'inscription)
        // en créant l'utilisateur via register puis en le promouvant directement en base.
        $email = 'admin_test_'.uniqid().'@nautilog.fr';
        $token = $this->creerUtilisateurEtToken($client, $email, 'ROLE_OWNER');

        $container = static::getContainer();
        $em = $container->get('doctrine')->getManager();
        $user = $em->getRepository(\App\Entity\User::class)->findOneBy(['email' => $email]);
        $user->setRoles(['ROLE_ADMIN']);
        $em->flush();

        // Le rôle est encodé dans le JWT existant, il faut se reconnecter pour un token à jour.
        $client->request('POST', '/api/auth/login', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email' => $email,
            'password' => 'Password1234!',
        ]));

        return json_decode($client->getResponse()->getContent(), true)['token'];
    }

    // GET /api/admin/users — sans authentification → 401
    public function testListeNonAuthentifie(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/admin/users');

        $this->assertResponseStatusCodeSame(401);
    }

    // GET /api/admin/users — authentifié mais non admin → 403
    public function testListeNonAdmin(): void
    {
        $client = static::createClient();
        $token = $this->creerUtilisateurEtToken($client, 'user_normal@nautilog.fr', 'ROLE_RENTER');

        $client->request('GET', '/api/admin/users', [], [], [
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ]);

        $this->assertResponseStatusCodeSame(403);
    }

    // GET /api/admin/users — admin → liste des utilisateurs
    public function testListeAdmin(): void
    {
        $client = static::createClient();
        $token = $this->creerAdminEtToken($client);

        $client->request('GET', '/api/admin/users', [], [], [
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ]);

        $this->assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
        $this->assertNotEmpty($data);
    }

    // PATCH /api/admin/users/{id}/role — admin change le rôle d'un utilisateur
    public function testModifierRoleUtilisateur(): void
    {
        $client = static::createClient();
        $adminToken = $this->creerAdminEtToken($client);

        $client->request('POST', '/api/auth/register', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email' => 'cible_role@nautilog.fr',
            'password' => 'Password1234!',
            'role' => 'ROLE_RENTER',
        ]));
        $cibleId = json_decode($client->getResponse()->getContent(), true)['user']['id'];

        $client->request('PATCH', "/api/admin/users/$cibleId/role", [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $adminToken",
        ], json_encode(['role' => 'ROLE_OWNER']));

        $this->assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertContains('ROLE_OWNER', $data['roles']);
    }

    // PATCH /api/admin/users/{id}/role — rôle invalide → 422
    public function testModifierRoleInvalide(): void
    {
        $client = static::createClient();
        $adminToken = $this->creerAdminEtToken($client);

        $client->request('POST', '/api/auth/register', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email' => 'cible_role_invalide@nautilog.fr',
            'password' => 'Password1234!',
            'role' => 'ROLE_RENTER',
        ]));
        $cibleId = json_decode($client->getResponse()->getContent(), true)['user']['id'];

        $client->request('PATCH', "/api/admin/users/$cibleId/role", [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $adminToken",
        ], json_encode(['role' => 'ROLE_INCONNU']));

        $this->assertResponseStatusCodeSame(422);
    }
}
