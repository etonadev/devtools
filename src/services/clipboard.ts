export async function copyText(content: string): Promise<void> {
  if (!content) throw new Error('There is nothing to copy yet.')
  if (!navigator.clipboard) throw new Error('Clipboard access is unavailable. Select the text and copy it manually.')
  await navigator.clipboard.writeText(content)
}
