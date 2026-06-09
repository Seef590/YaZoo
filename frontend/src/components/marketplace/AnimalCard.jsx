import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import { Info, LinkButton } from './MarketplaceCommon'
import {
  buildAnimalContactPath,
  formatAnimalCategory,
  formatAnimalSex,
  formatAnimalStatus,
  uniqueUrls,
} from '../../features/marketplace/marketplaceUtils'
import { formatDate } from '../../utils/formatDate'

function AnimalCard({ animal, onDelete, onEdit }) {
  const gallery = uniqueUrls([animal.photoUrl, ...(animal.galleryUrls ?? [])])

  return (
    <article className="overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.99),_rgba(246,239,255,0.9))] shadow-[0_18px_42px_rgba(124,58,237,0.08)]">
      <div className="h-48 bg-stone-100 sm:h-56">
        {gallery[0] ? (
          <img src={gallery[0]} alt={animal.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-stone-400">Photo a ajouter</div>
        )}
      </div>

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[linear-gradient(135deg,#7c3aed,#a855f7)] px-3 py-1 text-xs font-medium text-white">
                {formatAnimalStatus(animal.listingStatus)}
              </span>
              <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-800">
                {formatAnimalCategory(animal.category)}
              </span>
            </div>
            <h3 className="mt-3 text-lg font-semibold text-stone-950">{animal.name}</h3>
            <p className="text-sm text-stone-500">{[animal.type, animal.breed].filter(Boolean).join(' - ')}</p>
          </div>

          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${animal.isForAdoption ? 'bg-violet-100 text-violet-800' : 'bg-[linear-gradient(135deg,#7c3aed,#a855f7)] text-white'}`}>
            {animal.isForAdoption ? 'Adoption' : `${animal.price ?? 0} MAD`}
          </span>
        </div>

        <div className="flex items-center gap-3 rounded-[22px] bg-white/88 px-4 py-3 shadow-sm">
          <Avatar name={animal.author.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-stone-900">{animal.author.name}</p>
            <p className="text-xs text-stone-500">{[animal.location, formatDate(animal.createdAt)].filter(Boolean).join(' - ')}</p>
          </div>
        </div>

        {gallery.length > 1 ? (
          <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory">
            {gallery.slice(0, 4).map((imageUrl) => (
              <img key={imageUrl} src={imageUrl} alt={animal.name} loading="lazy" decoding="async" className="h-14 w-14 shrink-0 rounded-2xl object-cover snap-start sm:h-16 sm:w-16" />
            ))}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3 text-sm text-stone-600">
          <Info label="Sexe" value={formatAnimalSex(animal.sex)} />
          <Info label="Age" value={animal.age ?? '-'} />
          <Info label="Statut" value={formatAnimalStatus(animal.listingStatus)} />
          <Info label="Categorie" value={formatAnimalCategory(animal.category)} />
        </div>

        <p className="text-sm leading-6 text-stone-600">{animal.description || 'Aucune description pour le moment.'}</p>
        <AnimalActions animal={animal} onDelete={onDelete} onEdit={onEdit} />
      </div>
    </article>
  )
}

function AnimalActions({ animal, onDelete, onEdit }) {
  if (animal.isOwner) {
    return (
      <div className="grid gap-3 sm:flex sm:flex-wrap">
        <LinkButton to={`/marketplace/animals/${animal.id}`} variant="ghost" className="w-full sm:w-auto">Voir details</LinkButton>
        <Button type="button" variant="secondary" onClick={() => onEdit(animal)} className="w-full sm:w-auto">Modifier</Button>
        <Button type="button" variant="ghost" onClick={() => onDelete(animal.id)} className="w-full sm:w-auto">Supprimer</Button>
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:flex sm:flex-wrap">
      <LinkButton to={`/marketplace/animals/${animal.id}`} variant="secondary" className="w-full sm:w-auto">Voir details</LinkButton>
      {animal.author?.email ? (
        <LinkButton to={buildAnimalContactPath(animal)} variant="ghost" className="w-full sm:w-auto">Contacter</LinkButton>
      ) : null}
    </div>
  )
}

export default AnimalCard
