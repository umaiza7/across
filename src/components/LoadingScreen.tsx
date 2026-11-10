import { Doodle } from './doodles/Doodle'
import { Guide } from './Guide'

/** Friendly wait state: the Guide thinking, with three dots taking turns. */
export function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <div className="loading__art">
        <Guide mood="think" size={112} />
        <Doodle name="sparkle" size={30} tone="oyster" motion="twinkle" className="loading__sparkle" />
      </div>
      <p className="loading__text">
        {label}
        <span className="loading__dots" aria-hidden="true"><span /><span /><span /></span>
      </p>
    </div>
  )
}
