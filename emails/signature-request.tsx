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

interface SignatureRequestEmailProps {
  signerName: string
  documentName: string
  signUrl: string
  message?: string
}

export const SignatureRequestEmail = ({
  signerName = 'Jean Dupont',
  documentName = 'Contrat de Service',
  signUrl = 'https://example.com/sign/abc123',
  message = '',
}: SignatureRequestEmailProps) => (
  <Html>
    <Head />
    <Preview>Signature requise : {documentName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>📝 Signature Requise</Heading>
        
        <Text style={text}>
          Bonjour <strong>{signerName}</strong>,
        </Text>
        
        <Text style={text}>
          Vous avez reçu un document à signer :
        </Text>
        
        <Heading style={h2}>{documentName}</Heading>
        
        {message && (
          <Section style={messageBox}>
            <Text style={messageText}>{message}</Text>
          </Section>
        )}
        
        <Section style={buttonContainer}>
          <Button style={button} href={signUrl}>
            Signer le document maintenant
          </Button>
        </Section>
        
        <Text style={smallText}>
          Ou copiez ce lien dans votre navigateur :
        </Text>
        <Text style={linkText}>{signUrl}</Text>
        
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

export default SignatureRequestEmail

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
  color: '#7f1d1d',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
}

const h2 = {
  color: '#7f1d1d',
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

const messageBox = {
  backgroundColor: '#f8f9fa',
  borderLeft: '4px solid #7f1d1d',
  margin: '20px 30px',
  padding: '15px',
}

const messageText = {
  color: '#555',
  fontSize: '15px',
  fontStyle: 'italic',
  margin: '0',
}

const buttonContainer = {
  margin: '30px auto',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#7f1d1d',
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
  color: '#7f1d1d',
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
