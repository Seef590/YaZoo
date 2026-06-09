const listeners = new Set()

export function subscribeToastBus(listener) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export function emitToast(toast) {
  listeners.forEach((listener) => listener(toast))
}

export function emitSuccessToast(description, options = {}) {
  emitToast({
    tone: 'success',
    title: options.title ?? 'Operation reussie',
    description,
    duration: options.duration ?? 4200,
  })
}

export function emitErrorToast(description, options = {}) {
  emitToast({
    tone: 'error',
    title: options.title ?? 'Action interrompue',
    description,
    duration: options.duration ?? 5200,
  })
}

export function emitInfoToast(description, options = {}) {
  emitToast({
    tone: 'info',
    title: options.title ?? 'Information',
    description,
    duration: options.duration ?? 4200,
  })
}
