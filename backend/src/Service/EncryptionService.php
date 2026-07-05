<?php

namespace App\Service;

class EncryptionService
{
    private string $key;

    public function __construct(string $encryptKey)
    {
        $this->key = base64_decode($encryptKey);
    }

    public function encrypt(?string $value): ?string
    {
        if (null === $value) {
            return null;
        }

        $iv = random_bytes(16);
        $encrypted = openssl_encrypt($value, 'AES-256-CBC', $this->key, 0, $iv);

        return base64_encode($iv.$encrypted);
    }

    public function decrypt(?string $value): ?string
    {
        if (null === $value) {
            return null;
        }

        $data = base64_decode($value);
        $iv = substr($data, 0, 16);
        $encrypted = substr($data, 16);

        return openssl_decrypt($encrypted, 'AES-256-CBC', $this->key, 0, $iv) ?: null;
    }
}
