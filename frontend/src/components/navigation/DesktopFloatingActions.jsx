import PropTypes from 'prop-types'

import DesktopMessagesDock from '../messages/DesktopMessagesDock'
import DesktopMarketplacePublishButton from './DesktopMarketplacePublishButton'

function DesktopFloatingActions({
  conversations,
  isLoading,
  isMessagesOpen,
  isRtl,
  marketplacePublishing,
  onToggleMessages,
  refObject,
  t,
  unreadCount,
}) {
  return (
    <div
      data-testid="desktop-floating-actions"
      className="fixed bottom-6 right-6 z-40 hidden items-end gap-3 xl:flex"
      dir="ltr"
    >
      <DesktopMessagesDock
        conversations={conversations}
        isLoading={isLoading}
        isOpen={isMessagesOpen}
        isRtl={isRtl}
        onToggle={onToggleMessages}
        refObject={refObject}
        t={t}
        unreadCount={unreadCount}
      />
      <DesktopMarketplacePublishButton
        capability={marketplacePublishing}
        t={t}
      />
    </div>
  )
}

DesktopFloatingActions.propTypes = {
  conversations: PropTypes.array,
  isLoading: PropTypes.bool,
  isMessagesOpen: PropTypes.bool,
  isRtl: PropTypes.bool,
  marketplacePublishing: PropTypes.object,
  onToggleMessages: PropTypes.func.isRequired,
  refObject: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  t: PropTypes.func.isRequired,
  unreadCount: PropTypes.number,
}

export default DesktopFloatingActions
