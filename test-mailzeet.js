/**
 * Script de test pour vérifier la configuration Mailzeet
 * 
 * Usage: node test-mailzeet.js votre-email@example.com
 */

// Essayer de charger .env.local d'abord, puis .env par défaut
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testMailzeetConfig() {
  log(colors.blue, '\n🔍 Vérification de la configuration Mailzeet...\n');

  // Vérifier les variables d'environnement
  const apiKey = process.env.MAILZEET_API_KEY;
  const senderEmail = process.env.MAILZEET_SENDER_EMAIL;
  const senderName = process.env.MAILZEET_SENDER_NAME;

  if (!apiKey) {
    log(colors.red, '❌ Erreur : MAILZEET_API_KEY manquant dans .env.local');
    log(colors.yellow, '\n💡 Assurez-vous d\'avoir créé un fichier .env.local avec votre clé API Mailzeet');
    process.exit(1);
  }

  log(colors.green, '✅ Variables d\'environnement trouvées');
  log(colors.blue, `   API Key: ${apiKey.substring(0, 20)}...`);
  log(colors.blue, `   Sender: ${senderName} <${senderEmail}>\n`);

  // Récupérer l'email destinataire depuis les arguments
  const recipientEmail = process.argv[2];

  if (!recipientEmail) {
    log(colors.red, '❌ Erreur : Veuillez fournir un email destinataire');
    log(colors.yellow, '\nUsage: node test-mailzeet.js votre-email@example.com\n');
    process.exit(1);
  }

  try {
    log(colors.blue, '📧 Envoi d\'un email de test via Mailzeet...\n');

    const payload = {
      sender: {
        email: senderEmail || 'noreply@yourdomain.com',
        name: senderName || 'SignOfika',
      },
      recipients: [
        {
          email: recipientEmail,
        },
      ],
      subject: '✅ Test Mailzeet - SignOfika',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4CAF50;">✅ Configuration réussie !</h1>
          <p>Félicitations ! Votre configuration Mailzeet pour <strong>SignOfika</strong> fonctionne parfaitement.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Informations de configuration :</h3>
            <ul>
              <li><strong>Expéditeur :</strong> ${senderName} &lt;${senderEmail}&gt;</li>
              <li><strong>Destinataire :</strong> ${recipientEmail}</li>
              <li><strong>Service :</strong> Mailzeet (Axazara)</li>
            </ul>
          </div>
          <p>Vous pouvez maintenant envoyer des emails de signature et des notifications à vos utilisateurs.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            Cet email a été envoyé automatiquement par le script de test de SignOfika.
          </p>
        </div>
      `,
    };

    const response = await fetch('https://api.mailzeet.com/v1/mails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      log(colors.red, '\n❌ Erreur lors de l\'envoi de l\'email :');

      if (response.status === 401) {
        log(colors.yellow, '\n🔑 Erreur d\'authentification - Vérifiez votre clé API');
        log(colors.yellow, '   La clé API doit être correcte et active');
      } else if (response.status === 400) {
        log(colors.yellow, '\n📧 Erreur de configuration de l\'email');
        log(colors.yellow, '   Vérifiez que l\'adresse email expéditeur est valide');
      } else {
        log(colors.red, `   Code: ${response.status}`);
        log(colors.red, `   Message: ${result.message || 'Erreur inconnue'}`);
      }

      log(colors.red, `\n   Détails: ${JSON.stringify(result, null, 2)}`);
      log(colors.yellow, '\n💡 Consultez la documentation : https://docs.mailzeet.com\n');
      process.exit(1);
    }

    log(colors.green, '✅ Email envoyé avec succès !');
    log(colors.blue, `\n📊 Détails de l'envoi :`);
    log(colors.blue, `   Statut: ${response.status} ${response.statusText}`);
    log(colors.green, `\n✉️  Vérifiez votre boîte mail : ${recipientEmail}`);
    log(colors.yellow, '   (N\'oubliez pas de vérifier les spams si vous ne voyez rien)\n');

  } catch (error) {
    log(colors.red, '\n❌ Erreur lors de l\'envoi de l\'email :');
    log(colors.red, `   Message: ${error.message}`);
    log(colors.yellow, '\n💡 Vérifiez votre connexion internet et la configuration\n');
    process.exit(1);
  }
}

// Exécuter le test
testMailzeetConfig();
