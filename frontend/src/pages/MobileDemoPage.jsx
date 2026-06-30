import PublicPageShell from '../components/ui/PublicPageShell'

export default function MobileDemoPage() {
  return (
    <PublicPageShell
      eyebrowKey="proPages.mobile.eyebrow"
      titleKey="proPages.mobile.title"
      introKey="proPages.mobile.intro"
      sections={[
        { titleKey: 'proPages.mobile.responsiveTitle', bodyKey: 'proPages.mobile.responsiveBody' },
        { titleKey: 'proPages.mobile.installTitle', bodyKey: 'proPages.mobile.installBody' },
        { titleKey: 'proPages.mobile.rtlTitle', bodyKey: 'proPages.mobile.rtlBody' },
        { titleKey: 'proPages.mobile.contactTitle', bodyKey: 'proPages.mobile.contactBody' },
      ]}
    />
  )
}
