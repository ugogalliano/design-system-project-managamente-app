import type { Meta, StoryObj } from '@storybook/vue3'
import Button from '@/components/ui/button/Button.vue'
import Toaster from './Toaster.vue'
import { useToast, type ToastInput } from '@/composables/useToast'

const meta: Meta<typeof Toaster> = {
  title: 'Feedback/Toast',
  component: Toaster,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Il messaggio del toast è renderizzato solo come testo interpolato: eventuale markup ' +
          'nel prop `message` viene mostrato letteralmente, mai eseguito. ' +
          'Ingresso con slide da destra e fade (240ms); uscita animata anche su auto-dismiss, ' +
          'chiusura con la X e swipe orizzontale (lo swipe verticale annulla il gesto). ' +
          "L'uscita mantiene l'ultimo frame (fill-forwards, nessun flash) e la rimozione " +
          "è agganciata all'animationend del nodo, con fallback a 260ms e rimozione " +
          'immediata con prefers-reduced-motion. ' +
          'Le animazioni sono disattivate da prefers-reduced-motion.',
      },
    },
  },
  args: {
    label: 'Notifiche',
  },
}

export default meta
type Story = StoryObj<typeof meta>

interface DemoButton {
  label: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  /** One or more toast inputs pushed when the button is clicked. */
  fire: ToastInput | ToastInput[]
}

function toastStory(buttons: DemoButton[]) {
  return () => ({
    components: { Toaster, Button },
    setup() {
      const { toast, clear } = useToast()
      clear()

      const handlers = buttons.map(button => () => {
        const inputs = Array.isArray(button.fire) ? button.fire : [button.fire]
        inputs.forEach(input => toast(input))
      })
      return { buttons, handlers }
    },
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <Button v-for="(b, i) in buttons" :key="b.label" :variant="b.variant" @click="handlers[i]">
          {{ b.label }}
        </Button>
      </div>
      <Toaster />
    `,
  })
}

export const Demo: Story = {
  render: toastStory([
    {
      label: 'Success',
      fire: {
        title: 'Progetto salvato',
        message: 'Le modifiche sono state pubblicate.',
        variant: 'success',
      },
    },
    {
      label: 'Error',
      variant: 'secondary',
      fire: {
        title: 'Sincronizzazione fallita',
        message: 'Riprova tra qualche istante.',
        variant: 'error',
      },
    },
    {
      label: 'Info',
      variant: 'ghost',
      fire: {
        title: 'Nuovo commento',
        message: 'Anna ha commentato il task "Onboarding".',
        variant: 'info',
      },
    },
  ]),
}

export const AutoDismiss: Story = {
  name: 'Auto-dismiss con uscita fluida',
  render: toastStory([
    {
      label: 'Mostra per 6 secondi',
      fire: {
        title: 'Report in esportazione',
        message: 'Uscita fluida senza flash alla scadenza: prova anche a chiudere con la X.',
        variant: 'info',
        duration: 6000,
      },
    },
  ]),
}

export const Pila: Story = {
  name: 'Pila di notifiche',
  render: toastStory([
    {
      label: 'Spara tre notifiche',
      fire: [
        { title: 'Task completato', message: '"Design review" è in Fatto.', variant: 'success' },
        { title: 'Membro aggiunto', message: 'Luca è entrato nella board.', variant: 'info' },
        { title: 'Allegato mancante', message: "L'upload è fallito.", variant: 'error' },
      ],
    },
    {
      label: 'Aggiungi ancora',
      variant: 'secondary',
      fire: { title: 'Promemoria', message: 'Standup tra 10 minuti.', variant: 'info' },
    },
  ]),
}

export const MessaggioSicuro: Story = {
  name: 'Messaggio come testo',
  render: toastStory([
    {
      label: 'Toast con markup nel messaggio',
      variant: 'secondary',
      fire: { title: 'Attenzione', message: '<img src=x onerror=alert(1)>', variant: 'error' },
    },
  ]),
}
