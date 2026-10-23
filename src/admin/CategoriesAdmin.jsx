import { useState } from 'react'
import { addCategory, deleteCategory, renameCategory, useData } from '../store/store'
import { Empty, PageHead } from './ui'
import { useNotify, useSaved } from './notify'

export default function CategoriesAdmin() {
  const { categories, posters } = useData()
  const notify = useNotify()
  const saved = useSaved()
  const [name, setName] = useState('')
  const [editing, setEditing] = useState(null) // { from, value }

  const add = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    const ok = addCategory(name)
    if (!ok) return notify('That category already exists, or the name is empty.', 'error')
    saved(ok, 'Category added')
    setName('')
  }

  const rename = () => {
    const ok = renameCategory(editing.from, editing.value)
    if (!ok) return notify('Pick a name that is not empty or already used.', 'error')
    saved(ok, 'Category renamed')
    setEditing(null)
  }

  const remove = (c) => {
    const used = posters.filter((p) => p.cat === c).length
    if (used) return notify(`"${c}" has ${used} poster${used > 1 ? 's' : ''}. Move or delete them first.`, 'error')
    if (window.confirm(`Delete the category "${c}"?`)) {
      deleteCategory(c)
      notify('Category deleted')
    }
  }

  return (
    <>
      <PageHead title="Categories" sub="These become the filter buttons on your poster wall." />

      <form className="a-inline-form" onSubmit={add}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category name" aria-label="New category name" />
        <button type="submit" className="a-btn primary">
          Add
        </button>
      </form>

      {categories.length === 0 ? (
        <Empty title="No categories yet">Add a category, then you can add posters to it.</Empty>
      ) : (
        <ul className="a-rows">
          {categories.map((c) => {
            const count = posters.filter((p) => p.cat === c).length
            const isEditing = editing?.from === c
            return (
              <li key={c} className="a-crow">
                {isEditing ? (
                  <input
                    autoFocus
                    aria-label="Category name"
                    value={editing.value}
                    onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') rename()
                      if (e.key === 'Escape') setEditing(null)
                    }}
                  />
                ) : (
                  <span className="a-crow-name">
                    <b>{c}</b>
                    <span className="a-muted">
                      {count} poster{count === 1 ? '' : 's'}
                    </span>
                  </span>
                )}
                <span className="a-prow-actions">
                  {isEditing ? (
                    <>
                      <button type="button" className="a-btn sm primary" onClick={rename}>
                        Save
                      </button>
                      <button type="button" className="a-btn sm" onClick={() => setEditing(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="a-btn sm" onClick={() => setEditing({ from: c, value: c })}>
                        Rename
                      </button>
                      <button type="button" className="a-btn sm danger" onClick={() => remove(c)}>
                        Delete
                      </button>
                    </>
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
