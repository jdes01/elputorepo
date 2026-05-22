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

  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  const formSchema = z.object({
    capacity: z.coerce.number().min(1).max(1000),
    title: z.string().min(2).max(50),
    imageUrl: z.string().url().optional(),
  })

  const form = useForm({
    defaultValues: {
      capacity: 0,
      title: '',
      imageUrl: '',
    },
    resolver: zodResolver(formSchema),
  })

  // Pide URL firmada al backend
  const getPresignedUrl = async (fileName: string) => {
    const res = await fetch(`/api/upload-url?fileName=${fileName}`)
    const data = await res.json()
    return data.url
  }

  const uploadFile = async (file: File) => {
    setUploading(true)
    try {
      const presignedUrl = await getPresignedUrl(file.name)

      await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
      })

      // URL pública final
      const publicUrl = presignedUrl.split('?')[0]
      setPhotoUrl(publicUrl)
    } catch (error) {
      console.error('Error subiendo la foto', error)
      setPhotoUrl(null)
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0])
      // Preview temporal
      setPhotoUrl(URL.createObjectURL(e.target.files[0]))
      uploadFile(e.target.files[0])
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!photoUrl) return
    mutate(
      { ...values, imageUrl: photoUrl },
      {
        onSuccess: () => {
          form.reset()
          setFile(null)
          setPhotoUrl(null)
          setOpen(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{t('CREATE_EVENT_BUTTON')}</Button>
      </DialogTrigger>

      <DialogContent>
        <Form {...form}>
          <form className="flex flex-col gap-7" onSubmit={form.handleSubmit(onSubmit)}>
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
                    <FormLabel>{t('CREATE_EVENT_DIALOG.FIELDS.TITLE')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('CREATE_EVENT_DIALOG.FIELDS.TITLE_PLACEHOLDER')}
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
                    <FormLabel>{t('CREATE_EVENT_DIALOG.FIELDS.CAPACITY')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t('CREATE_EVENT_DIALOG.FIELDS.CAPACITY_PLACEHOLDER')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Input de archivo */}
              <FormItem>
                <FormLabel>{t('CREATE_EVENT_DIALOG.FIELDS.IMAGE')}</FormLabel>
                <FormControl>
                  <input type="file" accept="image/*" onChange={handleFileChange} />
                  {photoUrl && (
                    <img
                      src={photoUrl}
                      alt="Preview"
                      className="mt-2 max-h-40 object-cover rounded"
                    />
                  )}
                </FormControl>
                {uploading && <p>{t('GLOBAL.UPLOADING')}</p>}
              </FormItem>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">{t('GLOBAL.CANCEL')}</Button>
              </DialogClose>
              <Button type="submit" disabled={uploading || !photoUrl}>
                {uploading ? t('GLOBAL.UPLOADING') : t('GLOBAL.SAVE')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
