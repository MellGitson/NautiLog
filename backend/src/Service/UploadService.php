<?php

namespace App\Service;

use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\String\Slugger\AsciiSlugger;

class UploadService
{
    private const AUTORISES = ['image/jpeg', 'image/png', 'image/webp'];
    private const TAILLE_MAX = 5 * 1024 * 1024; // 5 Mo

    public function __construct(
        private string $uploadDir,
    ) {
    }

    /**
     * @throws \InvalidArgumentException si le fichier ne respecte pas les contraintes
     */
    public function uploaderPhotoBateau(UploadedFile $fichier): string
    {
        return $this->uploaderImage($fichier, 'bateaux');
    }

    /**
     * @throws \InvalidArgumentException si le fichier ne respecte pas les contraintes
     */
    public function uploaderAvatar(UploadedFile $fichier): string
    {
        return $this->uploaderImage($fichier, 'avatars');
    }

    private function uploaderImage(UploadedFile $fichier, string $sousDossier): string
    {
        if (!in_array($fichier->getMimeType(), self::AUTORISES, true)) {
            throw new \InvalidArgumentException('Format de fichier non autorisé. Utilisez JPEG, PNG ou WebP.');
        }

        if ($fichier->getSize() > self::TAILLE_MAX) {
            throw new \InvalidArgumentException('Le fichier dépasse la taille maximale de 5 Mo.');
        }

        $slugger = new AsciiSlugger();
        $nomOriginal = pathinfo($fichier->getClientOriginalName(), \PATHINFO_FILENAME);
        $nomFichier = $slugger->slug($nomOriginal).'-'.uniqid().'.'.$fichier->guessExtension();

        try {
            $fichier->move($this->uploadDir.'/'.$sousDossier, $nomFichier);
        } catch (FileException $e) {
            throw new \RuntimeException("Erreur lors de l'enregistrement du fichier.", 0, $e);
        }

        return '/uploads/'.$sousDossier.'/'.$nomFichier;
    }
}
