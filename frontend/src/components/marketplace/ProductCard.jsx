import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import { Link } from 'react-router-dom'
import { Info, LinkButton } from './MarketplaceCommon'
import {
  buildProductContactPath,
  formatCondition,
  formatProductCategory,
  formatProductStatus,
  uniqueUrls,
} from '../../features/marketplace/marketplaceUtils'
import { formatDate } from '../../utils/formatDate'
import { useI18n } from '../../hooks/useI18n'

function ProductCard({ product, onDelete, onEdit }) {
  const { t } = useI18n()
  const gallery = uniqueUrls([product.imageUrl, ...(product.galleryUrls ?? [])])

  return (
    <article className="overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.99),_rgba(246,239,255,0.9))] shadow-[0_18px_42px_rgba(124,58,237,0.08)]">
      <div className="h-48 bg-stone-100 sm:h-60 md:h-72 lg:h-80">
        {gallery[0] ? (
          <img src={gallery[0]} alt={product.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-stone-400">{t('products.imageMissing')}</div>
        )}
      </div>

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[linear-gradient(135deg,#7c3aed,#a855f7)] px-3 py-1 text-xs font-medium text-white">
                {formatProductStatus(product.listingStatus, t)}
              </span>
              <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-800">
                {formatProductCategory(product.category, t)}
              </span>
            </div>
            <h3 className="mt-3 text-lg font-semibold text-stone-950">{product.name}</h3>
            <p className="text-sm text-stone-500">{formatCondition(product.conditionStatus, t)}</p>
          </div>

          <span className="rounded-full bg-[linear-gradient(135deg,#7c3aed,#a855f7)] px-3 py-1 text-xs font-medium text-white">
            {product.price} MAD
          </span>
        </div>

        <div className="flex items-center gap-3 rounded-[22px] bg-white/88 px-4 py-3 shadow-sm">
          <AuthorAvatar author={product.author} t={t} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-stone-900">{product.author.name}</p>
            <p className="text-xs text-stone-500">{[product.location, formatDate(product.createdAt)].filter(Boolean).join(' - ')}</p>
          </div>
        </div>

        {gallery.length > 1 ? (
          <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory">
            {gallery.slice(0, 4).map((imageUrl) => (
              <img key={imageUrl} src={imageUrl} alt={product.name} loading="lazy" decoding="async" className="h-14 w-14 shrink-0 rounded-2xl object-cover snap-start sm:h-16 sm:w-16" />
            ))}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <Info label={t('common.category')} value={formatProductCategory(product.category, t)} />
          <Info label={t('common.status')} value={formatProductStatus(product.listingStatus, t)} />
          <Info label={t('common.condition')} value={formatCondition(product.conditionStatus, t)} />
          <Info label={t('common.stock')} value={product.stock} />
        </div>

        <p className="text-sm leading-6 text-stone-600">{product.description}</p>
        <ProductActions product={product} onDelete={onDelete} onEdit={onEdit} />
      </div>
    </article>
  )
}

function ProductActions({ product, onDelete, onEdit }) {
  const { t } = useI18n()

  if (product.isOwner) {
    return (
      <div className="grid gap-3 sm:flex sm:flex-wrap">
        <LinkButton to={`/marketplace/products/${product.id}`} variant="ghost" className="w-full sm:w-auto">{t('common.details')}</LinkButton>
        <Button type="button" variant="secondary" onClick={() => onEdit(product)} className="w-full sm:w-auto">{t('common.edit')}</Button>
        <Button type="button" variant="ghost" onClick={() => onDelete(product.id)} className="w-full sm:w-auto">{t('common.delete')}</Button>
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:flex sm:flex-wrap">
      <LinkButton to={`/marketplace/products/${product.id}`} variant="secondary" className="w-full sm:w-auto">{t('common.details')}</LinkButton>
      {product.author?.email ? (
        <LinkButton to={buildProductContactPath(product, t)} variant="ghost" className="w-full sm:w-auto">{t('common.contact')}</LinkButton>
      ) : null}
    </div>
  )
}

function AuthorAvatar({ author, t }) {
  const avatar = <Avatar name={author?.name} src={author?.avatar || ''} size="sm" />

  if (!author?.id) {
    return avatar
  }

  return (
    <Link
      to={`/profile/${author.id}`}
      className="shrink-0 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
      aria-label={t('profile.viewProfile')}
    >
      {avatar}
    </Link>
  )
}

export default ProductCard
