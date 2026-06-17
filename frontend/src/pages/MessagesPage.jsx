import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import {
  createDirectConversationRequest,
  createConversationRequest,
  createMessageRequest,
  getConversationRequest,
  getConversationsRequest,
  markConversationReadRequest,
} from '../api/messages'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { useI18n } from '../hooks/useI18n'
import { useNotifications } from '../hooks/useNotifications'
import { subscribeToPrivateChannel } from '../lib/realtime'
import { asArray, extractDataArray, extractDataObject } from '../utils/apiData'
import { formatDate } from '../utils/formatDate'
import { getErrorMessage } from '../utils/getErrorMessage'

const defaultConversationForm = {
  recipient_email: '',
  body: '',
}

function MessagesPage() {
  const { user } = useAuth()
  const { isRtl, t } = useI18n()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryFromUrl = searchParams.get('q') ?? ''
  const [conversations, setConversations] = useState([])
  const [search, setSearch] = useState(queryFromUrl)
  const [selectedConversationId, setSelectedConversationId] = useState(null)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [conversationForm, setConversationForm] = useState(defaultConversationForm)
  const [messageBody, setMessageBody] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isConversationLoading, setIsConversationLoading] = useState(false)
  const [isConversationSubmitting, setIsConversationSubmitting] = useState(false)
  const [isMessageSubmitting, setIsMessageSubmitting] = useState(false)
  const { refreshUnreadCount, latestNotification } = useNotifications()

  const safeConversations = asArray(conversations)
  const unreadMessages = safeConversations.reduce(
    (sum, conversation) => sum + (conversation.unreadCount ?? 0),
    0,
  )
  const visibleConversations = filterConversations(safeConversations, search)

  const loadConversations = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setIsLoading(true)
      }

      try {
        const response = await getConversationsRequest()

        setConversations(sortConversations(extractDataArray(response)))

        if (!silent) {
          setErrorMessage('')
        }
      } catch (error) {
        if (!silent) {
          setErrorMessage(
            getErrorMessage(error, 'Impossible de charger les conversations.'),
          )
        }
      } finally {
        if (!silent) {
          setIsLoading(false)
        }
      }
    },
    [],
  )

  const openConversation = useCallback(
    async (conversationId, { updateQuery = true, silent = false } = {}) => {
      setSelectedConversationId(conversationId)
      setIsConversationLoading(true)

      if (!silent) {
        setErrorMessage('')
        setSuccessMessage('')
      }

      try {
        const response = await getConversationRequest(conversationId)
        const conversation = extractDataObject(response, null)

        if (!conversation) {
          return
        }

        setSelectedConversation(conversation)
        setConversations((current) => upsertConversation(current, conversation))
        await markConversationReadRequest(conversationId)
        await refreshUnreadCount()

        if (updateQuery) {
          const nextSearchParams = new URLSearchParams(searchParams)
          nextSearchParams.set('conversation', String(conversationId))
          nextSearchParams.delete('email')
          nextSearchParams.delete('message')
          setSearchParams(nextSearchParams)
        }
      } catch (error) {
        setErrorMessage(
          getErrorMessage(error, 'Impossible de charger la conversation.'),
        )
      } finally {
        setIsConversationLoading(false)
      }
    },
    [refreshUnreadCount, searchParams, setSearchParams],
  )

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  useEffect(() => {
    setSearch(queryFromUrl)
  }, [queryFromUrl])

  useEffect(() => {
    if (isLoading) {
      return
    }

    const requestedConversationId = Number(searchParams.get('conversation'))
    const requestedUserId = Number(searchParams.get('user'))
    const requestedEmail = searchParams.get('email')
    const requestedMessage = searchParams.get('message')?.trim() ?? ''

    if (
      Number.isInteger(requestedConversationId) &&
      requestedConversationId > 0 &&
      requestedConversationId !== selectedConversationId
    ) {
      openConversation(requestedConversationId, { updateQuery: false, silent: true })
      return
    }

    if (requestedUserId > 0) {
      const openDirectConversation = async () => {
        setIsConversationLoading(true)
        setErrorMessage('')

        try {
          const response = await createDirectConversationRequest({
            user_id: requestedUserId,
          })
          const conversation = extractDataObject(response, null)

          if (!conversation?.id) {
            throw new Error('Conversation introuvable.')
          }

          setConversations((current) => upsertConversation(current, conversation))
          setSelectedConversationId(conversation.id)
          setSelectedConversation(conversation)
          setMessageBody(requestedMessage)
          await markConversationReadRequest(conversation.id)
          await refreshUnreadCount()

          const nextSearchParams = new URLSearchParams(searchParams)
          nextSearchParams.set('conversation', String(conversation.id))
          nextSearchParams.delete('user')
          nextSearchParams.delete('email')
          if (!requestedMessage) {
            nextSearchParams.delete('message')
          }
          setSearchParams(nextSearchParams, { replace: true })
        } catch (error) {
          setErrorMessage(
            getErrorMessage(error, 'Impossible de demarrer la conversation.'),
          )
        } finally {
          setIsConversationLoading(false)
        }
      }

      void openDirectConversation()
      return
    }

    if (!requestedConversationId && requestedEmail) {
      return
    }

    if (!requestedConversationId && conversations[0] && !selectedConversationId) {
      openConversation(conversations[0].id, { updateQuery: false, silent: true })
    }
  }, [
    conversations,
    isLoading,
    openConversation,
    refreshUnreadCount,
    searchParams,
    selectedConversationId,
    setSearchParams,
  ])

  useEffect(() => {
    const requestedEmail = searchParams.get('email')?.trim() ?? ''
    const requestedMessage = searchParams.get('message')?.trim() ?? ''

    if (!requestedEmail && !requestedMessage) {
      return
    }

    setSelectedConversationId(null)
    setSelectedConversation(null)
    setConversationForm({
      recipient_email: requestedEmail,
      body: requestedMessage,
    })
  }, [searchParams])

  const handleIncomingMessage = useCallback(
    (payload) => {
      const incomingConversationId = payload?.conversation?.id
      const incomingMessage = payload?.message

      if (!incomingConversationId || !incomingMessage) {
        return
      }

      const normalizedMessage = {
        ...incomingMessage,
        isOwn: incomingMessage.sender?.id === user?.id,
      }

      setConversations((currentConversations) => {
        const existingConversation = currentConversations.find(
          (conversation) => conversation.id === incomingConversationId,
        )

        if (!existingConversation) {
          return currentConversations
        }

        return upsertConversation(currentConversations, {
          ...existingConversation,
          updatedAt:
            payload?.conversation?.updatedAt ?? normalizedMessage.createdAt,
          latestMessage: normalizedMessage,
          unreadCount:
            selectedConversationId === incomingConversationId
              ? 0
              : (existingConversation.unreadCount ?? 0) + 1,
        })
      })

      setSelectedConversation((currentConversation) => {
        if (!currentConversation || currentConversation.id !== incomingConversationId) {
          return currentConversation
        }

        return {
          ...currentConversation,
          updatedAt:
            payload?.conversation?.updatedAt ?? normalizedMessage.createdAt,
          latestMessage: normalizedMessage,
          unreadCount: 0,
          messages: appendUniqueMessage(
            currentConversation.messages ?? [],
            normalizedMessage,
          ),
        }
      })

      if (selectedConversationId === incomingConversationId) {
        void openConversation(incomingConversationId, {
          updateQuery: false,
          silent: true,
        })
      }
    },
    [openConversation, selectedConversationId, user?.id],
  )

  useEffect(() => {
    if (conversations.length === 0) {
      return undefined
    }

    const unsubscribers = conversations.map((conversation) =>
      subscribeToPrivateChannel(
        `conversations.${conversation.id}`,
        'message.sent',
        handleIncomingMessage,
      ),
    )

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe())
    }
  }, [conversations, handleIncomingMessage])

  useEffect(() => {
    if (latestNotification?.type !== 'new_message') {
      return
    }

    const conversationId = Number(latestNotification.meta?.conversation_id)

    void loadConversations({ silent: true })

    if (conversationId > 0 && selectedConversationId === conversationId) {
      void openConversation(conversationId, {
        updateQuery: false,
        silent: true,
      })
    }
  }, [latestNotification, loadConversations, openConversation, selectedConversationId])

  const handleConversationFormChange = (field) => (event) => {
    setConversationForm((current) => ({
      ...current,
      [field]: event.target.value,
    }))
  }

  const handleCreateConversation = async (event) => {
    event.preventDefault()
    setIsConversationSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await createConversationRequest(conversationForm)
      const conversation = extractDataObject(response, null)

      if (!conversation) {
        throw new Error('Conversation introuvable.')
      }

      setConversations((current) => upsertConversation(current, conversation))
      setSelectedConversationId(conversation.id)
      setSelectedConversation(conversation)
      setConversationForm(defaultConversationForm)
      setMessageBody('')
      setSearchParams({ conversation: String(conversation.id) })
      setSuccessMessage(
        response.status === 201
          ? 'Conversation creee et premier message envoye.'
          : 'Conversation mise a jour avec votre nouveau message.',
      )

      await refreshUnreadCount()
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, 'Impossible de demarrer la conversation.'),
      )
    } finally {
      setIsConversationSubmitting(false)
    }
  }

  const handleSearch = (event) => {
    event.preventDefault()

    const nextSearchParams = new URLSearchParams(searchParams)

    if (search.trim()) {
      nextSearchParams.set('q', search.trim())
    } else {
      nextSearchParams.delete('q')
    }

    setSearchParams(nextSearchParams)
  }

  const handleResetSearch = () => {
    const nextSearchParams = new URLSearchParams(searchParams)

    nextSearchParams.delete('q')
    setSearch('')
    setSearchParams(nextSearchParams)
  }

  const handleSendMessage = async (event) => {
    event.preventDefault()

    if (!selectedConversation) {
      return
    }

    setIsMessageSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await createMessageRequest(selectedConversation.id, {
        body: messageBody,
      })

      const message = extractDataObject(response, null)
      const conversationSummary = response.data.conversation

      if (!message) {
        throw new Error('Message introuvable.')
      }

      setSelectedConversation((current) => {
        if (!current) {
          return current
        }

        return {
          ...current,
          ...conversationSummary,
          latestMessage: conversationSummary.latestMessage ?? message,
          messages: appendUniqueMessage(current.messages ?? [], message),
        }
      })
      setConversations((current) => upsertConversation(current, conversationSummary))
      setMessageBody('')
      setSuccessMessage(response.data.message)
      await refreshUnreadCount()
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Impossible d'envoyer le message."))
    } finally {
      setIsMessageSubmitting(false)
    }
  }

  const handleMessageKeyDown = (event) => {
    if (event.key !== 'Enter' || event.shiftKey) {
      return
    }

    event.preventDefault()
    event.currentTarget.form?.requestSubmit()
  }

  return (
    <section className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <section className="overflow-hidden rounded-[30px] border border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(221,214,254,0.56),_transparent_30%),linear-gradient(135deg,_rgba(255,255,255,0.98)_0%,_rgba(247,241,255,0.9)_48%,_rgba(237,233,254,0.84)_100%)] p-5 shadow-[0_24px_60px_rgba(124,58,237,0.1)] sm:rounded-[32px] sm:p-6">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-center">
          <div>
            <p className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
              {t('messages.badge')}
            </p>
            <h2 className="mt-4 text-2xl font-semibold leading-tight text-stone-950 sm:text-3xl">
              {t('messages.title')}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              {t('messages.text')}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <HeroStatCard label="Conversations" value={conversations.length} />
            <HeroStatCard label={t('messages.unread')} value={unreadMessages} />
            <HeroStatCard
              label={t('messages.activeConversation')}
              value={selectedConversation ? t('messages.opened') : t('messages.toOpen')}
            />
          </div>
        </div>
      </section>

      {errorMessage ? (
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <form
            onSubmit={handleCreateConversation}
            className="rounded-[30px] border border-white/80 bg-white/92 p-5 shadow-[0_20px_48px_rgba(124,58,237,0.08)]"
          >
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.18em] text-violet-700">
                {t('messages.newContact')}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-stone-950">
                {t('messages.newConversation')}
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                {t('messages.startWithContact')}
              </p>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">
                {t('common.contactLabel')}
              </span>
              <input
                type="text"
                required
                value={conversationForm.recipient_email}
                onChange={handleConversationFormChange('recipient_email')}
                className="w-full rounded-[22px] border border-violet-100 bg-[linear-gradient(135deg,_rgba(248,245,255,0.98),_rgba(255,255,255,0.94))] px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-violet-300 focus:bg-white"
                placeholder="contact@yazoo.ma"
              />
            </label>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-medium text-stone-700">
                {t('messages.firstMessage')}
              </span>
              <textarea
                rows={4}
                required
                value={conversationForm.body}
                onChange={handleConversationFormChange('body')}
                className="w-full rounded-[22px] border border-violet-100 bg-[linear-gradient(135deg,_rgba(248,245,255,0.98),_rgba(255,255,255,0.94))] px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-violet-300 focus:bg-white"
                placeholder="Bonjour, je vous contacte a propos de..."
              />
            </label>

            <div className="mt-4 flex justify-stretch sm:justify-end">
              <Button type="submit" disabled={isConversationSubmitting} className="w-full sm:w-auto">
                {isConversationSubmitting
                  ? t('common.loading')
                  : t('common.startConversation')}
              </Button>
            </div>
          </form>

          <div className="rounded-[30px] border border-white/80 bg-white/92 p-5 shadow-[0_20px_48px_rgba(124,58,237,0.08)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-violet-700">
                  {t('messages.inbox')}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-stone-950">
                  Conversations
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  {conversations.length} conversation
                  {conversations.length > 1 ? 's' : ''} disponible
                  {conversations.length > 1 ? 's' : ''}
                </p>
              </div>

              <div className="rounded-full bg-violet-50 px-3 py-2 text-xs font-medium text-violet-700">
                {unreadMessages} non lu{unreadMessages > 1 ? 's' : ''}
              </div>
            </div>

            <form onSubmit={handleSearch} className="mb-4 flex flex-col gap-3">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher une conversation..."
                className="w-full rounded-[22px] border border-violet-100 bg-[linear-gradient(135deg,_rgba(248,245,255,0.98),_rgba(255,255,255,0.94))] px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-violet-300 focus:bg-white"
              />
              <div className="grid gap-3 sm:flex sm:flex-wrap">
                <Button type="submit" className="w-full sm:w-auto">
                {t('common.search')}
                </Button>
                {queryFromUrl ? (
                  <Button type="button" variant="ghost" onClick={handleResetSearch} className="w-full sm:w-auto">
                    {t('common.cancel')}
                  </Button>
                ) : null}
              </div>
            </form>

            {isLoading ? <StateBox>{t('common.loading')}</StateBox> : null}

            {!isLoading && conversations.length === 0 ? (
              <StateBox>{t('messages.noConversation')}</StateBox>
            ) : null}

            {!isLoading && conversations.length > 0 && visibleConversations.length === 0 ? (
              <StateBox>{t('messages.noConversation')}</StateBox>
            ) : null}

            {!isLoading && visibleConversations.length > 0 ? (
              <div className="space-y-3">
                {visibleConversations.map((conversation) => {
                  const isActive = selectedConversationId === conversation.id

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => openConversation(conversation.id)}
                      className={`w-full rounded-[26px] border px-4 py-4 text-start transition duration-200 ${
                        isActive
                          ? 'border-transparent bg-[linear-gradient(135deg,#7c3aed,#a855f7,#c4b5fd)] text-white shadow-[0_18px_34px_rgba(124,58,237,0.22)]'
                          : 'border-violet-100 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(246,239,255,0.78))] text-stone-900 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_16px_30px_rgba(124,58,237,0.1)]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar
                          name={conversation.participant?.name ?? 'YaZoo User'}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="truncate text-sm font-semibold">
                              {conversation.participant?.name ?? 'Utilisateur'}
                            </p>
                            {conversation.unreadCount ? (
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                  isActive
                                    ? 'bg-white/20 text-white'
                                    : 'bg-violet-100 text-violet-700'
                                }`}
                              >
                                {conversation.unreadCount}
                              </span>
                            ) : null}
                          </div>
                          <p
                            className={`mt-1 truncate text-sm ${
                              isActive ? 'text-violet-50' : 'text-stone-500'
                            }`}
                          >
                            {conversation.latestMessage?.body ??
                              t('messages.readyToStart')}
                          </p>
                          <p
                            className={`mt-2 text-xs ${
                              isActive ? 'text-violet-100/90' : 'text-stone-400'
                            }`}
                          >
                            {conversation.updatedAt
                              ? formatDate(conversation.updatedAt)
                              : t('messages.opened')}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/80 bg-white/92 p-5 shadow-[0_20px_48px_rgba(124,58,237,0.08)]">
          {isConversationLoading ? (
            <StateBox>{t('common.loading')}</StateBox>
          ) : null}

          {!isConversationLoading && !selectedConversation ? (
            <StateBox>
              {t('messages.selectConversation')}
            </StateBox>
          ) : null}

          {!isConversationLoading && selectedConversation ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-violet-100 pb-5">
                <div className="flex items-center gap-3">
                  <Avatar
                    name={selectedConversation.participant?.name ?? 'YaZoo User'}
                  />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-violet-700">
                      {t('messages.openConversation')}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-stone-950">
                      {selectedConversation.participant?.name ?? 'Utilisateur'}
                    </h2>
                    <p className="text-sm text-stone-500">
                      {t('messages.discussionWith', {
                        name: selectedConversation.participant?.name ?? t('common.user'),
                      })}
                    </p>
                  </div>
                </div>

                <div className="rounded-full bg-violet-50 px-4 py-2 text-sm text-violet-700">
                  {selectedConversation.messages?.length ?? 0} message
                  {(selectedConversation.messages?.length ?? 0) > 1 ? 's' : ''}
                </div>
              </div>

              <div className="max-h-[520px] space-y-4 overflow-y-auto rounded-[28px] border border-violet-100 bg-[linear-gradient(180deg,_rgba(250,247,255,0.98),_rgba(255,255,255,0.94))] p-4">
                {selectedConversation.messages?.length ? (
                  selectedConversation.messages.map((message) => (
                    <article
                      key={message.id}
                      className={`flex ${
                        message.isOwn
                          ? isRtl ? 'justify-start' : 'justify-end'
                          : isRtl ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[88%] rounded-[24px] px-4 py-3 shadow-sm sm:max-w-xl ${
                          message.isOwn
                            ? 'bg-[linear-gradient(135deg,#7c3aed,#a855f7,#c4b5fd)] text-white shadow-[0_16px_32px_rgba(124,58,237,0.18)]'
                            : 'bg-white text-stone-900 ring-1 ring-inset ring-violet-100'
                        }`}
                      >
                        <p className="text-sm font-medium">
                          {message.isOwn ? t('messages.you') : message.sender?.name}
                        </p>
                        <p
                          className={`mt-2 text-sm leading-6 ${
                            message.isOwn ? 'text-violet-50' : 'text-stone-600'
                          }`}
                        >
                          {message.body}
                        </p>
                        <p
                          className={`mt-3 text-xs ${
                            message.isOwn ? 'text-violet-100/90' : 'text-stone-400'
                          }`}
                        >
                          {formatDate(message.createdAt ?? message.created_at)}
                        </p>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="px-4 py-16 text-center text-sm text-stone-500">
                    {t('messages.noMessageYet')}
                  </div>
                )}
              </div>

              <form
                onSubmit={handleSendMessage}
                className="rounded-[28px] border border-violet-100 bg-[linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(244,237,255,0.82))] p-4"
              >
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-stone-700">
                    {t('messages.newMessage')}
                  </span>
                  <textarea
                    rows={4}
                    required
                    value={messageBody}
                    onChange={(event) => setMessageBody(event.target.value)}
                    onKeyDown={handleMessageKeyDown}
                    className="w-full rounded-[22px] border border-violet-100 bg-white px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-violet-300"
                    placeholder={t('messages.writePlaceholder')}
                  />
                </label>

                <div className="mt-4 flex justify-stretch sm:justify-end">
                  <Button type="submit" disabled={isMessageSubmitting} className="w-full sm:w-auto">
                    {isMessageSubmitting ? t('common.sending') : t('messages.send')}
                  </Button>
                </div>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function HeroStatCard({ label, value }) {
  return (
    <div className="rounded-[24px] border border-violet-100 bg-white/88 px-4 py-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-stone-950">{value}</p>
    </div>
  )
}

function StateBox({ children }) {
  return (
    <div className="rounded-[24px] border border-dashed border-violet-200 bg-white/84 px-4 py-12 text-center text-sm text-stone-500">
      {children}
    </div>
  )
}

function sortConversations(items) {
  return [...asArray(items)].sort(
    (firstConversation, secondConversation) =>
      new Date(secondConversation.updatedAt ?? 0).getTime() -
      new Date(firstConversation.updatedAt ?? 0).getTime(),
  )
}

function upsertConversation(currentConversations, nextConversation) {
  if (!nextConversation?.id) {
    return sortConversations(currentConversations)
  }

  const remainingConversations = asArray(currentConversations).filter(
    (conversation) => conversation.id !== nextConversation.id,
  )

  return sortConversations([nextConversation, ...remainingConversations])
}

function appendUniqueMessage(messages, nextMessage) {
  const safeMessages = asArray(messages)

  if (!nextMessage?.id || safeMessages.some((message) => message.id === nextMessage.id)) {
    return safeMessages
  }

  return [...safeMessages, nextMessage]
}

function filterConversations(conversations, searchTerm) {
  const safeConversations = asArray(conversations)

  if (!searchTerm) {
    return safeConversations
  }

  const normalizedSearch = normalizeSearchText(searchTerm)

  return safeConversations.filter((conversation) =>
    [
      conversation.participant?.name,
      conversation.participant?.email,
      conversation.latestMessage?.body,
      conversation.updatedAt,
    ].some((value) => normalizeSearchText(value).includes(normalizedSearch)),
  )
}

function normalizeSearchText(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export default MessagesPage
