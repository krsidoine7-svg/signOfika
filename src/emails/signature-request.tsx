import * as React from 'react'
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
} from '@react-email/components'

interface SignatureRequestEmailProps {
  recipientName: string
  senderName: string
  documentName: string
  signatureUrl: string
}

export const SignatureRequestEmail: React.FC<Readonly<SignatureRequestEmailProps>> = ({
  recipientName,
  senderName,
  documentName,
  signatureUrl,
}) => (
  <Html>
    <Head />
    <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f5f5' }}>
      <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <Section style={{ 
          backgroundColor: '#8B0000', 
          padding: '20px',
          textAlign: 'center',
          borderRadius: '8px 8px 0 0'
        }}>
          <Heading style={{ color: 'white', margin: 0, fontSize: '24px' }}>
            SignOfika
          </Heading>
        </Section>
        
        <Section style={{ 
          padding: '30px',
          backgroundColor: 'white',
          border: '1px solid #eaeaea',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px'
        }}>
          <Heading style={{ color: '#333', marginTop: 0, fontSize: '22px' }}>
            Nouvelle demande de signature
          </Heading>
          
          <Text style={{ color: '#666', lineHeight: '1.6', fontSize: '16px' }}>
            Bonjour {recipientName},
          </Text>
          
          <Text style={{ color: '#666', lineHeight: '1.6', fontSize: '16px' }}>
            <strong>{senderName}</strong> vous demande de signer le document <strong>{documentName}</strong>.
          </Text>
          
          <Text style={{ color: '#666', lineHeight: '1.6', fontSize: '16px' }}>
            Veuillez cliquer sur le bouton ci-dessous pour accéder au document et le signer.
          </Text>
          
          <Section style={{ textAlign: 'center', marginTop: '30px' }}>
            <Button
              href={signatureUrl}
              style={{
                backgroundColor: '#8B0000',
                color: 'white',
                padding: '14px 32px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '16px',
                display: 'inline-block'
              }}
            >
              Signer le document
            </Button>
          </Section>
          
          <Hr style={{ marginTop: '32px', borderColor: '#eee' }} />
          <Text style={{ fontSize: '12px', color: '#999', marginTop: '16px' }}>
            Cet email a été envoyé par SignOfika. Si vous n'avez pas demandé cet email, vous pouvez l'ignorer en toute sécurité.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)
