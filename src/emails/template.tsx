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

interface EmailTemplateProps {
  title: string
  content: string
  buttonText?: string
  buttonUrl?: string
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  title,
  content,
  buttonText,
  buttonUrl,
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
          <Heading style={{ color: '#333', marginTop: 0, fontSize: '20px' }}>
            {title}
          </Heading>
          <Text style={{ color: '#666', lineHeight: '1.6', fontSize: '16px' }}>
            {content}
          </Text>
          
          {buttonText && buttonUrl && (
            <Section style={{ textAlign: 'center', marginTop: '24px' }}>
              <Button
                href={buttonUrl}
                style={{
                  backgroundColor: '#8B0000',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  display: 'inline-block'
                }}
              >
                {buttonText}
              </Button>
            </Section>
          )}
          
          <Hr style={{ marginTop: '32px', borderColor: '#eee' }} />
          <Text style={{ fontSize: '12px', color: '#999', marginTop: '16px' }}>
            Cet email a été envoyé par SignOfika. Si vous n'avez pas demandé cet email, vous pouvez l'ignorer.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)
