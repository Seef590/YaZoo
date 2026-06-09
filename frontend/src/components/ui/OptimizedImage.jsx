import PropTypes from 'prop-types'

export function OptimizedImage({
  alt,
  className,
  height,
  sizes,
  src,
  srcSet,
  width,
}) {
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
    />
  )
}

OptimizedImage.propTypes = {
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  sizes: PropTypes.string,
  src: PropTypes.string.isRequired,
  srcSet: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
}
