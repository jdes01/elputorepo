import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { useCreateEvent } from '../../hooks/events/useCreateEvent'

export const CreateEventDialog = () => {
  const { t } = useTranslation('events')
  const { mutate } = useCreateEvent()
  const [open, setOpen] = useState(false)

  const formSchema = z.object({
    capacity: z.coerce.number().min(1).max(1000),
    title: z.string().min(2).max(50),
  })

  const form = useForm({
    defaultValues: {
      capacity: 0,
      title: '',
    },
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    mutate(values, {
      onSuccess: () => {
        form.reset()
        setOpen(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{t('CREATE_EVENT_BUTTON')}</Button>
      </DialogTrigger>

      <DialogContent>
        <Form {...form}>
          <form
            className="flex flex-col gap-7"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <DialogHeader className="flex flex-col gap-5">
              <DialogTitle>{t('CREATE_EVENT_DIALOG.TITLE')}</DialogTitle>
              <DialogDescription>
                {t('CREATE_EVENT_DIALOG.DESCRIPTION')}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('CREATE_EVENT_DIALOG.FIELDS.TITLE')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          'CREATE_EVENT_DIALOG.FIELDS.TITLE_PLACEHOLDER',
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('CREATE_EVENT_DIALOG.FIELDS.CAPACITY')}
                    </FormLabel>
                    <FormControl>
                      {/* @ts-ignore */}
                      <Input
                        type="number"
                        placeholder={t(
                          'CREATE_EVENT_DIALOG.FIELDS.CAPACITY_PLACEHOLDER',
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">{t('GLOBAL.CANCEL')}</Button>
              </DialogClose>
              <Button type="submit">{t('GLOBAL.SAVE')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
