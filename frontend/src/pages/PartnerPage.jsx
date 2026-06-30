import PublicPageShell from '../components/ui/PublicPageShell'

export default function PartnerPage() {
  return (
    <PublicPageShell
      eyebrowKey="proPages.partner.eyebrow"
      titleKey="proPages.partner.title"
      introKey="proPages.partner.intro"
      sections={[
        { titleKey: 'proPages.partner.visibilityTitle', bodyKey: 'proPages.partner.visibilityBody' },
        { titleKey: 'proPages.partner.trustTitle', bodyKey: 'proPages.partner.trustBody' },
        { titleKey: 'proPages.partner.contactTitle', bodyKey: 'proPages.partner.contactBody' },
        { titleKey: 'proPages.partner.rulesTitle', bodyKey: 'proPages.partner.rulesBody' },
      ]}
    />
  )
}
