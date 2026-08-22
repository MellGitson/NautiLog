<?php

namespace App\Service;

use Psr\Log\LoggerInterface;
use Symfony\Contracts\HttpClient\Exception\ExceptionInterface as HttpExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class WeatherService
{
    private const URL = 'https://api.open-meteo.com/v1/forecast';

    public function __construct(
        private HttpClientInterface $httpClient,
        private LoggerInterface $logger,
    ) {
    }

    /**
     * @return array{temperature: float, vitesseVent: float, directionVent: int, etatMer: string}|null
     */
    public function meteoActuelle(float $latitude, float $longitude): ?array
    {
        try {
            $reponse = $this->httpClient->request('GET', self::URL, [
                'query' => [
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'current' => 'temperature_2m,wind_speed_10m,wind_direction_10m,weather_code',
                    'wind_speed_unit' => 'kmh',
                    'timezone' => 'auto',
                ],
                'timeout' => 5,
            ]);

            $donnees = $reponse->toArray();
            $courant = $donnees['current'] ?? null;

            if (!$courant) {
                return null;
            }

            $vitesseVent = (float) $courant['wind_speed_10m'];

            return [
                'temperature' => (float) $courant['temperature_2m'],
                'vitesseVent' => $vitesseVent,
                'directionVent' => (int) $courant['wind_direction_10m'],
                'etatMer' => $this->etatMer($vitesseVent),
            ];
        } catch (HttpExceptionInterface|\Throwable $e) {
            $this->logger->error('Échec de la récupération de la météo marine.', [
                'latitude' => $latitude,
                'longitude' => $longitude,
                'exception' => $e->getMessage(),
            ]);

            return null;
        }
    }

    private function etatMer(float $vitesseVentKmh): string
    {
        return match (true) {
            $vitesseVentKmh < 12 => 'calme',
            $vitesseVentKmh < 29 => 'peu agitée',
            $vitesseVentKmh < 50 => 'agitée',
            default => 'forte',
        };
    }
}
