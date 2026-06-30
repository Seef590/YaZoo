import PublicPageShell from '../components/ui/PublicPageShell'

export default function AboutPage() {
  return (
    <PublicPageShell
      eyebrowKey="legal.about.eyebrow"
      titleKey="legal.about.title"
      introKey="legal.about.intro"
      sections={[
        { titleKey: 'legal.about.missionTitle', bodyKey: 'legal.about.missionBody' },
        { titleKey: 'legal.about.socialTitle', bodyKey: 'legal.about.socialBody' },
        { titleKey: 'legal.about.trustTitle', bodyKey: 'legal.about.trustBody' },
        { titleKey: 'legal.about.communityTitle', bodyKey: 'legal.about.communityBody' },
        { titleKey: 'legal.about.legalNoticeTitle', bodyKey: 'legal.about.legalNoticeBody' },
        { titleKey: 'legal.about.dataContactTitle', bodyKey: 'legal.about.dataContactBody' },
        { titleKey: 'legal.about.limitsTitle', bodyKey: 'legal.about.limitsBody' },
      ]}
    />
  )
}
