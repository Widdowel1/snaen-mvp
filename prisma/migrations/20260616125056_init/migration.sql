-- CreateEnum
CREATE TYPE "Secteur" AS ENUM ('DROPSHIPPING', 'ECOMMERCE', 'FREELANCE', 'INFLUENCE', 'CONTENU', 'FORMATION', 'COACHING', 'TRADING', 'CRYPTOACTIFS', 'DEVELOPPEMENT', 'AUTRE');

-- CreateEnum
CREATE TYPE "Niveau" AS ENUM ('STARTER', 'BUILDER', 'ACHIEVER', 'CHAMPION', 'ELITE');

-- CreateEnum
CREATE TYPE "Statut" AS ENUM ('ACTIF', 'SUSPENDU', 'RADIE', 'EN_ATTENTE');

-- CreateEnum
CREATE TYPE "StatutFacture" AS ENUM ('EMISE', 'PAYEE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "CategorieDepense" AS ENUM ('STOCK_LOCAL', 'STOCK_ETRANGER', 'PUB_META', 'PUB_GOOGLE', 'ABONNEMENT_OUTIL', 'LIVRAISON_LOCAL', 'LIVRAISON_INTERNATIONAL', 'TELECOM', 'MATERIEL', 'PRESTATAIRE_SNAEN', 'AUTRE');

-- CreateEnum
CREATE TYPE "TypeJustificatif" AS ENUM ('FACTURE_NORMALISEE', 'FACTURE_ETRANGERE', 'RECU_MOBILE_MONEY', 'RECU_EMAIL', 'AUTRE');

-- CreateEnum
CREATE TYPE "StatutValidation" AS ENUM ('AUTO_VALIDEE', 'VALIDEE', 'REJETEE', 'EN_ATTENTE', 'AUDIT_REQUIS');

-- CreateEnum
CREATE TYPE "RegimeFiscal" AS ENUM ('BENEFICE_REEL', 'FORFAIT_SECTORIEL');

-- CreateEnum
CREATE TYPE "StatutDeclaration" AS ENUM ('CALCULEE', 'PAYEE', 'EN_RETARD');

-- CreateEnum
CREATE TYPE "StatutDossier" AS ENUM ('OUVERT', 'EN_ENQUETE', 'MISE_EN_DEMEURE', 'REGULARISE', 'CLASSE', 'TRANSMIS_JUSTICE');

-- CreateTable
CREATE TABLE "operateurs" (
    "id" TEXT NOT NULL,
    "ifu" TEXT,
    "lan" TEXT,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "secteur" "Secteur" NOT NULL,
    "niveau" "Niveau" NOT NULL DEFAULT 'STARTER',
    "statut" "Statut" NOT NULL DEFAULT 'ACTIF',
    "scoreConformite" INTEGER NOT NULL DEFAULT 0,
    "role" TEXT NOT NULL DEFAULT 'OPERATEUR',
    "dateInscription" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateRenouvellement" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factures" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "operateurId" TEXT NOT NULL,
    "clientNom" TEXT NOT NULL,
    "clientEmail" TEXT,
    "clientTelephone" TEXT,
    "clientIfu" TEXT,
    "dateEmission" TIMESTAMP(3) NOT NULL,
    "dateEcheance" TIMESTAMP(3),
    "lignes" JSONB NOT NULL,
    "montantHT" DECIMAL(15,2) NOT NULL,
    "tva" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "montantTTC" DECIMAL(15,2) NOT NULL,
    "statut" "StatutFacture" NOT NULL DEFAULT 'EMISE',
    "modeLivraison" TEXT[],
    "dgiReference" TEXT,
    "dgiSync" BOOLEAN NOT NULL DEFAULT false,
    "dgiSyncAt" TIMESTAMP(3),
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "factures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "depenses" (
    "id" TEXT NOT NULL,
    "operateurId" TEXT NOT NULL,
    "dateDepense" TIMESTAMP(3) NOT NULL,
    "categorie" "CategorieDepense" NOT NULL,
    "description" TEXT,
    "montant" DECIMAL(15,2) NOT NULL,
    "devise" TEXT NOT NULL DEFAULT 'XOF',
    "montantXof" DECIMAL(15,2) NOT NULL,
    "fournisseurNom" TEXT,
    "fournisseurIfu" TEXT,
    "justificatifType" "TypeJustificatif",
    "justificatifUrl" TEXT,
    "justificatifRef" TEXT,
    "statutValidation" "StatutValidation" NOT NULL DEFAULT 'EN_ATTENTE',
    "validationNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "depenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "declarations_fiscales" (
    "id" TEXT NOT NULL,
    "operateurId" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "caTotal" DECIMAL(15,2) NOT NULL,
    "depensesValidees" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "beneficeNet" DECIMAL(15,2) NOT NULL,
    "tauxApplique" DECIMAL(5,2) NOT NULL,
    "regime" "RegimeFiscal" NOT NULL,
    "impotCalcule" DECIMAL(15,2) NOT NULL,
    "reductionNiveau" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "impotFinal" DECIMAL(15,2) NOT NULL,
    "statut" "StatutDeclaration" NOT NULL DEFAULT 'CALCULEE',
    "dateLimite" TIMESTAMP(3) NOT NULL,
    "datePaiement" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "declarations_fiscales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formations" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "niveauMin" "Niveau" NOT NULL DEFAULT 'STARTER',
    "dureeMin" INTEGER NOT NULL,
    "format" TEXT NOT NULL,
    "gratuit" BOOLEAN NOT NULL DEFAULT true,
    "secteurs" "Secteur"[],
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "formations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progressions_formations" (
    "id" TEXT NOT NULL,
    "operateurId" TEXT NOT NULL,
    "formationId" TEXT NOT NULL,
    "progressionPct" INTEGER NOT NULL DEFAULT 0,
    "termine" BOOLEAN NOT NULL DEFAULT false,
    "dateDebut" TIMESTAMP(3),
    "dateFin" TIMESTAMP(3),
    "certificatUrl" TEXT,

    CONSTRAINT "progressions_formations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dossiers_cvfd" (
    "id" TEXT NOT NULL,
    "typeDetection" TEXT NOT NULL,
    "sujetNom" TEXT NOT NULL,
    "sujetTelephone" TEXT,
    "sujetEmail" TEXT,
    "sujetProfilUrl" TEXT,
    "description" TEXT NOT NULL,
    "preuves" JSONB,
    "statut" "StatutDossier" NOT NULL DEFAULT 'OUVERT',
    "agentId" TEXT,
    "dateDetection" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateMiseDemeure" TIMESTAMP(3),
    "dateRegularisation" TIMESTAMP(3),
    "notesAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dossiers_cvfd_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "operateurs_ifu_key" ON "operateurs"("ifu");

-- CreateIndex
CREATE UNIQUE INDEX "operateurs_lan_key" ON "operateurs"("lan");

-- CreateIndex
CREATE UNIQUE INDEX "operateurs_email_key" ON "operateurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "operateurs_telephone_key" ON "operateurs"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "factures_numero_key" ON "factures"("numero");

-- AddForeignKey
ALTER TABLE "factures" ADD CONSTRAINT "factures_operateurId_fkey" FOREIGN KEY ("operateurId") REFERENCES "operateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "depenses" ADD CONSTRAINT "depenses_operateurId_fkey" FOREIGN KEY ("operateurId") REFERENCES "operateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "declarations_fiscales" ADD CONSTRAINT "declarations_fiscales_operateurId_fkey" FOREIGN KEY ("operateurId") REFERENCES "operateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progressions_formations" ADD CONSTRAINT "progressions_formations_operateurId_fkey" FOREIGN KEY ("operateurId") REFERENCES "operateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progressions_formations" ADD CONSTRAINT "progressions_formations_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "formations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
