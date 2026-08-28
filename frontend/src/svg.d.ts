declare module '*.svg?react' {
  import type { ComponentProps, FunctionComponent } from 'react'

  const SvgComponent: FunctionComponent<ComponentProps<'svg'>>
  export default SvgComponent
}
