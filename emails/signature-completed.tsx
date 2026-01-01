import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface SignatureCompletedEmailProps {
  documentName: string
  downloadUrl: string
  senderName: string
}

export const SignatureCompletedEmail = ({
  documentName = 'Contrat de Service',
  downloadUrl = 'https://example.com/documents/abc123',
  senderName = 'Jean Dupont',
}: SignatureCompletedEmailProps) => (
  <Html>
    <Head />
    <Preview>Document signé : {documentName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>✅ Document Signé</Heading>
        
        <Text style={text}>Bonjour,</Text>
        
        <Section style={successBox}>
          <Text style={successText}>
            <strong>Bonne nouvelle !</strong> Le document a été signé avec succès.
          </Text>
        </Section>
        
        <Text style={text}>
          <strong>{senderName}</strong> a signé le document :
        </Text>
        
        <Heading style={h2}>{documentName}</Heading>
        
        <Section style={buttonContainer}>
          <Button style={button} href={downloadUrl}>
            Télécharger le document
          </Button>
        </Section>
        
        <Text style={smallText}>
          Ou copiez ce lien dans votre navigateur :
        </Text>
        <Text style={linkText}>{downloadUrl}</Text>
        
        <Text style={text}>
          Cordialement,
          <br />
          <strong>L'équipe SignOfika</strong>
        </Text>
        
        <Text style={footer}>
          Ceci est un email automatique, merci de ne pas y répondre.
          <br />
          © {new Date().getFullYear()} SignOfika. Tous droits réservés.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignatureCompletedEmail

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const h1 = {
  color: '#16a34a',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
}

const h2 = {
  color: '#16a34a',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '20px 0',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 30px',
}

const successBox = {
  backgroundColor: '#f0fdf4',
  borderLeft: '4px solid #16a34a',
  margin: '20px 30px',
  padding: '15px',
}

const successText = {
  color: '#166534',
  fontSize: '15px',
  margin: '0',
}

const buttonContainer = {
  margin: '30px auto',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#16a34a',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 30px',
}

const smallText = {
  color: '#666',
  fontSize: '14px',
  margin: '16px 30px 8px',
}

const linkText = {
  color: '#16a34a',
  fontSize: '12px',
  margin: '0 30px 16px',
  wordBreak: 'break-all' as const,
}

const footer = {
  color: '#666',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '40px 30px 0',
  textAlign: 'center' as const,
}
