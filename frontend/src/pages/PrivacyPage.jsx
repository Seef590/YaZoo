import PublicPageShell from '../components/ui/PublicPageShell'

export default function PrivacyPage() {
  return (
    <PublicPageShell
      eyebrowKey="legal.privacy.eyebrow"
      titleKey="legal.privacy.title"
      introKey="legal.privacy.intro"
      sections={[
        { titleKey: 'legal.privacy.controllerTitle', bodyKey: 'legal.privacy.controllerBody' },
        { titleKey: 'legal.privacy.dataTitle', bodyKey: 'legal.privacy.dataBody' },
        { titleKey: 'legal.privacy.purposesTitle', bodyKey: 'legal.privacy.purposesBody' },
        { titleKey: 'legal.privacy.useTitle', bodyKey: 'legal.privacy.useBody' },
        { titleKey: 'legal.privacy.retentionTitle', bodyKey: 'legal.privacy.retentionBody' },
        { titleKey: 'legal.privacy.safetyTitle', bodyKey: 'legal.privacy.safetyBody' },
        { titleKey: 'legal.privacy.rightsTitle', bodyKey: 'legal.privacy.rightsBody' },
        { titleKey: 'legal.privacy.claimTitle', bodyKey: 'legal.privacy.claimBody' },
      ]}
    />
  )
}
