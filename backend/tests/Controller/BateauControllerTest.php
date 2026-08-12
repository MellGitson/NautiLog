<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class BateauControllerTest extends WebTestCase
{
    private function creerFichierImageTest(): UploadedFile
    {
        $chemin = sys_get_temp_dir().'/test-bateau-photo-'.uniqid().'.png';
        // Un PNG 1x1 minimal valide.
        $pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
        file_put_contents($chemin, base64_decode($pngBase64));

        return new UploadedFile($chemin, 'photo.png', 'image/png', null, true);
    }

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

    // GET /api/bateaux — sans authentification → 401
    public function testListeBateauxSansAuth(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/bateaux');

        $this->assertResponseStatusCodeSame(401);
    }

    // GET /api/bateaux — un owner ne voit que ses propres bateaux
    public function testListeBateauxOwnerNeVoitQueSesBateaux(): void
    {
        $client = static::createClient();
        $tokenOwnerA = $this->creerUtilisateurEtToken($client, 'owner_a_liste@nautilog.fr', 'ROLE_OWNER');

        $client->request('POST', '/api/bateaux', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenOwnerA",
        ], json_encode([
            'nom' => 'Bateau de A',
            'type' => 'Voilier',
            'statut' => 'DISPONIBLE',
        ]));

        $tokenOwnerB = $this->creerUtilisateurEtToken($client, 'owner_b_liste@nautilog.fr', 'ROLE_OWNER');

        $client->request('POST', '/api/bateaux', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenOwnerB",
        ], json_encode([
            'nom' => 'Bateau de B',
            'type' => 'Zodiac',
            'statut' => 'DISPONIBLE',
        ]));

        $client->request('GET', '/api/bateaux', [], [], [
            'HTTP_AUTHORIZATION' => "Bearer $tokenOwnerB",
        ]);

        $this->assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);
        $noms = array_map(fn (array $bateau) => $bateau['nom'], $data);
        $this->assertContains('Bateau de B', $noms);
        $this->assertNotContains('Bateau de A', $noms);
    }

    // GET /api/bateaux — un renter voit tous les bateaux
    public function testListeBateauxRenterVoitTout(): void
    {
        $client = static::createClient();
        $tokenOwner = $this->creerUtilisateurEtToken($client, 'owner_c_liste@nautilog.fr', 'ROLE_OWNER');

        $client->request('POST', '/api/bateaux', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenOwner",
        ], json_encode([
            'nom' => 'Bateau de C',
            'type' => 'Voilier',
            'statut' => 'DISPONIBLE',
        ]));

        $tokenRenter = $this->creerUtilisateurEtToken($client, 'renter_liste@nautilog.fr', 'ROLE_RENTER');

        $client->request('GET', '/api/bateaux', [], [], [
            'HTTP_AUTHORIZATION' => "Bearer $tokenRenter",
        ]);

        $this->assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);
        $noms = array_map(fn (array $bateau) => $bateau['nom'], $data);
        $this->assertContains('Bateau de C', $noms);
    }

    // POST /api/bateaux — créer un bateau en tant qu'owner
    public function testCreerBateauOwner(): void
    {
        $client = static::createClient();
        $token = $this->creerUtilisateurEtToken($client, 'owner_bateau@nautilog.fr', 'ROLE_OWNER');

        $client->request('POST', '/api/bateaux', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode([
            'nom' => 'Mon Voilier',
            'type' => 'Voilier',
            'statut' => 'DISPONIBLE',
        ]));

        $this->assertResponseStatusCodeSame(201);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertSame('Mon Voilier', $data['nom']);
    }

    // POST /api/bateaux — création avec photo en une seule requête (multipart)
    public function testCreerBateauAvecPhoto(): void
    {
        $client = static::createClient();
        $token = $this->creerUtilisateurEtToken($client, 'owner_bateau_photo@nautilog.fr', 'ROLE_OWNER');

        $client->request('POST', '/api/bateaux', [
            'nom' => 'Voilier Illustré',
            'type' => 'Voilier',
            'statut' => 'DISPONIBLE',
        ], ['photo' => $this->creerFichierImageTest()], [
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ]);

        $this->assertResponseStatusCodeSame(201);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertSame('Voilier Illustré', $data['nom']);
        $this->assertNotNull($data['photoUrl']);
        $this->assertStringStartsWith('/uploads/bateaux/', $data['photoUrl']);
    }

    // POST /api/bateaux — avec description
    public function testCreerBateauAvecDescription(): void
    {
        $client = static::createClient();
        $token = $this->creerUtilisateurEtToken($client, 'owner_description@nautilog.fr', 'ROLE_OWNER');

        $client->request('POST', '/api/bateaux', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode([
            'nom' => 'Voilier Décrit',
            'type' => 'Voilier',
            'statut' => 'DISPONIBLE',
            'description' => 'Un très beau voilier.',
        ]));

        $this->assertResponseStatusCodeSame(201);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertSame('Un très beau voilier.', $data['description']);
        $this->assertArrayHasKey('reparations', $data);
        $this->assertSame([], $data['reparations']);
    }

    // POST /api/bateaux — sans authentification → 401
    public function testCreerBateauSansAuth(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/bateaux', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'nom' => 'Bateau Fantôme',
            'type' => 'Yacht',
            'statut' => 'DISPONIBLE',
        ]));

        $this->assertResponseStatusCodeSame(401);
    }

    // POST /api/bateaux — en tant que renter → 403
    public function testCreerBateauRenter(): void
    {
        $client = static::createClient();
        $token = $this->creerUtilisateurEtToken($client, 'renter_bateau@nautilog.fr', 'ROLE_RENTER');

        $client->request('POST', '/api/bateaux', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode([
            'nom' => 'Tentative',
            'type' => 'Voilier',
            'statut' => 'DISPONIBLE',
        ]));

        $this->assertResponseStatusCodeSame(403);
    }

    // POST /api/bateaux — données invalides → 422
    public function testCreerBateauDonneesInvalides(): void
    {
        $client = static::createClient();
        $token = $this->creerUtilisateurEtToken($client, 'owner_invalide@nautilog.fr', 'ROLE_OWNER');

        $client->request('POST', '/api/bateaux', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode([
            'nom' => '',
            'type' => '',
            'statut' => 'STATUT_INEXISTANT',
        ]));

        $this->assertResponseStatusCodeSame(422);
    }

    // GET /api/bateaux/{id} — bateau inexistant → 404
    public function testDetailBateauInexistant(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/bateaux/99999');

        $this->assertResponseStatusCodeSame(404);
    }

    // DELETE /api/bateaux/{id} — suppression par le propriétaire
    public function testSupprimerBateauParProprietaire(): void
    {
        $client = static::createClient();
        $token = $this->creerUtilisateurEtToken($client, 'owner_delete@nautilog.fr', 'ROLE_OWNER');

        $client->request('POST', '/api/bateaux', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode([
            'nom' => 'À Supprimer',
            'type' => 'Vedette',
            'statut' => 'DISPONIBLE',
        ]));

        $id = json_decode($client->getResponse()->getContent(), true)['id'];

        $client->request('DELETE', "/api/bateaux/$id", [], [], [
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ]);

        $this->assertResponseStatusCodeSame(200);
    }

    // DELETE /api/bateaux/{id} — suppression par un autre owner → 403
    public function testSupprimerBateauAutreProprietaire(): void
    {
        $client = static::createClient();
        $tokenA = $this->creerUtilisateurEtToken($client, 'owner_a@nautilog.fr', 'ROLE_OWNER');
        $tokenB = $this->creerUtilisateurEtToken($client, 'owner_b@nautilog.fr', 'ROLE_OWNER');

        $client->request('POST', '/api/bateaux', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $tokenA",
        ], json_encode([
            'nom' => 'Bateau de A',
            'type' => 'Voilier',
            'statut' => 'DISPONIBLE',
        ]));

        $id = json_decode($client->getResponse()->getContent(), true)['id'];

        $client->request('DELETE', "/api/bateaux/$id", [], [], [
            'HTTP_AUTHORIZATION' => "Bearer $tokenB",
        ]);

        $this->assertResponseStatusCodeSame(403);
    }
}
