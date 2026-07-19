<?php

namespace App\Tests\Security;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class OwaspTest extends WebTestCase
{
    // OWASP A01 — Accès non authentifié sur routes protégées → 401
    public function testAccesNonAuthentifieRoutesBateaux(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/bateaux', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'nom' => 'Bateau Test',
            'type' => 'Voilier',
            'statut' => 'DISPONIBLE',
        ]));

        $this->assertResponseStatusCodeSame(401);
    }

    public function testAccesNonAuthentifieRoutesPorts(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/ports', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'nom' => 'Port Test',
            'ville' => 'Testville',
            'latitude' => 43.0,
            'longitude' => 5.0,
            'capacite' => 10,
        ]));

        $this->assertResponseStatusCodeSame(401);
    }

    public function testAccesNonAuthentifieTrajets(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/trajets');

        $this->assertResponseStatusCodeSame(401);
    }

    // OWASP A03 — Payload SQL injection dans le champ email → ne doit pas lever une 500
    public function testInjectionSqlDansEmail(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/auth/register', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email' => "' OR '1'='1'; DROP TABLE users; --",
            'password' => 'Password1234!',
            'role' => 'ROLE_OWNER',
        ]));

        $this->assertNotSame(500, $client->getResponse()->getStatusCode());
    }

    public function testInjectionSqlDansLogin(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/auth/login', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email' => "admin'--",
            'password' => "' OR '1'='1",
        ]));

        $this->assertNotSame(500, $client->getResponse()->getStatusCode());
    }

    // OWASP A03 — Payload XSS dans un champ texte → la réponse JSON ne doit pas refléter le script en clair
    public function testXssDansNomBateau(): void
    {
        $client = static::createClient();

        // Inscription + connexion pour obtenir un token
        $client->request('POST', '/api/auth/register', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email' => 'xss-test@nautilog.fr',
            'password' => 'Password1234!',
            'role' => 'ROLE_OWNER',
        ]));

        $client->request('POST', '/api/auth/login', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email' => 'xss-test@nautilog.fr',
            'password' => 'Password1234!',
        ]));

        $token = json_decode($client->getResponse()->getContent(), true)['token'] ?? null;
        $this->assertNotNull($token, 'Token JWT absent');

        $payload = '<script>alert("xss")</script>';

        $client->request('POST', '/api/bateaux', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
        ], json_encode([
            'nom' => $payload,
            'type' => 'Voilier',
            'statut' => 'DISPONIBLE',
        ]));

        $body = $client->getResponse()->getContent();

        // Le payload XSS ne doit pas être renvoyé tel quel dans un contexte HTML
        $this->assertStringNotContainsString('<script>', $body);
    }
}
