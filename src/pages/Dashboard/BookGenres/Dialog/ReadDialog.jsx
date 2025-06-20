import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'

export default function ReadDialog({ bookGenre }) {
  const [open, setOpen] = useState(false)

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="dark:hover:text-error-500 mr-2 cursor-pointer p-[1px] font-medium text-gray-600 underline hover:text-blue-600 dark:text-gray-400">
          <Eye size={20} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thông tin chi tiết thể loại</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div className="flex w-full flex-col gap-2 py-3">
          <div className="flex w-full flex-row gap-2">
            <p className="font-medium">Mã thể loại:</p>
            <p>#{bookGenre.id}</p>
          </div>
          <div className="flex w-full flex-row gap-2">
            <p className="font-medium">Tên thể loại:</p>
            <p>{bookGenre.name}</p>
          </div>
          <div className="flex w-full flex-row gap-2">
            <p className="font-medium">Thời gian tạo:</p>
            <p>{bookGenre.createdAt}</p>
          </div>
          <div className="flex w-full flex-row gap-2">
            <p className="font-medium">Thời gian cập nhật:</p>
            <p>{bookGenre.updatedAt}</p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            className="ml-auto w-25 bg-gray-500 hover:bg-gray-600"
            onClick={() => handleOpenChange(false)}
          >
            Quay lại
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
