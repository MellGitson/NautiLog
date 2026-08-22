<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260812153611 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajoute la colonne updated_at sur boats, initialisée à created_at pour les lignes existantes.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE boats ADD updated_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('UPDATE boats SET updated_at = created_at WHERE updated_at IS NULL');
        $this->addSql('ALTER TABLE boats ALTER COLUMN updated_at SET NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE boats DROP updated_at');
    }
}
