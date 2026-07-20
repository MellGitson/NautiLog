<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class AdminStatsControllerTest extends WebTestCase
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
        $email = 'admin_stats_'.uniqid().'@nautilog.fr';
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

    // GET /api/admin/stats — sans authentification → 401
    public function testStatsNonAuthentifie(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/admin/stats');

        $this->assertResponseStatusCodeSame(401);
    }

    // GET /api/admin/stats — non admin → 403
    public function testStatsNonAdmin(): void
    {
        $client = static::createClient();
        $token = $this->creerUtilisateurEtToken($client, 'renter_stats@nautilog.fr', 'ROLE_RENTER');

        $client->request('GET', '/api/admin/stats', [], [], [
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ]);

        $this->assertResponseStatusCodeSame(403);
    }

    // GET /api/admin/stats — admin → structure attendue
    public function testStatsAdmin(): void
    {
        $client = static::createClient();
        $token = $this->creerAdminEtToken($client);

        $client->request('GET', '/api/admin/stats', [], [], [
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ]);

        $this->assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayHasKey('bateaux', $data);
        $this->assertArrayHasKey('total', $data['bateaux']);
        $this->assertArrayHasKey('parStatut', $data['bateaux']);

        $this->assertArrayHasKey('ports', $data);
        $this->assertArrayHasKey('utilisateurs', $data);
        $this->assertArrayHasKey('parRole', $data['utilisateurs']);
        $this->assertGreaterThanOrEqual(1, $data['utilisateurs']['parRole']['ROLE_ADMIN']);

        $this->assertArrayHasKey('trajets', $data);
    }
}
