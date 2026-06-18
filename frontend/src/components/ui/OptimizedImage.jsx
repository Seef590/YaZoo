import PropTypes from 'prop-types'
import { useState } from 'react'

export function OptimizedImage({
  alt,
  className,
  fallback = null,
  height,
  sizes,
  src,
  srcSet,
  width,
}) {
  const [hasError, setHasError] = useState(false)

  if (hasError && fallback) {
    return fallback
  }

  return (
    <img
      alt={alt}
      className={className}
      decoding="async"
      height={height}
      loading="lazy"
      sizes={sizes}
      src={src}
      srcSet={srcSet}
      width={width}
      onError={() => setHasError(true)}
    />
  )
}

OptimizedImage.propTypes = {
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  fallback: PropTypes.node,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  sizes: PropTypes.string,
  src: PropTypes.string.isRequired,
  srcSet: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
}
