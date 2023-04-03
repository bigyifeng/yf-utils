import { Code, CODE_OPTIONS } from './code'

type messageCb = (code: Code, text: string) => any
interface SSEOptions {
  messageCb: messageCb
}

export class SSE {
  url: string
  messageCb: messageCb | null
  timer: NodeJS.Timeout | null
  event: EventSource | null
  constructor(options?: SSEOptions) {
    this.messageCb = options ? options.messageCb : null
    this.timer = null
    this.event = null
    this.url = ''
  }
  // 开启链接
  selectAndLink(url?: string) {
    this.timer && clearTimeout(this.timer)

    if (this.event) {
      return
    }

    url && (this.url = url)

    this.timer = setTimeout(() => {
      this.event = new EventSource(this.url)
      this.event.onopen = () => {}
      this.event.onerror = () => {
        this.event?.close()
        this.event = null
        console.log('重新运行')
        this.selectAndLink()
      }

      this.event.onmessage = e => {
        const { code } = JSON.parse(e.data) as { code: Code }
        if (code === 'SYSTEM-100000') {
          console.log('正常')
          return
        }
        const text = CODE_OPTIONS[code]
        console.log('错误code', code)
        console.log('text', text)
        this.messageCb && this.messageCb(code, text)
        // 清除用户信息
      }
    }, 500)
  }
  // 断开链接并清空code
  closeLink() {
    if (this.event === null) {
      return
    }
    this.event.close()
    this.event = null
  }
}
