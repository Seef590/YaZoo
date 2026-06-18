import PropTypes from 'prop-types'

function HorizontalScrollSection({
  children,
  className = '',
  itemClassName = '',
}) {
  return (
    <div className={`yz-horizontal-scroll ${className}`}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <div key={child?.key ?? index} className={`yz-horizontal-scroll-item ${itemClassName}`}>
              {child}
            </div>
          ))
        : children}
    </div>
  )
}

HorizontalScrollSection.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  itemClassName: PropTypes.string,
}

export default HorizontalScrollSection
