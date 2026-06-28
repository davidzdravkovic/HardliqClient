export function isEditableTarget(target) {
  if (!target || !(target instanceof Element)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return target.isContentEditable;
}

export function isQuestionMarkKey(event) {
  return event.key === '?' || (event.shiftKey && event.code === 'Slash');
}
