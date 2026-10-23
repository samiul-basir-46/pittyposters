import { useState } from 'react'
import { saveContent, useData } from '../store/store'
import { Field, PageHead } from './ui'
import { useSaved } from './notify'

export default function ContentAdmin() {
  const { content } = useData()
  const saved = useSaved()
  const [d, setD] = useState({ ...content, steps: content.steps.map((s) => ({ ...s })), marqueeText: content.marquee.join('\n') })
  const set = (k) => (e) => setD((x) => ({ ...x, [k]: e.target.value }))
  const setStep = (i, k, v) => setD((x) => ({ ...x, steps: x.steps.map((s, j) => (j === i ? { ...s, [k]: v } : s)) }))

  const dirty =
    JSON.stringify({ ...d, marquee: d.marqueeText.split('\n').map((t) => t.trim()).filter(Boolean), marqueeText: undefined }) !==
    JSON.stringify({ ...content, marqueeText: undefined })

  const save = (e) => {
    e.preventDefault()
    const { marqueeText, ...rest } = d
    saved(saveContent({ ...rest, marquee: marqueeText.split('\n').map((t) => t.trim()).filter(Boolean) }), 'Website updated')
  }

  const reset = () => setD({ ...content, steps: content.steps.map((s) => ({ ...s })), marqueeText: content.marquee.join('\n') })

  return (
    <>
      <PageHead title="Site content" sub="Change the words on your website. Posters, prices and contact number are managed on their own pages." />

      <form className="a-content-form" onSubmit={save}>
        <section className="a-card">
          <div className="a-card-head">
            <h2>Top banner</h2>
          </div>
          <div className="a-form-cols">
            <Field label="Small script line">
              <input value={d.heroScript} onChange={set('heroScript')} />
            </Field>
            <Field label="Main heading">
              <input value={d.heroTitle} onChange={set('heroTitle')} />
            </Field>
            <Field label="Paragraph">
              <textarea rows={3} value={d.heroQuote} onChange={set('heroQuote')} />
            </Field>
            <div className="a-row2">
              <Field label="First button">
                <input value={d.heroCta1} onChange={set('heroCta1')} />
              </Field>
              <Field label="Second button">
                <input value={d.heroCta2} onChange={set('heroCta2')} />
              </Field>
            </div>
            <Field label="Big faded background word">
              <input value={d.heroGhost} onChange={set('heroGhost')} />
            </Field>
          </div>
        </section>

        <section className="a-card">
          <div className="a-card-head">
            <h2>Scrolling strip</h2>
          </div>
          <Field label="One message per line" hint="Leave empty to hide the strip.">
            <textarea rows={4} value={d.marqueeText} onChange={set('marqueeText')} />
          </Field>
        </section>

        <section className="a-card">
          <div className="a-card-head">
            <h2>Poster wall</h2>
          </div>
          <div className="a-form-cols">
            <Field label="Title">
              <input value={d.wallTitle} onChange={set('wallTitle')} />
            </Field>
            <Field label="Subtitle">
              <input value={d.wallSub} onChange={set('wallSub')} />
            </Field>
          </div>
        </section>

        <section className="a-card">
          <div className="a-card-head">
            <h2>How it works</h2>
          </div>
          <div className="a-form-cols">
            <Field label="Section title">
              <input value={d.stepsTitle} onChange={set('stepsTitle')} />
            </Field>
            {d.steps.map((s, i) => (
              <div className="a-step-edit" key={i}>
                <b>Step {i + 1}</b>
                <input aria-label={`Step ${i + 1} title`} value={s.title} onChange={(e) => setStep(i, 'title', e.target.value)} />
                <textarea aria-label={`Step ${i + 1} text`} rows={2} value={s.text} onChange={(e) => setStep(i, 'text', e.target.value)} />
              </div>
            ))}
          </div>
        </section>

        <section className="a-card">
          <div className="a-card-head">
            <h2>About</h2>
          </div>
          <div className="a-form-cols">
            <Field label="Title">
              <input value={d.aboutTitle} onChange={set('aboutTitle')} />
            </Field>
            <Field label="Your story">
              <textarea rows={4} value={d.aboutText} onChange={set('aboutText')} />
            </Field>
          </div>
        </section>

        <section className="a-card">
          <div className="a-card-head">
            <h2>Footer and contact</h2>
          </div>
          <div className="a-form-cols">
            <Field label="Short description">
              <textarea rows={2} value={d.footerBlurb} onChange={set('footerBlurb')} />
            </Field>
            <div className="a-row2">
              <Field label="Email">
                <input type="email" value={d.email} onChange={set('email')} />
              </Field>
              <Field label="Phone">
                <input value={d.phone} onChange={set('phone')} inputMode="tel" />
              </Field>
            </div>
            <Field label="Facebook / Instagram" hint="Shown as plain text, e.g. @pittyposters">
              <input value={d.social} onChange={set('social')} />
            </Field>
          </div>
        </section>

        <div className="a-savebar" data-dirty={dirty}>
          <span>{dirty ? 'You have unsaved changes' : 'All changes saved'}</span>
          <span>
            <button type="button" className="a-btn" onClick={reset} disabled={!dirty}>
              Discard
            </button>
            <button type="submit" className="a-btn primary" disabled={!dirty}>
              Save changes
            </button>
          </span>
        </div>
      </form>
    </>
  )
}
