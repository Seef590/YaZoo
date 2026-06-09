import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

import { getBroadcastAuthUrl, getRealtimeConfig, isRealtimeEnabled } from './appConfig'

let echoInstance = null
let realtimeStatus = isRealtimeEnabled() ? 'idle' : 'disabled'

const channelSubscriptions = new Map()
const statusListeners = new Set()

function notifyStatusListeners() {
  statusListeners.forEach((listener) => listener(realtimeStatus))
}

function setRealtimeStatus(nextStatus) {
  if (realtimeStatus === nextStatus) {
    return
  }

  realtimeStatus = nextStatus
  notifyStatusListeners()
}

function mapConnectionState(state) {
  if (state === 'connected') {
    return 'connected'
  }

  if (state === 'connecting' || state === 'initialized') {
    return 'connecting'
  }

  if (state === 'unavailable' || state === 'failed') {
    return 'error'
  }

  return 'idle'
}

function bindConnectionEvents(echo) {
  const connection = echo?.connector?.pusher?.connection

  if (!connection) {
    return
  }

  connection.bind('state_change', ({ current }) => {
    setRealtimeStatus(mapConnectionState(current))
  })

  connection.bind('error', () => {
    setRealtimeStatus('error')
  })

  if (connection.state) {
    setRealtimeStatus(mapConnectionState(connection.state))
  }
}

function createAuthorizer(channel) {
  return {
    authorize: async (socketId, callback) => {
      try {
        const response = await fetch(getBroadcastAuthUrl(), {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            socket_id: socketId,
            channel_name: channel.name,
          }),
        })

        if (!response.ok) {
          throw new Error(`Broadcast auth ${response.status}`)
        }

        callback(null, await response.json())
      } catch (error) {
        setRealtimeStatus('error')
        callback(error, null)
      }
    },
  }
}

function ensureEcho() {
  if (!isRealtimeEnabled()) {
    setRealtimeStatus('disabled')
    return null
  }

  const config = getRealtimeConfig()

  if (!config.key) {
    setRealtimeStatus('error')
    return null
  }

  if (echoInstance) {
    return echoInstance
  }

  if (typeof globalThis.document !== 'undefined') {
    globalThis.Pusher = Pusher
  }

  setRealtimeStatus('connecting')

  echoInstance = new Echo({
    broadcaster: 'pusher',
    key: config.key,
    wsHost: config.host,
    wsPort: config.port,
    wssPort: config.port,
    forceTLS: config.scheme === 'https',
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
    authorizer: createAuthorizer,
  })

  bindConnectionEvents(echoInstance)

  return echoInstance
}

export function subscribeRealtimeStatus(listener) {
  statusListeners.add(listener)
  listener(realtimeStatus)

  ensureEcho()

  return () => {
    statusListeners.delete(listener)
  }
}

export function subscribeToPrivateChannel(channelName, eventName, handler) {
  const echo = ensureEcho()

  if (!echo) {
    return () => {}
  }

  const channel = echo.private(channelName)
  const eventKey = `.${eventName}`

  channel.listen(eventKey, handler)
  channelSubscriptions.set(channelName, (channelSubscriptions.get(channelName) ?? 0) + 1)

  return () => {
    channel.stopListening(eventKey, handler)

    const remainingListeners = (channelSubscriptions.get(channelName) ?? 1) - 1

    if (remainingListeners <= 0) {
      channelSubscriptions.delete(channelName)
      echo.leaveChannel(`private-${channelName}`)
      return
    }

    channelSubscriptions.set(channelName, remainingListeners)
  }
}

export function getCurrentSocketId() {
  return echoInstance?.socketId?.() ?? null
}

export function disconnectRealtime() {
  if (!echoInstance) {
    setRealtimeStatus(isRealtimeEnabled() ? 'idle' : 'disabled')
    return
  }

  for (const channelName of channelSubscriptions.keys()) {
    echoInstance.leaveChannel(`private-${channelName}`)
  }

  channelSubscriptions.clear()
  echoInstance.disconnect()
  echoInstance = null
  setRealtimeStatus(isRealtimeEnabled() ? 'idle' : 'disabled')
}
