/**
 * Script de test pour vérifier la configuration Mailjet
 * 
 * Usage: node test-mailjet.js votre-email@example.com
 */

const Mailjet = require('node-mailjet');
require('dotenv').config({ path: '.env.local' });

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

async function testMailjetConfig() {
  log(colors.blue, '\n🔍 Vérification de la configuration Mailjet...\n');

  // Vérifier les variables d'environnement
  const apiKey = process.env.MAILJET_API_KEY;
  const secretKey = process.env.MAILJET_SECRET_KEY;
  const senderEmail = process.env.MAILJET_SENDER_EMAIL;
  const senderName = process.env.MAILJET_SENDER_NAME;

  if (!apiKey || !secretKey) {
    log(colors.red, '❌ Erreur : MAILJET_API_KEY ou MAILJET_SECRET_KEY manquant dans .env.local');
    log(colors.yellow, '\n💡 Assurez-vous d\'avoir créé un fichier .env.local avec vos clés Mailjet');
    process.exit(1);
  }

  log(colors.green, '✅ Variables d\'environnement trouvées');
  log(colors.blue, `   API Key: ${apiKey.substring(0, 10)}...`);
  log(colors.blue, `   Sender: ${senderName} <${senderEmail}>\n`);

  // Récupérer l'email destinataire depuis les arguments
  const recipientEmail = process.argv[2];
  
  if (!recipientEmail) {
    log(colors.red, '❌ Erreur : Veuillez fournir un email destinataire');
    log(colors.yellow, '\nUsage: node test-mailjet.js votre-email@example.com\n');
    process.exit(1);
  }

  // Initialiser Mailjet
  const mailjet = Mailjet.apiConnect(apiKey, secretKey);

  try {
    log(colors.blue, '📧 Envoi d\'un email de test...\n');

    const request = mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: senderEmail,
              Name: senderName,
            },
            To: [
              {
                Email: recipientEmail,
              },
            ],
            Subject: '✅ Test Mailjet - SignOfika',
            TextPart: 'Félicitations ! Votre configuration Mailjet fonctionne parfaitement.',
            HTMLPart: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #4CAF50;">✅ Configuration réussie !</h1>
                <p>Félicitations ! Votre configuration Mailjet pour <strong>SignOfika</strong> fonctionne parfaitement.</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Informations de configuration :</h3>
                  <ul>
                    <li><strong>Expéditeur :</strong> ${senderName} &lt;${senderEmail}&gt;</li>
                    <li><strong>Destinataire :</strong> ${recipientEmail}</li>
                    <li><strong>Service :</strong> Mailjet</li>
                  </ul>
                </div>
                <p>Vous pouvez maintenant envoyer des emails de signature et des notifications à vos utilisateurs.</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <p style="color: #666; font-size: 12px;">
                  Cet email a été envoyé automatiquement par le script de test de SignOfika.
                </p>
              </div>
            `,
          },
        ],
      });

    const result = await request;

    log(colors.green, '✅ Email envoyé avec succès !');
    log(colors.blue, `\n📊 Détails de l'envoi :`);
    log(colors.blue, `   Message ID: ${result.body.Messages[0].To[0].MessageID}`);
    log(colors.blue, `   Status: ${result.body.Messages[0].Status}`);
    log(colors.green, `\n✉️  Vérifiez votre boîte mail : ${recipientEmail}`);
    log(colors.yellow, '   (N\'oubliez pas de vérifier les spams si vous ne voyez rien)\n');

  } catch (error) {
    log(colors.red, '\n❌ Erreur lors de l\'envoi de l\'email :');
    
    if (error.statusCode === 401) {
      log(colors.yellow, '\n🔑 Erreur d\'authentification - Vérifiez vos clés API');
      log(colors.yellow, '   Les clés API et Secret Key doivent être correctes');
    } else if (error.statusCode === 400) {
      log(colors.yellow, '\n📧 Erreur de configuration de l\'email');
      log(colors.yellow, '   Vérifiez que l\'adresse email expéditeur est valide');
      log(colors.yellow, '   En mode sandbox, le destinataire doit être vérifié dans Mailjet');
    } else {
      log(colors.red, `   Code: ${error.statusCode || 'N/A'}`);
      log(colors.red, `   Message: ${error.message}`);
    }
    
    if (error.response) {
      log(colors.red, `\n   Détails: ${JSON.stringify(error.response.body, null, 2)}`);
    }
    
    log(colors.yellow, '\n💡 Consultez la documentation : MAILJET_SETUP.md\n');
    process.exit(1);
  }
}

// Exécuter le test
testMailjetConfig();
