'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import AuthGuard from '@/components/AuthGuard'
import { KbTema, KbNodo } from '@/types'
import { Plus, Trash2, ChevronDown, ChevronRight, Eye, EyeOff, ShieldCheck } from 'lucide-react'

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [temas, setTemas] = useState<KbTema[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [newTema, setNewTema] = useState({ nombre: '', descripcion: '' })
  const [showAddTema, setShowAddTema] = useState(false)
  const [newNodo, setNewNodo] = useState<Partial<KbNodo>>({})
  const [showAddNodo, setShowAddNodo] = useState<string | null>(null)

  function checkPassword() {
    if (password === (process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'iapoyo2025')) {
      setAuthed(true)
      loadTemas()
    } else {
      setError('Contraseña incorrecta')
    }
  }

  async function loadTemas() {
    const supabase = createClient()
    const { data } = await supabase
      .from('kb_temas')
      .select('*, kb_nodos(*)')
      .order('orden')
    setTemas(data || [])
  }

  async function addTema() {
    if (!newTema.nombre) return
    const supabase = createClient()
    await supabase.from('kb_temas').insert({ ...newTema, orden: temas.length })
    setNewTema({ nombre: '', descripcion: '' })
    setShowAddTema(false)
    loadTemas()
  }

  async function deleteTema(id: string) {
    if (!confirm('¿Eliminar tema y todos sus nodos?')) return
    const supabase = createClient()
    await supabase.from('kb_nodos').delete().eq('tema_id', id)
    await supabase.from('kb_temas').delete().eq('id', id)
    loadTemas()
  }

  async function addNodo(temaId: string) {
    if (!newNodo.pregunta || !newNodo.respuesta) return
    const supabase = createClient()
    await supabase.from('kb_nodos').insert({ ...newNodo, tema_id: temaId, activo: true })
    setNewNodo({})
    setShowAddNodo(null)
    loadTemas()
  }

  async function toggleNodo(id: string, activo: boolean) {
    const supabase = createClient()
    await supabase.from('kb_nodos').update({ activo: !activo }).eq('id', id)
    loadTemas()
  }

  async function deleteNodo(id: string) {
    const supabase = createClient()
    await supabase.from('kb_nodos').delete().eq('id', id)
    loadTemas()
  }

  if (!authed) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-sm w-full text-center">
              <ShieldCheck size={40} className="text-[#2D4A6B] mx-auto mb-4" />
              <h2 className="font-bold text-[#2D4A6B] text-lg mb-1">Panel Admin</h2>
              <p className="text-xs text-gray-500 mb-4">Acceso restringido al equipo IApoyo</p>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && checkPassword()}
                placeholder="Contraseña de admin"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3"
              />
              {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
              <button onClick={checkPassword} className="w-full bg-[#2D4A6B] text-white py-2 rounded-lg text-sm font-medium">
                Ingresar
              </button>
            </div>
          </main>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-[#2D4A6B]">Base de Conocimiento</h1>
            <button
              onClick={() => setShowAddTema(!showAddTema)}
              className="flex items-center gap-1 bg-[#4CAF50] text-white px-3 py-2 rounded-lg text-sm font-medium"
            >
              <Plus size={14} /> Nuevo tema
            </button>
          </div>

          {showAddTema && (
            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Nombre del tema</label>
                <input value={newTema.nombre} onChange={e => setNewTema(p => ({ ...p, nombre: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Ej: Monotributo" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Descripción</label>
                <input value={newTema.descripcion} onChange={e => setNewTema(p => ({ ...p, descripcion: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="col-span-2 flex gap-2">
                <button onClick={addTema} className="bg-[#2D4A6B] text-white px-4 py-1.5 rounded text-sm">Guardar tema</button>
                <button onClick={() => setShowAddTema(false)} className="border text-gray-500 px-4 py-1.5 rounded text-sm">Cancelar</button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {temas.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p>Sin temas en la base de conocimiento</p>
                <p className="text-xs mt-1">Creá el primer tema para que el asistente IA tenga contexto</p>
              </div>
            )}
            {temas.map(tema => (
              <div key={tema.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpanded(expanded === tema.id ? null : tema.id)}
                >
                  {expanded === tema.id ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                  <div className="flex-1">
                    <span className="font-medium text-gray-800">{tema.nombre}</span>
                    {tema.descripcion && <span className="text-xs text-gray-400 ml-2">{tema.descripcion}</span>}
                  </div>
                  <span className="text-xs text-gray-400">{(tema.kb_nodos || []).length} nodos</span>
                  <button onClick={e => { e.stopPropagation(); deleteTema(tema.id) }} className="text-gray-300 hover:text-red-400 ml-2">
                    <Trash2 size={14} />
                  </button>
                </div>

                {expanded === tema.id && (
                  <div className="border-t border-gray-100 px-4 py-3">
                    {(tema.kb_nodos || []).map(nodo => (
                      <div key={nodo.id} className={`border border-gray-100 rounded-lg p-3 mb-2 ${!nodo.activo ? 'opacity-40' : ''}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700">{nodo.pregunta}</p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{nodo.respuesta}</p>
                            {nodo.palabras_clave && (
                              <p className="text-xs text-[#4CAF50] mt-1">🏷 {nodo.palabras_clave}</p>
                            )}
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button onClick={() => toggleNodo(nodo.id!, nodo.activo)} className="text-gray-300 hover:text-[#2D4A6B]">
                              {nodo.activo ? <Eye size={14} /> : <EyeOff size={14} />}
                            </button>
                            <button onClick={() => deleteNodo(nodo.id!)} className="text-gray-300 hover:text-red-400">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {showAddNodo === tema.id ? (
                      <div className="border border-dashed border-[#4CAF50] rounded-lg p-3 mt-2">
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Pregunta / Título</label>
                            <input value={newNodo.pregunta || ''} onChange={e => setNewNodo(p => ({ ...p, pregunta: e.target.value }))}
                              className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Respuesta / Contenido</label>
                            <textarea value={newNodo.respuesta || ''} onChange={e => setNewNodo(p => ({ ...p, respuesta: e.target.value }))}
                              className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm" rows={3} />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Palabras clave (separadas por coma)</label>
                            <input value={newNodo.palabras_clave || ''} onChange={e => setNewNodo(p => ({ ...p, palabras_clave: e.target.value }))}
                              className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm" placeholder="ej: monotributo, categoría, recategorización" />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => addNodo(tema.id)} className="bg-[#4CAF50] text-white px-3 py-1.5 rounded text-xs font-medium">Guardar nodo</button>
                            <button onClick={() => setShowAddNodo(null)} className="border text-gray-500 px-3 py-1.5 rounded text-xs">Cancelar</button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAddNodo(tema.id)}
                        className="flex items-center gap-1 text-xs text-[#4CAF50] hover:text-green-700 mt-2"
                      >
                        <Plus size={12} /> Agregar nodo
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
