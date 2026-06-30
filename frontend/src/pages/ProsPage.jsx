import PublicPageShell from '../components/ui/PublicPageShell'

export default function ProsPage() {
  return (
    <PublicPageShell
      eyebrowKey="proPages.pros.eyebrow"
      titleKey="proPages.pros.title"
      introKey="proPages.pros.intro"
      sections={[
        { titleKey: 'proPages.pros.vetsTitle', bodyKey: 'proPages.pros.vetsBody' },
        { titleKey: 'proPages.pros.servicesTitle', bodyKey: 'proPages.pros.servicesBody' },
        { titleKey: 'proPages.pros.storesTitle', bodyKey: 'proPages.pros.storesBody' },
        { titleKey: 'proPages.pros.contactTitle', bodyKey: 'proPages.pros.contactBody' },
      ]}
    />
  )
}
