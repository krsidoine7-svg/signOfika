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

interface SignatureCompletedEmailProps {
  recipientName: string
  documentName: string
  submitterName: string
  downloadUrl?: string

  brandLogoUrl?: string
  companyUrl?: string
  brandColor?: string
}


export const SignatureCompletedEmail: React.FC<Readonly<SignatureCompletedEmailProps>> = ({
  recipientName,
  documentName,
  submitterName,
  downloadUrl,
  brandLogoUrl,
  companyUrl,
  brandColor,
}) => (

  <Html>
    <Head />
    <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f5f5' }}>
      <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <Section style={{ 
          backgroundColor: brandColor || '#8B0000', 
          padding: '20px',
          textAlign: 'center',
          borderRadius: '8px 8px 0 0'
        }}>
          {brandLogoUrl ? (
            <img src={brandLogoUrl} alt="Logo" style={{ height: '40px', margin: '0 auto' }} />
          ) : (
            <Heading style={{ color: 'white', margin: 0, fontSize: '24px' }}>
              SignOfika
            </Heading>
          )}
        </Section>

        
        <Section style={{ 
          padding: '30px',
          backgroundColor: 'white',
          border: '1px solid #eaeaea',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px'
        }}>
          <Heading style={{ color: '#333', marginTop: 0, fontSize: '22px' }}>
            ✅ Document signé avec succès
          </Heading>
          
          <Text style={{ color: '#666', lineHeight: '1.6', fontSize: '16px' }}>
            Bonjour {recipientName},
          </Text>
          
          <Text style={{ color: '#666', lineHeight: '1.6', fontSize: '16px' }}>
            Le document <strong>{documentName}</strong> a été signé avec succès par <strong>{submitterName}</strong>.
          </Text>
          
          {downloadUrl && (
            <>
              <Text style={{ color: '#666', lineHeight: '1.6', fontSize: '16px' }}>
                Vous pouvez télécharger le document signé en cliquant sur le bouton ci-dessous.
              </Text>
              
              <Section style={{ textAlign: 'center', marginTop: '30px' }}>
                <Button
                  href={downloadUrl}
                  style={{
                    backgroundColor: brandColor || '#8B0000',
                    color: 'white',
                    padding: '14px 32px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    display: 'inline-block'
                  }}
                >
                  Télécharger le document
                </Button>
              </Section>

            </>
          )}
          
          <Hr style={{ marginTop: '32px', borderColor: '#eee' }} />
          <Text style={{ fontSize: '12px', color: '#999', marginTop: '16px', textAlign: 'center' }}>
            Cet email a été envoyé par <strong>SignOfika</strong>.
            {companyUrl && (
              <>
                <br />
                <a href={companyUrl} style={{ color: brandColor || '#8B0000', textDecoration: 'none' }}>Visiter notre site web</a>
              </>
            )}
          </Text>
        </Section>

      </Container>
    </Body>
  </Html>
)
