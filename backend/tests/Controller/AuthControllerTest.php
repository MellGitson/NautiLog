<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class AuthControllerTest extends WebTestCase
{
    // POST /api/auth/register — inscription valide
    public function testInscriptionValide(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/auth/register', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email'    => 'nouveau@nautilog.fr',
            'password' => 'Password1234!',
            'role'     => 'ROLE_OWNER',
        ]));

        $this->assertResponseStatusCodeSame(201);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('user', $data);
        $this->assertSame('nouveau@nautilog.fr', $data['user']['email']);
    }

    // POST /api/auth/register — email invalide → 422
    public function testInscriptionEmailInvalide(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/auth/register', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email'    => 'pas-un-email',
            'password' => 'Password1234!',
            'role'     => 'ROLE_OWNER',
        ]));

        $this->assertResponseStatusCodeSame(422);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('errors', $data);
    }

    // POST /api/auth/register — mot de passe trop court → 422
    public function testInscriptionMotDePasseTropCourt(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/auth/register', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email'    => 'test@nautilog.fr',
            'password' => '123',
            'role'     => 'ROLE_OWNER',
        ]));

        $this->assertResponseStatusCodeSame(422);
    }

    // POST /api/auth/register — rôle invalide → 422
    public function testInscriptionRoleInvalide(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/auth/register', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email'    => 'test2@nautilog.fr',
            'password' => 'Password1234!',
            'role'     => 'ROLE_INCONNU',
        ]));

        $this->assertResponseStatusCodeSame(422);
    }

    // POST /api/auth/register — email déjà utilisé → 409
    public function testInscriptionEmailDejaPris(): void
    {
        $client = static::createClient();

        $payload = json_encode([
            'email'    => 'doublon@nautilog.fr',
            'password' => 'Password1234!',
            'role'     => 'ROLE_RENTER',
        ]);

        $client->request('POST', '/api/auth/register', [], [], ['CONTENT_TYPE' => 'application/json'], $payload);
        $this->assertResponseStatusCodeSame(201);

        $client->request('POST', '/api/auth/register', [], [], ['CONTENT_TYPE' => 'application/json'], $payload);
        $this->assertResponseStatusCodeSame(409);
    }

    // POST /api/auth/login — connexion valide → token JWT
    public function testConnexionValide(): void
    {
        $client = static::createClient();

        $client->request('POST', '/api/auth/register', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email'    => 'login@nautilog.fr',
            'password' => 'Password1234!',
            'role'     => 'ROLE_OWNER',
        ]));

        $client->request('POST', '/api/auth/login', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'username' => 'login@nautilog.fr',
            'password' => 'Password1234!',
        ]));

        $this->assertResponseStatusCodeSame(200);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('token', $data);
    }

    // POST /api/auth/login — mauvais mot de passe → 401
    public function testConnexionMauvaisMotDePasse(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/auth/login', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'username' => 'login@nautilog.fr',
            'password' => 'mauvais',
        ]));

        $this->assertResponseStatusCodeSame(401);
    }
}
