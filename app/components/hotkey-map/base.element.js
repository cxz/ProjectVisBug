import $        from 'blingblingjs'
import hotkeys  from 'hotkeys-js'
import styles   from './base.element.css'

export class HotkeyMap extends HTMLElement {
  
  constructor() {
    super()

    this.keyboard_model = {
      num:    ['`','1','2','3','4','5','6','7','8','9','0','-','=','delete'],
      tab:    ['tab','q','w','e','r','t','y','u','i','o','p','[',']','\\'],
      caps:   ['caps','a','s','d','f','g','h','j','k','l','\'','return'],
      shift:  ['shift','z','x','c','v','b','n','m',',','.','/','shift'],
      space:  ['ctrl','alt','cmd','spacebar','cmd','alt','ctrl']
    }

    this.key_size_model = {
      num:    {12:2},
      tab:    {0:2},
      caps:   {0:3,11:3},
      shift:  {0:6,11:6},
      space:  {3:10},
    }

    this.$shadow    = this.attachShadow({mode: 'open'})
    this._hotkey    = ''
    this._usedkeys  = []

    this.tool       = 'hotkeymap'
  }

  connectedCallback() {
    this.$shift  = $('[keyboard] > section > [shift]', this.$shadow)
    this.$ctrl   = $('[keyboard] > section > [ctrl]', this.$shadow)
    this.$alt    = $('[keyboard] > section > [alt]', this.$shadow)
    this.$cmd    = $('[keyboard] > section > [cmd]', this.$shadow)
    this.$up     = $('[arrows] [up]', this.$shadow)
    this.$down   = $('[arrows] [down]', this.$shadow)
    this.$left   = $('[arrows] [left]', this.$shadow)
    this.$right  = $('[arrows] [right]', this.$shadow)
  }

  disconnectedCallback() {}

  set tool(tool) {
    this._tool = tool
    this.$shadow.innerHTML = this.render()
  }

  show() {
    this.$shadow.host.style.display = 'flex'
    hotkeys('*', (e, handler) => 
      this.watchKeys(e, handler))
  }

  hide() {
    this.$shadow.host.style.display = 'none'
    hotkeys.unbind('*')
  }

  watchKeys(e, handler) {
    e.preventDefault()
    e.stopImmediatePropagation()

    this.$shift.attr('pressed', hotkeys.shift)
    this.$ctrl.attr('pressed', hotkeys.ctrl)
    this.$alt.attr('pressed', hotkeys.alt)
    this.$cmd.attr('pressed', hotkeys.cmd)
    this.$up.attr('pressed', e.code === 'ArrowUp')
    this.$down.attr('pressed', e.code === 'ArrowDown')
    this.$left.attr('pressed', e.code === 'ArrowLeft')
    this.$right.attr('pressed', e.code === 'ArrowRight')

    const { negative, negative_modifier, side, amount } = this.createCommand({e, hotkeys})

    $('[command]', this.$shadow)[0].innerHTML = this.displayCommand({
      negative, negative_modifier, side, amount,
    })
  }

  createCommand({e, hotkeys}) {
    let amount              = hotkeys.shift ? 10 : 1
    let negative            = hotkeys.alt ? 'Subtract' : 'Add'
    let negative_modifier   = hotkeys.alt ? 'from' : 'to'

    let side = '[arrow key]'
    if (e.code === 'ArrowUp')     side = 'the top side'
    if (e.code === 'ArrowDown')   side = 'the bottom side'
    if (e.code === 'ArrowLeft')   side = 'the left side'
    if (e.code === 'ArrowRight')  side = 'the right side'
    if (hotkeys.cmd)              side = 'all sides'

    if (hotkeys.cmd && e.code === 'ArrowDown') {
      negative = 'Subtract'
      negative_modifier = 'from'
    }

    return {
      negative, negative_modifier, amount, side,
    }
  }

  displayCommand({negative, negative_modifier, side, amount}) {
    return `
      <span negative>${negative} </span>
      <span tool>${this._tool}</span>
      <span light> ${negative_modifier} </span>
      <span side>${side}</span>
      <span light> by </span>
      <span amount>${amount}</span>
    `
  }

  render() {
    return `
      ${this.styles()}
      <article>
        <div command>
          ${this.displayCommand({
            negative: '[alt/opt] ',
            negative_modifier: ' to ',
            tool: this._tool,
            side: '[arrow key]',
            amount: 1
          })}
        </div>
        <div card>
          <div keyboard>
            ${Object.entries(this.keyboard_model).reduce((keyboard, [row_name, row]) => `
              ${keyboard}
              <section ${row_name}>${row.reduce((row, key, i) => `
                ${row}
                <span 
                  ${key} 
                  ${this._hotkey == key ? 'hotkey' : ''}
                  ${this._usedkeys.includes(key) ? 'used' : ''}
                  style="flex:${this.key_size_model[row_name][i] || 1};"
                >
                  ${key}
                </span>
              `, '')}
              </section>
            `, '')}
          </div>
          <div>
            <section arrows>
              <span up used>↑</span>
              <span down used>↓</span>
              <span left used>←</span>
              <span right used>→</span>
            </section>
          </div>
        </div>
      </article>
    `
  }

  styles() {
    return `
      <style>
        ${styles}
      </style>
    `
  }
}

customElements.define('hotkey-map', HotkeyMap)