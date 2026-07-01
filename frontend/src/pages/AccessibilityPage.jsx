import PublicPageShell from '../components/ui/PublicPageShell'

export default function AccessibilityPage() {
  return (
    <PublicPageShell
      eyebrowKey="accessibility.eyebrow"
      titleKey="accessibility.title"
      introKey="accessibility.intro"
      sections={[
        { titleKey: 'accessibility.progressTitle', bodyKey: 'accessibility.progressBody' },
        { titleKey: 'accessibility.navigationTitle', bodyKey: 'accessibility.navigationBody' },
        { titleKey: 'accessibility.contrastTitle', bodyKey: 'accessibility.contrastBody' },
        { titleKey: 'accessibility.rtlTitle', bodyKey: 'accessibility.rtlBody' },
        { titleKey: 'accessibility.feedbackTitle', bodyKey: 'accessibility.feedbackBody' },
      ]}
    />
  )
}
