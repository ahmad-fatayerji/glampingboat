export const metadata = { title: "Mentions légales" };

export default function MentionsLegales() {
  return (
    <main className="prose prose-invert max-w-3xl mx-auto py-10">
      <h1>Mentions légales</h1>
      <p>
        Ce contenu est une maquette en français pour vos mentions légales
        (conformité droit français).
      </p>
      <h2>Éditeur du site</h2>
      <p>
        Raison sociale: [Votre société]
        <br />
        Forme juridique: [SARL / SAS / EI]
        <br />
        Siège social: [Adresse complète]
        <br />
        Capital social: [€]
        <br />
        RCS: [Ville] – [Numéro RCS]
        <br />
        N° TVA intracommunautaire: [FR..]
      </p>
      <h2>Hébergement</h2>
      <p>Hébergeur: [Nom, adresse, contact].</p>
      <h2>Contact</h2>
      <p>Email: contact@votredomaine.fr – Téléphone: [numéro]</p>
      <h2>Directeur de la publication</h2>
      <p>[Nom du directeur de la publication].</p>
      <h2>Propriété intellectuelle</h2>
      <p>
        Le contenu (textes, images, logos) est protégé. Toute reproduction est
        interdite sans autorisation écrite.
      </p>
      <h2>Données personnelles</h2>
      <p>
        Voir la politique de confidentialité et la{" "}
        <a href="/cookies">politique de cookies</a>.
      </p>
    </main>
  );
}
