import { asArray } from './apiData'
import { formatDate } from './formatDate'

export function sortMessageConversations(items) {
  return [...asArray(items)].sort(
    (firstConversation, secondConversation) =>
      new Date(secondConversation.updatedAt ?? secondConversation.updated_at ?? 0).getTime() -
      new Date(firstConversation.updatedAt ?? firstConversation.updated_at ?? 0).getTime(),
  )
}

export function getMessageConversationDisplay(conversation, t) {
  const participant = conversation.participant ?? {}
  const participantName = participant.name ?? participant.username ?? t('common.user')
  const lastMessage =
    conversation.latestMessage?.body ??
    conversation.latest_message?.body ??
    conversation.last_message ??
    t('messages.readyToStart')
  const updatedAt =
    conversation.updatedAt ??
    conversation.updated_at ??
    conversation.latestMessage?.createdAt ??
    conversation.latest_message?.created_at

  return {
    avatar: participant.avatar ?? participant.avatarUrl ?? participant.avatar_url ?? '',
    lastMessage,
    name: participantName,
    updatedAt: updatedAt ? formatDate(updatedAt) : t('messages.dropdown.lastMessage'),
  }
}
