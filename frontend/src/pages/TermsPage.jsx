import PublicPageShell from '../components/ui/PublicPageShell'

export default function TermsPage() {
  return (
    <PublicPageShell
      eyebrowKey="legal.terms.eyebrow"
      titleKey="legal.terms.title"
      introKey="legal.terms.intro"
      sections={[
        { titleKey: 'legal.sections.roleTitle', bodyKey: 'legal.sections.roleBody' },
        { titleKey: 'legal.sections.noDirectSaleTitle', bodyKey: 'legal.sections.noDirectSaleBody' },
        { titleKey: 'legal.sections.usersTitle', bodyKey: 'legal.sections.usersBody' },
        { titleKey: 'legal.sections.dataTitle', bodyKey: 'legal.sections.dataBody' },
        { titleKey: 'legal.sections.moderationTitle', bodyKey: 'legal.sections.moderationBody' },
        { titleKey: 'legal.sections.animalsTitle', bodyKey: 'legal.sections.animalsBody' },
        { titleKey: 'legal.sections.claimTitle', bodyKey: 'legal.sections.claimBody' },
      ]}
    />
  )
}
