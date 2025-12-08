import SunEditor from 'suneditor-react'
import 'suneditor/dist/css/suneditor.min.css'

export default function TextEditor({ value = '', onChange, onBlur }) {
  return (
    <SunEditor
      setContents={value || ''}
      onChange={(content) => onChange?.(content)}
      onBlur={() => onBlur?.()}
      height="220px"
      setOptions={{
        buttonList: [
          ['undo', 'redo'],
          ['formatBlock', 'bold', 'underline', 'italic', 'strike'],
          ['fontColor', 'hiliteColor', 'align', 'list', 'table', 'link'],
          ['removeFormat']
        ],
        defaultStyle: 'font-size:14px;'
      }}
    />
  )
}
