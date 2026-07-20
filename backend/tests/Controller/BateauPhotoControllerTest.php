<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class BateauPhotoControllerTest extends WebTestCase
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

    private function creerBateau(mixed $client, string $token): int
    {
        $client->request('POST', '/api/bateaux', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode([
            'nom' => 'Bateau Photo',
            'type' => 'Voilier',
            'statut' => 'DISPONIBLE',
        ]));

        return json_decode($client->getResponse()->getContent(), true)['id'];
    }

    private function creerFichierImageTest(): UploadedFile
    {
        $chemin = sys_get_temp_dir().'/test-photo-'.uniqid().'.png';
        // Un PNG 1x1 minimal valide.
        $pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
        file_put_contents($chemin, base64_decode($pngBase64));

        return new UploadedFile($chemin, 'photo.png', 'image/png', null, true);
    }

    // POST /api/bateaux/{id}/photo — upload valide par le propriétaire
    public function testUploaderPhotoParProprietaire(): void
    {
        $client = static::createClient();
        $token = $this->creerUtilisateurEtToken($client, 'owner_photo@nautilog.fr', 'ROLE_OWNER');
        $id = $this->creerBateau($client, $token);

        $client->request('POST', "/api/bateaux/$id/photo", [], ['photo' => $this->creerFichierImageTest()], [
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ]);

        $this->assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertNotNull($data['photoUrl']);
        $this->assertStringStartsWith('/uploads/bateaux/', $data['photoUrl']);
    }

    // POST /api/bateaux/{id}/photo — par un autre owner → 403
    public function testUploaderPhotoAutreProprietaire(): void
    {
        $client = static::createClient();
        $tokenA = $this->creerUtilisateurEtToken($client, 'owner_photo_a@nautilog.fr', 'ROLE_OWNER');
        $tokenB = $this->creerUtilisateurEtToken($client, 'owner_photo_b@nautilog.fr', 'ROLE_OWNER');
        $id = $this->creerBateau($client, $tokenA);

        $client->request('POST', "/api/bateaux/$id/photo", [], ['photo' => $this->creerFichierImageTest()], [
            'HTTP_AUTHORIZATION' => "Bearer $tokenB",
        ]);

        $this->assertResponseStatusCodeSame(403);
    }

    // POST /api/bateaux/{id}/photo — sans fichier → 422
    public function testUploaderPhotoSansFichier(): void
    {
        $client = static::createClient();
        $token = $this->creerUtilisateurEtToken($client, 'owner_photo_vide@nautilog.fr', 'ROLE_OWNER');
        $id = $this->creerBateau($client, $token);

        $client->request('POST', "/api/bateaux/$id/photo", [], [], [
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ]);

        $this->assertResponseStatusCodeSame(422);
    }

    // POST /api/bateaux/{id}/reparations — ajout d'une réparation par le propriétaire
    public function testAjouterReparation(): void
    {
        $client = static::createClient();
        $token = $this->creerUtilisateurEtToken($client, 'owner_reparation@nautilog.fr', 'ROLE_OWNER');
        $id = $this->creerBateau($client, $token);

        $client->request('POST', "/api/bateaux/$id/reparations", [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode([
            'description' => 'Changement du moteur',
            'date' => '2026-06-15',
        ]));

        $this->assertResponseStatusCodeSame(201);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertSame('Changement du moteur', $data['description']);
        $this->assertSame('2026-06-15', $data['date']);
    }

    // POST /api/bateaux/{id}/reparations — apparaît dans le détail du bateau
    public function testReparationApparaitDansDetailBateau(): void
    {
        $client = static::createClient();
        $token = $this->creerUtilisateurEtToken($client, 'owner_reparation_detail@nautilog.fr', 'ROLE_OWNER');
        $id = $this->creerBateau($client, $token);

        $client->request('POST', "/api/bateaux/$id/reparations", [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode([
            'description' => 'Peinture coque',
            'date' => '2026-05-01',
        ]));

        $client->request('GET', "/api/bateaux/$id");
        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertCount(1, $data['reparations']);
        $this->assertSame('Peinture coque', $data['reparations'][0]['description']);
    }

    // POST /api/bateaux/{id}/reparations — données invalides → 422
    public function testAjouterReparationInvalide(): void
    {
        $client = static::createClient();
        $token = $this->creerUtilisateurEtToken($client, 'owner_reparation_invalide@nautilog.fr', 'ROLE_OWNER');
        $id = $this->creerBateau($client, $token);

        $client->request('POST', "/api/bateaux/$id/reparations", [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => "Bearer $token",
        ], json_encode([
            'description' => '',
            'date' => '',
        ]));

        $this->assertResponseStatusCodeSame(422);
    }
}
