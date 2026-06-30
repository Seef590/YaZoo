import PublicPageShell from '../components/ui/PublicPageShell'

export default function PublishingRulesPage() {
  return (
    <PublicPageShell
      eyebrowKey="legal.rules.eyebrow"
      titleKey="legal.rules.title"
      introKey="legal.rules.intro"
      sections={[
        { titleKey: 'legal.rules.complianceTitle', bodyKey: 'legal.rules.complianceBody' },
        { titleKey: 'legal.rules.welfareTitle', bodyKey: 'legal.rules.welfareBody' },
        { titleKey: 'legal.rules.ownerTitle', bodyKey: 'legal.rules.ownerBody' },
        { titleKey: 'legal.rules.sellerTypesTitle', bodyKey: 'legal.rules.sellerTypesBody' },
        { titleKey: 'legal.rules.documentsTitle', bodyKey: 'legal.rules.documentsBody' },
        { titleKey: 'legal.rules.professionalTitle', bodyKey: 'legal.rules.professionalBody' },
        { titleKey: 'legal.rules.authoritiesTitle', bodyKey: 'legal.rules.authoritiesBody' },
        { titleKey: 'legal.rules.prohibitedTitle', bodyKey: 'legal.rules.prohibitedBody' },
        { titleKey: 'legal.rules.moderationTitle', bodyKey: 'legal.rules.moderationBody' },
        { titleKey: 'legal.rules.reportTitle', bodyKey: 'legal.rules.reportBody' },
      ]}
    />
  )
}
