import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';

export function ContactDetail({ open, onOpenChange }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded bg-background p-4 shadow">
          <Dialog.Title className="mb-2 text-lg font-bold">Contact Detail</Dialog.Title>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Contact info...</p>
          </div>
          <Dialog.Close asChild>
            <Button className="mt-4">Close</Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
