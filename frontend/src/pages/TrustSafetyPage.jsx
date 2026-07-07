import PublicPageShell from '../components/ui/PublicPageShell'

export default function TrustSafetyPage() {
  return (
    <PublicPageShell
      eyebrowKey="trustSafety.eyebrow"
      titleKey="trustSafety.title"
      introKey="trustSafety.intro"
      sections={[
        { titleKey: 'trustSafety.moderationTitle', bodyKey: 'trustSafety.moderationBody' },
        { titleKey: 'trustSafety.professionalVerificationTitle', bodyKey: 'trustSafety.professionalVerificationBody' },
        { titleKey: 'trustSafety.animalsTitle', bodyKey: 'trustSafety.animalsBody' },
        { titleKey: 'trustSafety.privacyTitle', bodyKey: 'trustSafety.privacyBody' },
        { titleKey: 'trustSafety.paymentsTitle', bodyKey: 'trustSafety.paymentsBody' },
        { titleKey: 'trustSafety.userAdviceTitle', bodyKey: 'trustSafety.userAdviceBody' },
        { titleKey: 'trustSafety.limitsTitle', bodyKey: 'trustSafety.limitsBody' },
      ]}
    />
  )
}
