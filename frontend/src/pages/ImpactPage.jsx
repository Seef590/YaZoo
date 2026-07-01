import PublicPageShell from '../components/ui/PublicPageShell'

export default function ImpactPage() {
  return (
    <PublicPageShell
      eyebrowKey="impact.eyebrow"
      titleKey="impact.title"
      introKey="impact.intro"
      sections={[
        { titleKey: 'impact.adoptionTitle', bodyKey: 'impact.adoptionBody' },
        { titleKey: 'impact.localProsTitle', bodyKey: 'impact.localProsBody' },
        { titleKey: 'impact.inclusionTitle', bodyKey: 'impact.inclusionBody' },
        { titleKey: 'impact.safetyTitle', bodyKey: 'impact.safetyBody' },
        { titleKey: 'impact.economicTitle', bodyKey: 'impact.economicBody' },
        { titleKey: 'impact.limitsTitle', bodyKey: 'impact.limitsBody' },
      ]}
    />
  )
}
