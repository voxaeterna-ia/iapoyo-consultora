'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Sidebar from '@/components/Sidebar'
import AuthGuard from '@/components/AuthGuard'
import { formatARS } from '@/types'
import { Send, ArrowLeft } from 'lucide-react'

// ─── Colors ─────────────────────────────────────────────────────────────────
// --az:#2D4A6B  --vd:#4CAF50  --na:#FF7043

// ─── Historical index data ───────────────────────────────────────────────────
const IDX_DATA: Record<string, Array<[string, number, number, number]>> = {
  icl: [['Ene 2023',519.3,10.6,144.3],['Feb 2023',572.1,10.2,156.8],['Mar 2023',637.4,11.4,171.0],['Abr 2023',712.8,11.8,185.9],['May 2023',801.4,12.4,202.3],['Jun 2023',906.2,13.1,220.3],['Jul 2023',1038.5,14.6,241.5],['Ago 2023',1209.4,16.5,268.5],['Sep 2023',1434.2,18.6,302.2],['Oct 2023',1718.4,19.8,340.3],['Nov 2023',2076.1,20.8,385.6],['Dic 2023',2587.3,24.6,451.0],['Ene 2024',3452.6,33.4,564.9],['Feb 2024',4486.3,29.9,684.2],['Mar 2024',5712.8,27.3,796.3],['Abr 2024',6981.4,22.2,879.5],['May 2024',8143.7,16.6,916.4],['Jun 2024',9287.2,14.0,924.5],['Jul 2024',10412.6,12.1,902.5],['Ago 2024',11498.3,10.4,850.1],['Sep 2024',12487.6,8.6,770.5],['Oct 2024',13412.4,7.4,680.2],['Nov 2024',14285.7,6.5,587.9],['Dic 2024',15180.2,6.3,486.7],['Ene 2025',16142.8,6.3,367.4],['Feb 2025',17024.6,5.5,279.5],['Mar 2025',17896.3,5.1,213.3],['Abr 2025',18724.1,4.6,168.2],['May 2025',19487.3,4.1,139.3]],
  ipc: [['Ene 2023',1138.3,6.0,98.9],['Feb 2023',1247.9,6.6,101.2],['Mar 2023',1381.1,7.7,102.5],['Abr 2023',1532.2,8.4,102.7],['May 2023',1690.8,7.4,108.5],['Jun 2023',1879.0,12.4,105.8],['Jul 2023',2123.1,13.0,106.0],['Ago 2023',2440.2,12.4,124.3],['Sep 2023',2782.7,12.7,138.7],['Oct 2023',3142.5,8.3,129.3],['Nov 2023',3608.2,12.8,160.9],['Dic 2023',4617.7,25.5,211.4],['Ene 2024',6175.5,20.6,442.6],['Feb 2024',7502.0,13.2,501.0],['Mar 2024',8611.9,11.0,523.4],['Abr 2024',9540.4,8.8,522.8],['May 2024',10457.1,4.2,289.4],['Jun 2024',11090.2,4.6,271.5],['Jul 2024',11705.0,4.0,263.6],['Ago 2024',12298.2,4.2,236.7],['Sep 2024',12905.1,3.5,209.2],['Oct 2024',13484.6,2.4,209.2],['Nov 2024',14020.4,2.4,166.9],['Dic 2024',14580.2,2.7,117.8],['Ene 2025',15142.8,2.3,145.2],['Feb 2025',15673.4,2.4,108.9],['Mar 2025',16204.7,2.6,88.1],['Abr 2025',16660.1,3.7,74.6],['May 2025',17080.2,3.3,63.3]],
  ripte: [['Ene 2023',496218,12.0,192.4],['Feb 2023',556564,12.2,208.2],['Mar 2023',625748,12.4,222.8],['Abr 2023',706894,13.0,237.7],['May 2023',800012,13.2,253.7],['Jun 2023',912814,14.1,272.3],['Jul 2023',1052411,15.3,293.4],['Ago 2023',1218176,15.8,315.7],['Sep 2023',1413084,16.0,338.3],['Oct 2023',1639378,16.0,359.6],['Nov 2023',1930965,17.7,387.0],['Dic 2023',2312418,19.8,421.9],['Ene 2024',2834512,22.6,471.2],['Feb 2024',3389624,19.6,509.2],['Mar 2024',4016543,18.5,541.9],['Abr 2024',4659482,16.0,558.9],['May 2024',5298347,13.7,562.3],['Jun 2024',5948423,12.3,551.9],['Jul 2024',6578412,10.6,525.2],['Ago 2024',7189341,9.3,490.1],['Sep 2024',7782412,8.2,450.4],['Oct 2024',8342178,7.2,408.8],['Nov 2024',8881234,6.5,360.0],['Dic 2024',9418562,6.1,307.3],['Ene 2025',9941823,5.6,250.8],['Feb 2025',10432417,4.9,207.8],['Mar 2025',10914632,4.6,171.8],['Abr 2025',11364723,4.1,144.0],['May 2025',11812634,3.9,123.0]]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function dv(p: number): number {
  return p >= 20 ? 35 : p >= 10 ? 28 : p >= 5 ? 21 : 14
}


// ─── Panel pNombre (Marcas) ───────────────────────────────────────────────────
function PanelNombre({ onClose }: { onClose: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 mt-3 w-full overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-[#2D4A6B] text-lg flex items-center gap-1"><img src="https://upload.wikimedia.org/wikipedia/commons/2/2b/RegisteredTM.svg" alt="®" className="w-5 h-5" /> Protección de Marca Comercial</h3>
        <button onClick={onClose} className="text-base text-gray-400 hover:text-gray-600 border border-gray-200 rounded px-2 py-1">Cerrar</button>
      </div>
      <div className="space-y-3">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-base font-semibold text-[#2D4A6B] mb-2">¿Tu nombre está protegido?</p>
          <p className="text-base text-gray-600 leading-relaxed">El registro de marca ante el INPI te da exclusividad legal por 10 años. Una marca registrada prevalece sobre dominios web y usuarios de Instagram y Facebook.</p>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {[
            { icon: '✅', text: 'Búsqueda de antecedentes en base INPI' },
            { icon: '📝', text: 'Presentación y seguimiento del trámite' },
            { icon: '🛡️', text: 'Monitoreo de marcas similares' },
            { icon: '⚖️', text: 'Defensa ante oposiciones' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-lg">{icon}</span>
              <p className="text-base text-gray-700">{text}</p>
            </div>
          ))}
        </div>
        <p className="text-base text-gray-500 text-center pt-1">Usá el chat de abajo para hacer tu consulta</p>
      </div>
    </div>
  )
}

// ─── Panel pInden (Calculadora Indemnización) ─────────────────────────────────
function PanelInden({ onClose }: { onClose: () => void }) {
  const [ingreso, setIngreso] = useState('')
  const [egreso, setEgreso] = useState('')
  const [suel, setSuel] = useState('')
  const [nr, setNr] = useState('')
  const [tipo, setTipo] = useState<'s' | 'c'>('s')
  const [prev, setPrev] = useState<'n' | 's'>('n')
  const [va, setVa] = useState<'s' | 'n'>('s')
  const [mesesAnioAnterior, setMesesAnioAnterior] = useState('')
  const [result, setResult] = useState<null | {
    lbl: string; per: number; aA: number; aM: number;
    art: number; artDetail: string;
    mp: number; pd: string;
    integ: number; integDetail: string;
    dpago: number; dpagoDetail: string;
    sacProp: number; sacPropDetail: string;
    sacConc: number; sacConcDetail: string;
    vacA: number; vacADetail: string;
    vaM: number; vaMDetail: string;
    noreg: number; noregDetail: string;
    total: number;
  }>(null)

  function calcular() {
    if (!ingreso || !egreso || !suel) return
    const s = parseFloat(suel) || 0
    const nrv = parseFloat(nr) || 0

    const ingDate = new Date(ingreso + 'T00:00:00')
    const egrDate = new Date(egreso + 'T00:00:00')
    let aA = egrDate.getFullYear() - ingDate.getFullYear()
    let aM = egrDate.getMonth() - ingDate.getMonth()
    let aD = egrDate.getDate() - ingDate.getDate()
    if (aD < 0) { aM--; aD += 30 }
    if (aM < 0) { aA--; aM += 12 }
    const per = Math.max(aA + (aM > 3 ? 1 : 0), 1)
    const lbl = aA + ' años ' + aM + ' meses'
    const rem = s + nrv
    const art = tipo === 's' ? Math.max(rem * per, rem * 2) : 0
    const artDetail = tipo === 's'
      ? `${formatARS(rem)} × ${per} períodos (mín. 2)`
      : 'Despido con causa — no aplica'

    let mp = 0
    let pd = ''
    if (tipo === 's' && prev === 'n') {
      const mesesPrev = per >= 5 ? 2 : 1
      mp = mesesPrev * rem
      pd = mesesPrev + ' mes(es) (ant. ' + (per >= 5 ? '≥' : '<') + ' 5 años)'
    } else {
      pd = prev === 's' ? 'Preaviso otorgado' : 'No corresponde'
    }

    const dM = new Date(egrDate.getFullYear(), egrDate.getMonth() + 1, 0).getDate()
    const dE = egrDate.getDate()
    const dR = dM - dE
    const integ = (tipo === 's' && prev === 'n' && dR > 0) ? Math.round((rem / 30) * dR) : 0
    const integDetail = integ > 0 ? `${dR} días restantes del mes × ${formatARS(rem / 30)}/día` : 'No aplica'

    const dpago = Math.round((rem / 30) * dE)
    const dpagoDetail = `${dE} días trabajados × ${formatARS(rem / 30)}/día`

    // Vacaciones (calculadas antes del SAC para incluirlas en SAC sobre conceptos)
    const dvac = dv(per)
    const mEnA = Math.max(egrDate.getMonth() + (egrDate.getDate() >= 15 ? 1 : 0), 1)
    const vacA = Math.round((rem / 25) * dvac * (mEnA / 12))
    const vacADetail = `${dvac} días × ${mEnA}/12 meses`

    let vaM = 0
    let vaMDetail = ''
    if (va === 'n') {
      const ma = parseInt(mesesAnioAnterior) || 12
      const perA = Math.max(per - 1, 0)
      const dvaA = dv(perA)
      vaM = Math.round((rem / 25) * dvaA * (ma / 12))
      vaMDetail = `${dvaA} días × ${ma}/12 meses (año anterior)`
    }

    // SAC proporcional del semestre
    const iniS = egrDate.getMonth() < 6
      ? new Date(egrDate.getFullYear(), 0, 1)
      : new Date(egrDate.getFullYear(), 6, 1)
    const dSem = Math.round((egrDate.getTime() - iniS.getTime()) / 86400000)
    const diasSem = egrDate.getMonth() < 6 ? 181 : 184
    const sacProp = Math.round((rem / 2) * (dSem / diasSem))
    const sacPropDetail = `${formatARS(rem)}/2 × ${dSem} días del semestre`

    // SAC sobre conceptos de la liquidación (indemnización + preaviso + integración + vacaciones)
    const sacConcBase = art + mp + integ + vacA + vaM
    const sacConc = Math.round(sacConcBase * 0.0833)
    const sacConcParts = [
      art > 0 ? 'indemnización' : '',
      mp > 0 ? 'preaviso' : '',
      integ > 0 ? 'integración' : '',
      vacA > 0 ? 'vacaciones' : '',
      vaM > 0 ? 'vac. año ant.' : '',
    ].filter(Boolean).join(' + ')
    const sacConcDetail = sacConcParts ? `(${sacConcParts}) × 8,33%` : 'No aplica'

    const noreg = nrv > 0 ? nrv * per * 2 : 0
    const noregDetail = nrv > 0 ? `${formatARS(nrv)} × ${per} × 2 (Art. 8 Ley 24.013)` : ''

    const total = art + mp + integ + dpago + sacProp + sacConc + vacA + vaM + noreg

    setResult({ lbl, per, aA, aM, art, artDetail, mp, pd, integ, integDetail, dpago, dpagoDetail, sacProp, sacPropDetail, sacConc, sacConcDetail, vacA, vacADetail, vaM, vaMDetail, noreg, noregDetail, total })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 mt-3 w-full overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-[#2D4A6B] text-lg">Calculadora Indemnización</h3>
        <button onClick={onClose} className="text-base text-gray-400 hover:text-gray-600 border border-gray-200 rounded px-2 py-1">Cerrar</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="text-base text-gray-500 block mb-1">Fecha de ingreso</label>
          <input type="date" value={ingreso} onChange={e => setIngreso(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base" />
        </div>
        <div>
          <label className="text-base text-gray-500 block mb-1">Fecha de egreso</label>
          <input type="date" value={egreso} onChange={e => setEgreso(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base" />
        </div>
        <div>
          <label className="text-base text-gray-500 block mb-1">Mejor remuneración ($)</label>
          <input type="number" value={suel} onChange={e => setSuel(e.target.value)} placeholder="0"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base" />
        </div>
        <div>
          <label className="text-base text-gray-500 block mb-1">Rem. no registrada ($)</label>
          <input type="number" value={nr} onChange={e => setNr(e.target.value)} placeholder="0"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base" />
        </div>
        <div>
          <label className="text-base text-gray-500 block mb-1">Tipo de despido</label>
          <select value={tipo} onChange={e => setTipo(e.target.value as 's' | 'c')}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base">
            <option value="s">Sin causa (Art.245)</option>
            <option value="c">Con causa</option>
          </select>
        </div>
        <div>
          <label className="text-base text-gray-500 block mb-1">¿Se otorgó preaviso?</label>
          <select value={prev} onChange={e => setPrev(e.target.value as 'n' | 's')}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base">
            <option value="n">No</option>
            <option value="s">Sí</option>
          </select>
        </div>
        <div>
          <label className="text-base text-gray-500 block mb-1">¿Vacaciones año anterior tomadas?</label>
          <select value={va} onChange={e => setVa(e.target.value as 's' | 'n')}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base">
            <option value="s">Sí</option>
            <option value="n">No — agregar al cálculo</option>
          </select>
        </div>
        {va === 'n' && (
          <div>
            <label className="text-base text-gray-500 block mb-1">Meses trabajados ese año</label>
            <input type="number" value={mesesAnioAnterior} onChange={e => setMesesAnioAnterior(e.target.value)} placeholder="12"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base" />
          </div>
        )}
      </div>
      <button onClick={calcular}
        className="w-full bg-[#FF7043] text-white py-2.5 rounded-lg text-base font-medium hover:bg-[#e64a19] mb-4">
        Calcular
      </button>
      {result && (
        <div className="space-y-1 text-base">
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <p className="font-medium text-[#2D4A6B]">Antigüedad: {result.lbl} → {result.per} período{result.per !== 1 ? 's' : ''} computable{result.per !== 1 ? 's' : ''}</p>
          </div>
          {[
            { label: 'Indemnización Art.245', detail: result.artDetail, value: result.art, show: true },
            { label: 'Preaviso', detail: result.pd, value: result.mp, show: true },
            { label: 'Integración mes despido', detail: result.integDetail, value: result.integ, show: true },
            { label: 'Días trabajados en el mes', detail: result.dpagoDetail, value: result.dpago, show: true },
            { label: 'SAC proporcional del semestre', detail: result.sacPropDetail, value: result.sacProp, show: true },
            { label: 'Vacaciones año en curso', detail: result.vacADetail, value: result.vacA, show: true },
            { label: 'Vacaciones año anterior no gozadas', detail: result.vaMDetail, value: result.vaM, show: va === 'n' },
            { label: 'SAC sobre conceptos finales', detail: result.sacConcDetail, value: result.sacConc, show: result.sacConc > 0 },
            { label: 'Trabajo no registrado', detail: result.noregDetail, value: result.noreg, show: result.noreg > 0 },
          ].filter(r => r.show).map((row, i) => (
            <div key={i} className="flex justify-between items-start py-1.5 border-b border-gray-100">
              <div>
                <p className="text-gray-700">{row.label}</p>
                {row.detail && <p className="text-base text-gray-400">{row.detail}</p>}
              </div>
              <p className="font-semibold text-[#2D4A6B] whitespace-nowrap ml-3">{formatARS(row.value)}</p>
            </div>
          ))}
          <div className="bg-[#2D4A6B] text-white rounded-xl p-4 mt-3">
            <p className="text-base opacity-70 mb-1">TOTAL ESTIMADO</p>
            <p className="text-2xl font-bold">{formatARS(result.total)}</p>
            <p className="text-base opacity-60 mt-1">Valores orientativos. Verificar con asesor.</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Panel pCosto (Costo Laboral) ─────────────────────────────────────────────
function PanelCosto({ onClose }: { onClose: () => void }) {
  const [bruto, setBruto] = useState('')
  const [antig, setAntig] = useState('')
  const [artRate, setArtRate] = useState('')
  const [osAd, setOsAd] = useState('')
  const [result, setResult] = useState<null | {
    bruto: number; cargas: number; art: number; sac: number; vac: number; vacDetail: string; osAd: number; total: number; anual: number
  }>(null)

  function calcular() {
    const b = parseFloat(bruto) || 0
    const a = parseInt(antig) || 0
    const ar = parseFloat(artRate) || 0
    const oa = parseFloat(osAd) || 0
    const cargas = Math.round(b * 0.2742)
    const art = Math.round(b * ar / 100)
    const sac = Math.round(b / 12)
    const dias = dv(a)
    const vac = Math.round((b / 25) * dias / 12)
    const total = b + cargas + art + sac + vac + oa
    const anual = Math.round(total * 13)
    setResult({ bruto: b, cargas, art, sac, vac, vacDetail: `${dias} días/año ÷ 12 (ant. ${a} años)`, osAd: oa, total, anual })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 mt-3 w-full overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-[#2D4A6B] text-lg">Costo Laboral Completo</h3>
        <button onClick={onClose} className="text-base text-gray-400 hover:text-gray-600 border border-gray-200 rounded px-2 py-1">Cerrar</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div>
          <label className="text-base text-gray-500 block mb-1">Sueldo bruto ($)</label>
          <input type="number" value={bruto} onChange={e => setBruto(e.target.value)} placeholder="0"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base" />
        </div>
        <div>
          <label className="text-base text-gray-500 block mb-1">Antigüedad (años)</label>
          <input type="number" value={antig} onChange={e => setAntig(e.target.value)} placeholder="0"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base" />
        </div>
        <div>
          <label className="text-base text-gray-500 block mb-1">Alícuota ART (%)</label>
          <input type="number" value={artRate} onChange={e => setArtRate(e.target.value)} placeholder="2.5" step="0.1"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base" />
        </div>
        <div>
          <label className="text-base text-gray-500 block mb-1">Obra social adicional ($)</label>
          <input type="number" value={osAd} onChange={e => setOsAd(e.target.value)} placeholder="0"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base" />
        </div>
      </div>
      <button onClick={calcular}
        className="w-full bg-[#FF7043] text-white py-2.5 rounded-lg text-base font-medium hover:bg-[#e64a19] mb-4">
        Calcular
      </button>
      {result && (
        <div className="space-y-1 text-base">
          {[
            { label: 'Sueldo bruto', detail: '', value: result.bruto },
            { label: 'Cargas sociales patronales (~27,42%)', detail: '', value: result.cargas },
            { label: 'ART', detail: `${artRate}% del bruto`, value: result.art },
            { label: 'SAC mensual (1/12)', detail: '', value: result.sac },
            { label: 'Vacaciones (incidencia mensual)', detail: result.vacDetail, value: result.vac },
            ...(result.osAd > 0 ? [{ label: 'Obra social adicional', detail: '', value: result.osAd }] : []),
          ].map((row, i) => (
            <div key={i} className="flex justify-between items-start py-1.5 border-b border-gray-100">
              <div>
                <p className="text-gray-700">{row.label}</p>
                {row.detail && <p className="text-base text-gray-400">{row.detail}</p>}
              </div>
              <p className="font-semibold text-[#2D4A6B] whitespace-nowrap ml-3">{formatARS(row.value)}</p>
            </div>
          ))}
          <div className="bg-[#2D4A6B] text-white rounded-xl p-4 mt-3 space-y-2">
            <div className="flex justify-between">
              <p className="font-semibold">COSTO REAL / MES</p>
              <p className="text-xl font-bold">{formatARS(result.total)}</p>
            </div>
            <div className="flex justify-between text-base opacity-80">
              <p>Costo anual (×13)</p>
              <p>{formatARS(result.anual)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Panel pAlquiler (Actualización Alquiler) ─────────────────────────────────
function PanelAlquiler({ onClose }: { onClose: () => void }) {
  const [base, setBase] = useState('')
  const [indice, setIndice] = useState<'ICL — BCRA (Ley 27.551)' | 'IPC — INDEC' | 'RIPTE' | '% manual'>('ICL — BCRA (Ley 27.551)')
  const [idxIni, setIdxIni] = useState('')
  const [idxAct, setIdxAct] = useState('')
  const [pctManual, setPctManual] = useState('')
  const [result, setResult] = useState<null | { base: number; variacion: number; nuevo: number; aumento: number; varDetail: string }>(null)
  const [histTab, setHistTab] = useState<'icl' | 'ipc' | 'ripte'>('icl')

  function calcular() {
    const b = parseFloat(base) || 0
    let variacion = 0
    let varDetail = ''
    if (indice === '% manual') {
      variacion = parseFloat(pctManual) || 0
      varDetail = `${variacion}% manual`
    } else {
      const ini = parseFloat(idxIni) || 0
      const act = parseFloat(idxAct) || 0
      if (ini > 0) {
        variacion = ((act - ini) / ini) * 100
        varDetail = `De ${ini} a ${act} (${indice.split(' ')[0]})`
      }
    }
    const nuevo = b * (1 + variacion / 100)
    const aumento = nuevo - b
    setResult({ base: b, variacion, nuevo, aumento, varDetail })
  }

  const histData = IDX_DATA[histTab]
  const last24 = histData.slice(-24)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 mt-3 w-full overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-[#2D4A6B] text-lg">Actualización de Alquiler</h3>
        <button onClick={onClose} className="text-base text-gray-400 hover:text-gray-600 border border-gray-200 rounded px-2 py-1">Cerrar</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
        <div>
          <label className="text-base text-gray-500 block mb-1">Alquiler actual ($)</label>
          <input type="number" value={base} onChange={e => setBase(e.target.value)} placeholder="0"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base" />
        </div>
        <div>
          <label className="text-base text-gray-500 block mb-1">Índice</label>
          <select value={indice} onChange={e => setIndice(e.target.value as typeof indice)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base">
            <option>ICL — BCRA (Ley 27.551)</option>
            <option>IPC — INDEC</option>
            <option>RIPTE</option>
            <option>% manual</option>
          </select>
        </div>
        {indice !== '% manual' ? (
          <>
            <div>
              <label className="text-base text-gray-500 block mb-1">Índice al inicio</label>
              <input type="number" value={idxIni} onChange={e => setIdxIni(e.target.value)} step="0.01"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base" placeholder="0.00" />
            </div>
            <div>
              <label className="text-base text-gray-500 block mb-1">Índice actual</label>
              <input type="number" value={idxAct} onChange={e => setIdxAct(e.target.value)} step="0.01"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base" placeholder="0.00" />
            </div>
          </>
        ) : (
          <div>
            <label className="text-base text-gray-500 block mb-1">Porcentaje (%)</label>
            <input type="number" value={pctManual} onChange={e => setPctManual(e.target.value)} placeholder="0"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base" />
          </div>
        )}
      </div>
      <button onClick={calcular}
        className="w-full bg-[#FF7043] text-white py-2.5 rounded-lg text-base font-medium hover:bg-[#e64a19] mb-4">
        Calcular actualización
      </button>
      {result && (
        <div className="bg-green-50 rounded-lg p-4 space-y-2 text-base mb-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Alquiler actual</span>
            <span>{formatARS(result.base)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Variación del índice</span>
            <span className="text-[#FF7043]">{result.variacion.toFixed(2)}% <span className="text-base text-gray-400">({result.varDetail})</span></span>
          </div>
          <div className="flex justify-between font-bold border-t border-green-200 pt-2">
            <span>Nuevo alquiler actualizado</span>
            <span className="text-[#2D4A6B] text-lg">{formatARS(result.nuevo)}</span>
          </div>
          <div className="flex justify-between text-base text-gray-600">
            <span>Aumento mensual</span>
            <span className="text-[#4CAF50]">+ {formatARS(result.aumento)}</span>
          </div>
        </div>
      )}
      <p className="text-base text-gray-400 mb-4">Ley 27.551 (ICL anual) · DNU 70/2023 (libre pacto). ICL en bcra.gob.ar</p>
      {/* Tabla histórica */}
      <div className="flex gap-2 mb-3">
        {(['icl', 'ipc', 'ripte'] as const).map(t => (
          <button key={t} onClick={() => setHistTab(t)}
            className={`px-3 py-1 rounded text-base font-medium ${histTab === t ? 'bg-[#2D4A6B] text-white' : 'bg-gray-100 text-gray-600'}`}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-base">
          <thead>
            <tr className="bg-gray-50 text-gray-500">
              <th className="text-left px-2 py-1.5">Período</th>
              <th className="text-right px-2 py-1.5">Índice</th>
              <th className="text-right px-2 py-1.5">Var. mensual</th>
              <th className="text-right px-2 py-1.5">Var. anual</th>
            </tr>
          </thead>
          <tbody>
            {last24.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-2 py-1">{row[0]}</td>
                <td className="px-2 py-1 text-right">{typeof row[1] === 'number' && row[1] > 1000 ? row[1].toLocaleString('es-AR') : row[1]}</td>
                <td className="px-2 py-1 text-right text-[#FF7043]">{row[2]}%</td>
                <td className="px-2 py-1 text-right text-[#4CAF50]">{row[3]}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Panel pPatente (Consulta Multas) ─────────────────────────────────────────
function PanelPatente({ onClose }: { onClose: () => void }) {
  const NULIDAD = [
    'Lugar de infracción impreciso o incorrecto.',
    'Falta de señalización de velocidad máxima o radar.',
    'Radar sin acreditación de calibración vigente.',
    'Falta de homologación del equipo utilizado.',
    'Dos o más vehículos en la misma fotografía.',
    'Imposibilidad de identificar qué vehículo generó la medición.',
    'Dominio ilegible o dudoso.',
    'Fotografía insuficiente o sin contexto vial.',
    'Fecha u hora errónea o inconsistente.',
    'Error en dominio, marca o modelo del vehículo.',
    'Falta de firma digital verificable.',
    'Falta de identificación de la autoridad actuante.',
    'Defectos formales en el acta de infracción.',
    'Notificación defectuosa o inexistente.',
    'Falta de acceso al expediente o prueba técnica.',
    'Falta de acreditación de velocidad máxima vigente.',
    'Diferencia mínima respecto del límite sin prueba técnica suficiente.',
    'Violación del debido proceso y derecho de defensa.',
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 mt-3 w-full overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-[#2D4A6B] text-lg">🚗 Multas & Fotomultas</h3>
        <button onClick={onClose} className="text-base text-gray-400 hover:text-gray-600 border border-gray-200 rounded px-2 py-1">Cerrar</button>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
        <p className="text-sm font-semibold text-[#2D4A6B] mb-1">📋 Para consultar tus infracciones informá:</p>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li><b>Dominio del vehículo</b> (patente) o <b>DNI del titular</b></li>
          <li>Jurisdicción: <b>Provincia de Buenos Aires</b> o <b>CABA</b></li>
        </ul>
        <p className="text-xs text-gray-400 mt-2">⚠️ Solo operamos en PBA y CABA.</p>
      </div>
      {/* Motivos de Nulidad */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-3">
        <h4 className="font-semibold text-[#FF7043] text-lg mb-2">Motivos de Nulidad de Fotomulta</h4>
        <ol className="space-y-1">
          {NULIDAD.map((item, i) => (
            <li key={i} className="text-base text-gray-700 flex gap-2">
              <span className="text-[#FF7043] font-bold flex-shrink-0">{i + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="bg-gray-50 rounded-lg p-3 text-base text-gray-600">
        <strong>Prescripción (Pcia. Buenos Aires):</strong> Faltas leves: 2 años. Faltas graves: 5 años. Desde la fecha de infracción.
      </div>
    </div>
  )
}

// ─── Panel pMkt (Marketing servicios) ─────────────────────────────────────────
const MKT_SERVICIOS = [
  { icon: '📱', nombre: 'Desarrollo de Apps', desc: 'Apps móviles y web a medida.' },
  { icon: '🌐', nombre: 'Sitios Web', desc: 'Sitios, landing pages y tiendas online.' },
  { icon: '📣', nombre: 'Community Management', desc: 'Gestión de redes y contenido.' },
  { icon: '🎯', nombre: 'Publicidad Digital', desc: 'Meta Ads, Google Ads, TikTok Ads.' },
  { icon: '🎨', nombre: 'Identidad de Marca', desc: 'Logo, paleta y manual de marca.' },
  { icon: '📊', nombre: 'Estrategia Digital', desc: 'Planificación, métricas y optimización.' },
]

function PanelMkt({ onClose }: { onClose: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 mt-3 w-full overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-[#2D4A6B] text-lg">📱 Servicios de Marketing</h3>
        <button onClick={onClose} className="text-base text-gray-400 hover:text-gray-600 border border-gray-200 rounded px-2 py-1">Cerrar</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {MKT_SERVICIOS.map(s => (
          <div key={s.nombre} className="border border-gray-200 rounded-xl p-3">
            <p className="text-xl mb-1">{s.icon}</p>
            <p className="text-base font-semibold text-[#2D4A6B]">{s.nombre}</p>
            <p className="text-base text-gray-500">{s.desc}</p>
          </div>
        ))}
      </div>
      <p className="text-base text-gray-500 text-center mt-4">Usá el chat de abajo para consultar sobre cualquier servicio</p>
    </div>
  )
}

// ─── Ecosistema por módulo ─────────────────────────────────────────────────────
type ModuleId = 'fiscal' | 'marcas' | 'inden' | 'costos' | 'autos' | 'mkt' | 'plata' | 'construccion'

interface EcoBtn {
  label: string
  action: 'chat' | 'directMsg' | 'panel'
  chatMsg?: string
  directMsg?: string
  panelId?: string
}

const ECOSISTEMAS: Record<ModuleId, { titulo: string; btns: EcoBtn[] }> = {
  construccion: {
    titulo: 'Cálculo de Materiales',
    btns: [
      { label: '🧱 Muro Simple', action: 'panel', panelId: 'pConstruccion' },
      { label: '🧱🧱 Muro Doble', action: 'panel', panelId: 'pMuroDoble' },
      { label: '🏗️ Contrapiso', action: 'panel', panelId: 'pContrapiso' },
    ],
  },
  fiscal: {
    titulo: 'Consultas Fiscales',
    btns: [
      { label: '¿Cuánto puedo facturar?', action: 'directMsg', directMsg: 'Los límites anuales de facturación en Monotributo varían según la categoría y la actividad (servicios o venta de bienes). Para 2024/2025, las categorías van desde la A hasta la K, con topes que oscilan entre $7.600.000 y $68.000.000 aproximadamente según actualizaciones periódicas. Es fundamental controlar el acumulado mensual para anticipar una recategorización. En IApoyo Consultora hacemos un seguimiento personalizado de tu situación para que nunca te tomen por sorpresa.' },
      { label: '¿Cerca de recategorización?', action: 'directMsg', directMsg: 'La recategorización en Monotributo se realiza en enero y julio de cada año, tomando como referencia los últimos 12 meses de facturación, energía eléctrica consumida y superficie del local afectado. Si tu facturación acumulada se acerca al tope de tu categoría actual, debés recategorizarte —o de lo contrario AFIP puede hacerlo de oficio con recargos. Te recomendamos revisar tu situación con al menos 60 días de anticipación. Consultanos para hacer el análisis.' },
      { label: '¿Cuándo vence AFIP?', action: 'directMsg', directMsg: 'Los vencimientos de AFIP dependen del tipo de obligación y de la terminación de CUIT. El Monotributo vence el día 7 de cada mes (con variación según terminación). El IVA, Ganancias e Ingresos Brutos tienen calendarios propios publicados en el sitio de AFIP. En IApoyo Consultora llevamos el control de todos tus vencimientos para que nunca pierdas una fecha clave.' },
      { label: '¿Qué gastos cargar?', action: 'directMsg', directMsg: 'Los gastos deducibles dependen del régimen impositivo. En Monotributo no se deducen gastos del impuesto integrado. En Responsable Inscripto, son deducibles los gastos necesarios para obtener y conservar la renta gravada: alquileres, servicios, rodados, honorarios, tecnología, entre otros, siempre respaldados con comprobante válido. Para Ganancias de cuarta categoría (relación de dependencia), existen deducciones específicas. Cada situación es particular: consultanos para maximizar tu ahorro fiscal.' },
      { label: 'Acreditaciones vs facturación', action: 'directMsg', directMsg: 'AFIP cruza sistemáticamente las acreditaciones bancarias con la facturación declarada. Diferencias injustificadas pueden generar fiscalizaciones, intimaciones y ajustes impositivos con intereses y multas. Es importante que ingresos de cualquier origen (transferencias, Mercado Pago, tarjetas) estén correctamente respaldados. En IApoyo Consultora analizamos tu situación bancaria-fiscal para identificar desvíos antes de que lo haga el organismo.' },
      { label: '¿Qué pasa si no presento?', action: 'directMsg', directMsg: 'La falta de presentación de declaraciones juradas genera multas formales automáticas cuyo importe fue significativamente incrementado por la Ley 27.742 (Ley de Bases, 2024) y sus resoluciones reglamentarias. A esto se suma la posible suspensión de la CUIT, la imposibilidad de emitir facturas electrónicas, la exclusión del Monotributo y la facultad de AFIP de determinar la deuda de oficio. Regularizar la situación antes de ser intimado reduce sustancialmente los costos. Contactá a IApoyo Consultora para evaluar tu caso y minimizar el impacto.' },
    ],
  },
  marcas: {
    titulo: 'Marcas Comerciales',
    btns: [
      { label: '¿Por qué registrar mi marca?', action: 'directMsg', directMsg: 'El registro de marca ante el INPI otorga la titularidad exclusiva del signo distintivo por 10 años renovables, y su alcance va más allá de lo comercial: una marca registrada prevalece sobre el dominio web (aunque el dominio haya sido comprado primero) y es el instrumento legal más efectivo para reclamar la identidad en redes sociales como Instagram y Facebook, donde las plataformas priorizan a titulares de marcas ante denuncias de suplantación o uso no autorizado del nombre. Sin registro, cualquier tercero puede usar tu nombre, registrarlo él mismo y dejarte sin herramientas legales para defenderte. En IApoyo Consultora acompañamos todo el proceso de registro, monitoreo y defensa de tu marca.' },
      { label: '¿Mi nombre está protegido?', action: 'panel', panelId: 'pNombre' },
    ],
  },
  inden: {
    titulo: 'Indemnización Laboral',
    btns: [
      { label: 'Calcular indemnización', action: 'panel', panelId: 'pInden' },
      { label: '¿Qué incluye la liquidación?', action: 'directMsg', directMsg: 'Una liquidación laboral ante un despido sin causa incluye: indemnización por antigüedad (art. 245 LCT), preaviso omitido o indemnización sustitutiva, integración del mes de despido (si no coincide con fin de mes), SAC proporcional al semestre en curso, vacaciones proporcionales no gozadas, y días trabajados del último período. En casos de trabajo no registrado o deficiente registro, pueden adicionarse indemnizaciones especiales de la Ley 24.013. Cada caso tiene particularidades: consultanos para verificar que la liquidación sea correcta.' },
      { label: '¿Cuánto es el preaviso?', action: 'directMsg', directMsg: 'Según el art. 231 de la LCT, el plazo de preaviso es de 15 días durante el período de prueba, 1 mes si la antigüedad es inferior a 5 años, y 2 meses si supera los 5 años. Si el empleador no otorga el preaviso, debe abonar una indemnización sustitutiva equivalente a los salarios del período. Además, si el despido no ocurre el último día del mes, corresponde la "integración del mes de despido" hasta completar el mes calendario. Usá nuestra calculadora para obtener el detalle exacto de tu situación.' },
      { label: '¿Cómo se calcula el SAC?', action: 'directMsg', directMsg: 'El SAC (Sueldo Anual Complementario) equivale al 50% de la mejor remuneración mensual del semestre. Al momento de la liquidación final se abona el proporcional del semestre en curso: se divide el SAC semestral por 6 y se multiplica por los meses trabajados en ese período (contando fracción mayor a 15 días como mes completo). Nuestra calculadora incluye este concepto automáticamente una vez que ingresás las fechas y la remuneración.' },
    ],
  },
  costos: {
    titulo: 'Alquileres & Costos',
    btns: [
      { label: 'Costo laboral completo', action: 'panel', panelId: 'pCosto' },
      { label: 'Actualización de alquiler', action: 'panel', panelId: 'pAlquiler' },
      { label: '¿Cómo funciona el ICL?', action: 'directMsg', directMsg: 'El Índice de Contratos de Locación (ICL) es elaborado por el Banco Central de la República Argentina (BCRA) y se publica diariamente. Desde la Ley 27.551, los contratos de alquiler habitacional se actualizan anualmente usando este índice, que combina en partes iguales la variación del IPC (inflación) y el RIPTE (remuneración promedio de trabajadores). La actualización se calcula dividiendo el índice del día de la actualización por el índice del día del inicio del contrato. Nuestra herramienta realiza este cálculo automáticamente con datos actualizados.' },
      { label: '¿Qué son las cargas patronales?', action: 'directMsg', directMsg: 'Las cargas patronales son los aportes y contribuciones que el empleador debe ingresar mensualmente al sistema de seguridad social, sobre la remuneración bruta del trabajador. Incluyen: contribuciones al SIPA (jubilación), INSSJP (PAMI), asignaciones familiares, Fondo Nacional de Empleo, obra social patronal y ART (Aseguradora de Riesgos del Trabajo). En promedio representan entre el 27% y el 30% adicional sobre el salario bruto, aunque varían según la actividad y el tamaño de la empresa. Nuestra calculadora de costo laboral te muestra el detalle completo.' },
    ],
  },
  autos: {
    titulo: 'Vehículos & Fotomultas',
    btns: [
      { label: 'Consultar multas por patente', action: 'panel', panelId: 'pPatente' },
      { label: 'Motivos nulidad fotomulta', action: 'directMsg', directMsg: 'Las infracciones de tránsito captadas por sistemas automáticos pueden impugnarse por múltiples causales: deficiencias en la homologación o calibración del dispositivo de detección, falta de señalización adecuada en el lugar, error en la identificación del vehículo o del titular, vicios formales en el acta (fecha, hora, lugar, norma infringida), notificación defectuosa, o prescripción de la infracción. Cada jurisdicción tiene su propio procedimiento. En IApoyo Consultora evaluamos el caso y determinamos la estrategia más adecuada para impugnar.' },
      { label: '¿Cómo apelar una multa?', action: 'directMsg', directMsg: 'El procedimiento varía según la jurisdicción, pero generalmente implica: presentar un descargo formal ante el organismo que emitió la infracción dentro del plazo legal (habitualmente 15 a 30 días hábiles desde la notificación), adjuntar documentación técnica y jurídica que sustente la impugnación, y en caso de rechazo, recurrir ante la instancia judicial competente. Es fundamental actuar dentro de los plazos para no perder el derecho de defensa. Contactanos dentro de las 48 horas de recibida la notificación para evaluar tu caso.' },
      { label: '¿Cuándo prescribe?', action: 'directMsg', directMsg: 'En la Ciudad de Buenos Aires, las infracciones de tránsito prescriben a los 2 años desde la fecha de comisión (art. 67 de la Ley de Tránsito N° 2148). En la Provincia de Buenos Aires y otras jurisdicciones los plazos pueden diferir. La prescripción se interrumpe con actos procesales válidos como notificaciones fehacientes o inicio de acciones judiciales. Verificar la fecha exacta de la infracción y los actos interruptivos es clave para determinar si ya operó la prescripción.' },
    ],
  },
  mkt: {
    titulo: 'Marketing',
    btns: [
      { label: 'Ver servicios de Marketing', action: 'panel', panelId: 'pMkt' },
      { label: '¿Por qué necesito una web?', action: 'directMsg', directMsg: 'Una página web profesional es la base de tu presencia digital y funciona como tu local comercial abierto las 24 horas. A diferencia de las redes sociales —plataformas que no controlás y pueden cambiar sus algoritmos—, tu web es un activo propio. Mejora tu credibilidad ante clientes y proveedores, facilita que te encuentren en Google (SEO), y concentra toda la información de tu negocio en un solo lugar accesible desde cualquier dispositivo. En IApoyo Consultora diseñamos sitios a medida con foco en conversión de clientes.' },
      { label: '¿Qué es Community Management?', action: 'directMsg', directMsg: 'El community management es la gestión profesional de la presencia de una marca en redes sociales (Instagram, Facebook, LinkedIn, etc.). Incluye la creación de contenido estratégico, publicación consistente, gestión de respuestas y comentarios, y análisis de métricas de rendimiento. Una gestión profesional incrementa el alcance orgánico, fortalece la confianza de tu audiencia y convierte seguidores en clientes. No alcanza con publicar esporádicamente: la consistencia y la estrategia son las claves del crecimiento.' },
      { label: 'Meta Ads vs Google Ads', action: 'directMsg', directMsg: 'Meta Ads (Facebook e Instagram) impacta a usuarios según sus intereses, comportamientos y características demográficas —ideal para generar demanda en audiencias que aún no te conocen. Google Ads captura demanda existente: aparece cuando alguien busca activamente tu producto o servicio —ideal para conversión directa. Lo óptimo para la mayoría de los negocios es combinar ambas plataformas según el objetivo: Meta para awareness y branding, Google para captura de intención de compra. En IApoyo Consultora armamos la estrategia según tu rubro y presupuesto.' },
    ],
  },
  plata: {
    titulo: 'Mi Plata',
    btns: [
      { label: '💰 Abrir Mi Plata', action: 'panel', panelId: 'pPlata' },
    ],
  },
}

const MODULOS_GRID = [
  { id: 'fiscal' as ModuleId, label: 'Fiscal', emoji: '📊' },
  { id: 'marcas' as ModuleId, label: 'Marcas', emoji: '®' },
  { id: 'inden' as ModuleId, label: 'Indemnización', emoji: '⚖️' },
  { id: 'costos' as ModuleId, label: 'Alquileres & Costos', emoji: '🏠' },
  { id: 'autos' as ModuleId, label: 'Vehículos & Fotomultas', emoji: '🚗' },
  { id: 'mkt' as ModuleId, label: 'Marketing', emoji: '📱' },
  { id: 'plata' as ModuleId, label: 'Mi Plata', emoji: '💰' },
  { id: 'construccion' as ModuleId, label: 'Construcción', emoji: '🧱' },
]

// ─── Panel pPlata (Mi Plata) ──────────────────────────────────────────────────
const CATS_PLATA = [
  { key: 'super',        label: 'Súper',          emoji: '🛒', subs: [] },
  { key: 'combustible',  label: 'Combustible',     emoji: '⛽', subs: [] },
  { key: 'esparcimiento',label: 'Esparcimiento',   emoji: '🎉', subs: [] },
  { key: 'servicios',    label: 'Servicios',       emoji: '💡', subs: [] },
  { key: 'impuestos',    label: 'Imp. y tasas',    emoji: '📋', subs: [] },
  { key: 'salud',        label: 'Salud',           emoji: '🏥', subs: [] },
  { key: 'educacion',    label: 'Educación',       emoji: '🎓', subs: [] },
  { key: 'mascotas',     label: 'Mascotas',        emoji: '🐾', subs: ['🍖 Comida', '🩺 Veterinario', '✂️ Peluquería'] },
  { key: 'materiales',   label: 'Materiales e insumos', emoji: '🔧', subs: ['🪵 Materiales', '🧴 Insumos', '🛠️ Herramientas', '📦 Otros'] },
  { key: 'alquiler',     label: 'Alquiler',        emoji: '🏠', subs: [] },
  { key: 'sueldos',      label: 'Sueldos y jornales', emoji: '👷', subs: ['💵 Sueldo', '🏦 Cargas sociales', '📄 Otro'] },
  { key: 'otros',        label: 'Otros gastos',    emoji: '➕', subs: ['🍔 Comidas rápidas', '📦 Mercado Libre', '☕ Cafetería', '🚌 Movilidad', '✏️ Otro (editable)'] },
]

type GastoPlata = { id: number; cat: string; emoji: string; monto: number; desc: string; fecha: string }
type IngDiario = { id: number; monto: number; horas: number; desc: string; fecha: string }

function PanelMiPlata({ onClose }: { onClose: () => void }) {
  const hoyISO = new Date().toISOString().split('T')[0]
  const [tipoIngreso, setTipoIngreso] = useState<'dependencia' | 'independiente'>('dependencia')
  const [ingreso, setIngreso] = useState('')
  const [horas, setHoras] = useState('')
  const [configurado, setConfigurado] = useState(false)
  // Ingresos independiente
  const [ingresosDiarios, setIngresosDiarios] = useState<IngDiario[]>([])
  const [montoIng, setMontoIng] = useState('')
  const [horasIng, setHorasIng] = useState('')
  const [descIng, setDescIng] = useState('')
  const [fechaIng, setFechaIng] = useState(hoyISO)
  const [nextIngId, setNextIngId] = useState(1)
  // Gastos
  const [catActiva, setCatActiva] = useState<{ key: string; label: string; emoji: string; subs: string[] } | null>(null)
  const [subActiva, setSubActiva] = useState('')
  const [otroEditable, setOtroEditable] = useState('')
  const [montoGasto, setMontoGasto] = useState('')
  const [descGasto, setDescGasto] = useState('')
  const [fechaGasto, setFechaGasto] = useState(hoyISO)
  const [gastos, setGastos] = useState<GastoPlata[]>([])
  const [nextId, setNextId] = useState(1)

  const ingresoFijo = parseFloat(ingreso) || 0
  const totalIngDiarios = ingresosDiarios.reduce((s, i) => s + i.monto, 0)
  const totalHorasInd = ingresosDiarios.reduce((s, i) => s + i.horas, 0)
  const ingresoTotal = tipoIngreso === 'dependencia' ? ingresoFijo : totalIngDiarios
  const horasTotal = tipoIngreso === 'dependencia' ? (parseFloat(horas) || 0) : totalHorasInd
  const valorHora = horasTotal > 0 && ingresoTotal > 0 ? Math.round(ingresoTotal / horasTotal) : 0

  const totalGastos = gastos.reduce((s, g) => s + g.monto, 0)
  const horasGastadas = valorHora > 0 ? totalGastos / valorHora : 0
  const horasRestantes = horasTotal - horasGastadas
  const pesoRestante = ingresoTotal - totalGastos

  function formatHoras(h: number) {
    const hh = Math.floor(Math.abs(h))
    const mm = Math.round((Math.abs(h) - hh) * 60)
    return `${hh} h${mm > 0 ? ` ${mm} min` : ''}`
  }

  const puedoConfigurar = tipoIngreso === 'dependencia'
    ? ingresoFijo > 0 && (parseFloat(horas) || 0) > 0
    : totalIngDiarios > 0 && totalHorasInd > 0

  function guardarConfig() { if (puedoConfigurar) setConfigurado(true) }

  function agregarIng() {
    if (!montoIng || !horasIng) return
    setIngresosDiarios(prev => [...prev, { id: nextIngId, monto: parseFloat(montoIng) || 0, horas: parseFloat(horasIng) || 0, desc: descIng, fecha: fechaIng }])
    setNextIngId(n => n + 1)
    setMontoIng(''); setHorasIng(''); setDescIng(''); setFechaIng(hoyISO)
  }

  function agregarGasto() {
    if (!catActiva || !montoGasto) return
    const subLabel = subActiva === 'Otro (editable)' ? (otroEditable || 'Otro') : subActiva
    const desc = [subLabel, descGasto].filter(Boolean).join(' · ')
    setGastos(prev => [{ id: nextId, cat: catActiva.label, emoji: catActiva.emoji, monto: parseFloat(montoGasto) || 0, desc, fecha: fechaGasto }, ...prev])
    setNextId(n => n + 1)
    setMontoGasto(''); setDescGasto(''); setFechaGasto(hoyISO); setSubActiva(''); setOtroEditable(''); setCatActiva(null)
  }

  function seleccionarCat(cat: typeof CATS_PLATA[0]) {
    setCatActiva(cat)
    setSubActiva(cat.subs.length === 0 ? '' : '')
    setOtroEditable('')
    setMontoGasto(''); setDescGasto(''); setFechaGasto(hoyISO)
  }

  const puedeAgregarGasto = !!montoGasto && (!catActiva?.subs.length || !!subActiva)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 mt-3 space-y-4 w-full overflow-hidden">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-[#2D4A6B] text-lg">💰 Mi Plata</h3>
        <button onClick={onClose} className="text-base text-gray-400 hover:text-gray-600 border border-gray-200 rounded px-2 py-1">Cerrar</button>
      </div>

      {/* Tarjeta valor hora */}
      <div className="bg-gray-900 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between mb-3">
          <span className="text-base uppercase tracking-widest text-yellow-400 font-semibold">⏰ Tu valor hora</span>
          {configurado && <button onClick={() => setConfigurado(false)} className="text-base bg-white/10 text-yellow-300 px-3 py-1 rounded-full">editar</button>}
        </div>
        {configurado ? (
          <>
            <p className="text-2xl font-bold mb-1">{formatARS(valorHora)} <span className="text-base text-gray-400">/hora</span></p>
            <p className="text-base text-gray-400">
              {formatARS(ingresoTotal)} · {formatHoras(horasTotal)} · {tipoIngreso === 'dependencia' ? 'Relación de dependencia' : 'Actividad independiente'}
            </p>
          </>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-base text-gray-400 mb-2">Tipo de ingreso</p>
              <div className="flex gap-2">
                {([['dependencia', '👔 En relación de dependencia'], ['independiente', '🧾 Actividad independiente']] as const).map(([val, lbl]) => (
                  <button key={val} onClick={() => setTipoIngreso(val)}
                    className={`flex-1 text-base py-2 px-2 rounded-lg border transition-colors ${tipoIngreso === val ? 'border-yellow-400 bg-yellow-400/10 text-yellow-300' : 'border-white/20 text-gray-400 hover:border-white/40'}`}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            {tipoIngreso === 'dependencia' && (
              <>
                <div>
                  <p className="text-base text-gray-400 mb-1">Sueldo neto mensual ($)</p>
                  <input type="number" value={ingreso} onChange={e => setIngreso(e.target.value)} placeholder="Ej: 850000"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-base text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400" />
                </div>
                <div>
                  <p className="text-base text-gray-400 mb-2">¿Cuántas horas trabajás por mes?</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                    {[['80','medio turno'],['120','6h × día'],['160','full time'],['200','+ extras']].map(([h, sub]) => (
                      <button key={h} onClick={() => setHoras(h)}
                        className={`py-2 rounded-lg text-base border transition-colors ${horas === h ? 'border-yellow-400 bg-yellow-400/10 text-yellow-300' : 'border-white/20 text-gray-400 hover:border-white/40'}`}>
                        <span className="font-bold">{h} h</span><br /><span className="text-base">{sub}</span>
                      </button>
                    ))}
                  </div>
                  <input type="number" value={horas} onChange={e => setHoras(e.target.value)} placeholder="O escribí las horas exactas"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-base text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400" />
                </div>
              </>
            )}

            {tipoIngreso === 'independiente' && (
              <div className="space-y-2">
                <p className="text-base text-gray-400">Cargá cada ingreso con las horas que dedicaste</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-base text-gray-500 mb-1">Monto ($)</p>
                    <input type="number" value={montoIng} onChange={e => setMontoIng(e.target.value)} placeholder="Ej: 80000"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-base text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400" />
                  </div>
                  <div>
                    <p className="text-base text-gray-500 mb-1">Horas afectadas</p>
                    <input type="number" value={horasIng} onChange={e => setHorasIng(e.target.value)} placeholder="Ej: 4"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-base text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-base text-gray-500 mb-1">Fecha</p>
                    <input type="date" value={fechaIng} onChange={e => setFechaIng(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-base text-white focus:outline-none focus:border-yellow-400" />
                  </div>
                  <div>
                    <p className="text-base text-gray-500 mb-1">Descripción</p>
                    <input type="text" value={descIng} onChange={e => setDescIng(e.target.value)} placeholder="Servicio..."
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-base text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400" />
                  </div>
                </div>
                <button onClick={agregarIng} disabled={!montoIng || !horasIng}
                  className="w-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 py-2 rounded-lg text-base font-medium disabled:opacity-40">
                  + Agregar ingreso
                </button>
                {ingresosDiarios.length > 0 && (
                  <div className="space-y-1 max-h-44 overflow-y-auto">
                    {ingresosDiarios.map(i => (
                      <div key={i.id} className="flex justify-between items-center bg-white/5 rounded-lg px-3 py-1.5">
                        <div>
                          <p className="text-base text-white">{i.desc || 'Servicio'} <span className="text-gray-400">· {i.fecha}</span></p>
                          <p className="text-base text-gray-400">{formatARS(i.monto)} · {formatHoras(i.horas)} afectadas → {formatARS(i.horas > 0 ? Math.round(i.monto / i.horas) : 0)}/h</p>
                        </div>
                        <button onClick={() => setIngresosDiarios(prev => prev.filter(x => x.id !== i.id))} className="text-gray-500 hover:text-red-400 text-lg ml-2">×</button>
                      </div>
                    ))}
                    <div className="grid grid-cols-3 gap-1 px-3 py-2 border-t border-white/10 text-center">
                      <div><p className="text-base text-gray-400">Total ingresos</p><p className="text-base font-bold text-yellow-300">{formatARS(totalIngDiarios)}</p></div>
                      <div><p className="text-base text-gray-400">Horas totales</p><p className="text-base font-bold text-yellow-300">{formatHoras(totalHorasInd)}</p></div>
                      <div><p className="text-base text-gray-400">Valor/hora</p><p className="text-base font-bold text-yellow-300">{totalHorasInd > 0 ? formatARS(Math.round(totalIngDiarios / totalHorasInd)) : '—'}</p></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {puedoConfigurar && (
              <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-3 text-center">
                <p className="text-base text-yellow-300 mb-1">tu valor hora será</p>
                <p className="text-2xl font-bold text-yellow-300">{formatARS(Math.round(ingresoTotal / horasTotal))}</p>
              </div>
            )}
            <button onClick={guardarConfig} disabled={!puedoConfigurar}
              className="w-full bg-yellow-400 text-gray-900 font-semibold py-2.5 rounded-lg text-base disabled:opacity-40">
              Calcular mi vida en horas
            </button>
          </div>
        )}
      </div>

      {/* Desglose gastos */}
      {configurado && gastos.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-base font-semibold text-gray-500 uppercase tracking-wider mb-1">🕒 Tu vida este mes se fue así</p>
          <p className="text-base text-gray-400 mb-3">Cada gasto traducido a horas de trabajo</p>
          <div className="space-y-2">
            {gastos.map(g => (
              <div key={g.id} className="flex items-center justify-between bg-red-50 rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{g.emoji}</span>
                  <div>
                    <p className="text-base font-medium text-gray-800">{g.cat}{g.desc ? ` · ${g.desc}` : ''}</p>
                    <p className="text-base text-gray-500">{formatARS(g.monto)} · {g.fecha}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-base font-bold text-red-500">{formatHoras(g.monto / valorHora)}</p>
                    <p className="text-base text-gray-400">{g.monto / valorHora < 24 ? 'menos de un día' : `${(g.monto / valorHora / 24).toFixed(1)} días`}</p>
                  </div>
                  <button onClick={() => setGastos(prev => prev.filter(x => x.id !== g.id))} className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 bg-green-50 border border-green-100 rounded-lg px-4 py-3 flex justify-between items-center">
            <div>
              <p className="text-base text-gray-500 uppercase tracking-wider font-semibold">Te quedan en el mes</p>
              <p className="text-2xl font-bold text-green-700">{formatHoras(horasRestantes)}</p>
            </div>
            <div className="text-right">
              <p className="text-base text-gray-500">o sea</p>
              <p className="text-lg font-bold text-green-700">{formatARS(Math.max(pesoRestante, 0))}</p>
            </div>
          </div>
        </div>
      )}

      {/* Categorías de gasto */}
      {configurado && (
        <div>
          <p className="text-base font-semibold text-gray-500 uppercase tracking-wider mb-3">⚡ Tocá una categoría para cargar gasto</p>
          {catActiva ? (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{catActiva.emoji}</span>
                <p className="font-medium text-gray-800">{catActiva.label}</p>
                <button onClick={() => setCatActiva(null)} className="ml-auto text-base text-gray-400 hover:text-gray-600">✕ cancelar</button>
              </div>

              {/* Subcategorías */}
              {catActiva.subs.length > 0 && (
                <div>
                  <p className="text-base text-gray-500 mb-1">Subcategoría</p>
                  <div className="flex flex-wrap gap-2">
                    {catActiva.subs.map(s => (
                      <button key={s} onClick={() => setSubActiva(s)}
                        className={`px-3 py-1.5 rounded-lg text-base border transition-colors ${subActiva === s ? 'border-[#2D4A6B] bg-[#2D4A6B] text-white' : 'border-gray-200 text-gray-600 hover:border-[#2D4A6B]'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                  {subActiva === 'Otro (editable)' && (
                    <input type="text" value={otroEditable} onChange={e => setOtroEditable(e.target.value)} placeholder="Escribí el concepto..."
                      className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-base focus:outline-none focus:border-[#2D4A6B]" />
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-base text-gray-500 mb-1">Monto ($)</p>
                  <input type="number" value={montoGasto} onChange={e => setMontoGasto(e.target.value)} placeholder="0"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base focus:outline-none focus:border-[#2D4A6B]" />
                </div>
                <div>
                  <p className="text-base text-gray-500 mb-1">Fecha</p>
                  <input type="date" value={fechaGasto} onChange={e => setFechaGasto(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base focus:outline-none focus:border-[#2D4A6B]" />
                </div>
              </div>
              <input type="text" value={descGasto} onChange={e => setDescGasto(e.target.value)} placeholder="Descripción (opcional)"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base focus:outline-none focus:border-[#2D4A6B]" />
              {montoGasto && valorHora > 0 && (
                <div className="bg-orange-50 rounded-lg p-2 text-center">
                  <p className="text-base text-gray-500">Este gasto equivale a</p>
                  <p className="text-lg font-bold text-[#FF7043]">{formatHoras(parseFloat(montoGasto) / valorHora)} de trabajo</p>
                </div>
              )}
              <button onClick={agregarGasto} disabled={!puedeAgregarGasto}
                className="w-full bg-[#2D4A6B] text-white py-2.5 rounded-lg text-base font-medium disabled:opacity-40">
                Agregar gasto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {CATS_PLATA.map(cat => (
                <button key={cat.key} onClick={() => seleccionarCat(cat)}
                  className="flex flex-col items-center justify-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl py-3 px-2 transition-colors">
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className="text-base text-gray-700 font-medium text-center leading-tight">{cat.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!configurado && (
        <p className="text-base text-gray-400 text-center">Configurá tu valor hora para empezar a cargar gastos</p>
      )}

      {/* Informe del período */}
      {configurado && (ingresoTotal > 0 || gastos.length > 0) && (
        <InformePlata
          tipoIngreso={tipoIngreso}
          ingresoTotal={ingresoTotal}
          horasTotal={horasTotal}
          valorHora={valorHora}
          ingresosDiarios={ingresosDiarios}
          gastos={gastos}
          totalGastos={totalGastos}
          pesoRestante={pesoRestante}
        />
      )}
    </div>
  )
}

type InformePlataProps = {
  tipoIngreso: 'dependencia' | 'independiente'
  ingresoTotal: number
  horasTotal: number
  valorHora: number
  ingresosDiarios: IngDiario[]
  gastos: GastoPlata[]
  totalGastos: number
  pesoRestante: number
}

function InformePlata({ tipoIngreso, ingresoTotal, horasTotal, valorHora, ingresosDiarios, gastos, totalGastos, pesoRestante }: InformePlataProps) {
  const [abierto, setAbierto] = useState(false)

  const ahora = new Date()
  const periodo = ahora.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

  // Agrupar gastos por categoría
  const porCategoria: Record<string, number> = {}
  gastos.forEach(g => {
    porCategoria[g.cat] = (porCategoria[g.cat] || 0) + g.monto
  })

  function formatHoras(h: number) {
    const hh = Math.floor(Math.abs(h))
    const mm = Math.round((Math.abs(h) - hh) * 60)
    return `${hh} h${mm > 0 ? ` ${mm} min` : ''}`
  }

  return (
    <div className="border border-[#2D4A6B]/20 rounded-xl overflow-hidden">
      <button onClick={() => setAbierto(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#2D4A6B] text-white text-base font-semibold">
        <span>📄 Informe del período — {periodo}</span>
        <span className="text-lg">{abierto ? '▲' : '▼'}</span>
      </button>

      {abierto && (
        <div className="p-4 space-y-4 text-base">

          {/* Encabezado */}
          <div className="text-center border-b border-gray-100 pb-3">
            <p className="text-base text-gray-400 uppercase tracking-wider">IApoyo Consultora · Mi Plata</p>
            <p className="font-bold text-[#2D4A6B] text-lg capitalize">{periodo}</p>
            <p className="text-base text-gray-500">{tipoIngreso === 'dependencia' ? 'Relación de dependencia' : 'Actividad independiente'}</p>
          </div>

          {/* Ingresos */}
          <div>
            <p className="text-base font-bold text-gray-500 uppercase tracking-wider mb-2">💰 Ingresos</p>
            {tipoIngreso === 'dependencia' ? (
              <div className="flex justify-between bg-green-50 rounded-lg px-3 py-2">
                <span className="text-gray-700">Sueldo neto</span>
                <span className="font-bold text-green-700">{formatARS(ingresoTotal)}</span>
              </div>
            ) : (
              <div className="space-y-1">
                {ingresosDiarios.map(i => (
                  <div key={i.id} className="flex justify-between items-center bg-green-50 rounded-lg px-3 py-1.5">
                    <div>
                      <p className="text-gray-700 text-base">{i.desc || 'Servicio'}</p>
                      <p className="text-base text-gray-400">{i.fecha} · {formatHoras(i.horas)}</p>
                    </div>
                    <span className="font-bold text-green-700 text-base">{formatARS(i.monto)}</span>
                  </div>
                ))}
                <div className="flex justify-between px-3 py-1.5 border-t border-green-100 font-bold">
                  <span className="text-gray-700">Total ingresos</span>
                  <span className="text-green-700">{formatARS(ingresoTotal)}</span>
                </div>
              </div>
            )}
            <div className="flex justify-between px-3 py-1 mt-1 text-base text-gray-500">
              <span>Horas trabajadas</span>
              <span>{formatHoras(horasTotal)} · {formatARS(valorHora)}/h</span>
            </div>
          </div>

          {/* Gastos por categoría */}
          {gastos.length > 0 && (
            <div>
              <p className="text-base font-bold text-gray-500 uppercase tracking-wider mb-2">💸 Gastos por categoría</p>
              <div className="space-y-1">
                {Object.entries(porCategoria).sort((a, b) => b[1] - a[1]).map(([cat, total]) => (
                  <div key={cat} className="flex justify-between bg-red-50 rounded-lg px-3 py-1.5">
                    <span className="text-gray-700 text-base">{cat}</span>
                    <span className="font-semibold text-red-600 text-base">{formatARS(total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gastos detallados */}
          {gastos.length > 0 && (
            <div>
              <p className="text-base font-bold text-gray-500 uppercase tracking-wider mb-2">🧾 Detalle de gastos</p>
              <div className="space-y-1">
                {[...gastos].sort((a, b) => a.fecha.localeCompare(b.fecha)).map(g => (
                  <div key={g.id} className="flex justify-between items-center border-b border-gray-50 px-1 py-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{g.emoji}</span>
                      <div>
                        <p className="text-base text-gray-700">{g.cat}{g.desc ? ` · ${g.desc}` : ''}</p>
                        <p className="text-base text-gray-400">{g.fecha}</p>
                      </div>
                    </div>
                    <span className="text-base font-semibold text-gray-700">{formatARS(g.monto)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resumen final */}
          <div className="bg-[#2D4A6B] rounded-xl p-4 text-white space-y-2">
            <div className="flex justify-between text-base">
              <span className="text-white/70">Total ingresos</span>
              <span className="font-bold text-green-300">{formatARS(ingresoTotal)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-white/70">Total gastos</span>
              <span className="font-bold text-red-300">{formatARS(totalGastos)}</span>
            </div>
            <div className="flex justify-between text-base border-t border-white/20 pt-2">
              <span className="font-semibold">Resultado del mes</span>
              <span className={`font-bold text-lg ${pesoRestante >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {pesoRestante >= 0 ? '+' : ''}{formatARS(pesoRestante)}
              </span>
            </div>
            {ingresoTotal > 0 && totalGastos > 0 && (
              <p className="text-base text-white/50 text-center pt-1">
                Gastaste el {Math.round((totalGastos / ingresoTotal) * 100)}% de tus ingresos
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Panel pConstruccion (Cálculo de Materiales) ──────────────────────────────
const LADRILLOS: Record<string, { label: string; cemento: number; cal: number; arena: number; ladrillos: number }> = {
  'comun_15': { label: 'Ladrillo común 15 cm', cemento: 8.09, cal: 7.88, arena: 0.038, ladrillos: 58 },
  'comun_30': { label: 'Ladrillo común 30 cm', cemento: 16.18, cal: 16.28, arena: 0.080, ladrillos: 116 },
  'comun_45': { label: 'Ladrillo común 45 cm', cemento: 24.27, cal: 24.42, arena: 0.120, ladrillos: 174 },
  'hueco_8':  { label: 'Ladrillo hueco 8x18x33', cemento: 0.99, cal: 1.89, arena: 0.009, ladrillos: 15.20 },
  'hueco_12': { label: 'Ladrillo hueco 12x18x33', cemento: 1.48, cal: 2.83, arena: 0.014, ladrillos: 15.20 },
  'hueco_18': { label: 'Ladrillo hueco 18x18x33', cemento: 2.22, cal: 4.24, arena: 0.021, ladrillos: 15.20 },
  'bloque_10': { label: 'Bloque cemento portante 19x10x39', cemento: 0.76, cal: 0.98, arena: 0.009, ladrillos: 12.50 },
  'bloque_13': { label: 'Bloque cemento portante 19x13x39', cemento: 0.97, cal: 1.22, arena: 0.012, ladrillos: 12.50 },
  'bloque_15': { label: 'Bloque cemento portante 19x15x39', cemento: 1.15, cal: 1.46, arena: 0.014, ladrillos: 12.50 },
  'bloque_20': { label: 'Bloque cemento portante 19x20x39', cemento: 1.53, cal: 1.95, arena: 0.018, ladrillos: 12.50 },
}

function PanelConstruccion({ onClose }: { onClose: () => void }) {
  const [longitud, setLongitud] = useState('')
  const [altura, setAltura] = useState('')
  const [desperdicio, setDesperdicio] = useState('0')
  const [tipo, setTipo] = useState('comun_15')
  const [resultado, setResultado] = useState<null | {
    superficie: number; superficieFinal: number;
    cemento: number; cal: number; arena: number; ladrillos: number
  }>(null)

  function calcular() {
    const lon = parseFloat(longitud) || 0
    const alt = parseFloat(altura) || 0
    const des = parseFloat(desperdicio) || 0
    if (!lon || !alt) return
    const sup = lon * alt
    const supFinal = sup * (1 + des / 100)
    const c = LADRILLOS[tipo]
    setResultado({
      superficie: sup,
      superficieFinal: supFinal,
      cemento: supFinal * c.cemento,
      cal: supFinal * c.cal,
      arena: supFinal * c.arena,
      ladrillos: Math.ceil(supFinal * c.ladrillos),
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 mt-3 w-full overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-[#2D4A6B] text-lg">🧱 Muro Simple</h3>
        <button onClick={onClose} className="text-base text-gray-400 hover:text-gray-600 border border-gray-200 rounded px-2 py-1">Cerrar</button>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Longitud (m)</label>
            <input type="number" value={longitud} onChange={e => setLongitud(e.target.value)} placeholder="Ej: 5"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A6B]" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Altura (m)</label>
            <input type="number" value={altura} onChange={e => setAltura(e.target.value)} placeholder="Ej: 3"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A6B]" />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Tipo de ladrillo</label>
          <select value={tipo} onChange={e => setTipo(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A6B]">
            {Object.entries(LADRILLOS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Desperdicio (%)</label>
          <input type="number" value={desperdicio} onChange={e => setDesperdicio(e.target.value)} placeholder="0"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A6B]" />
        </div>

        <button onClick={calcular}
          className="w-full bg-[#2D4A6B] text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-[#1e3350] transition">
          Calcular materiales
        </button>

        {resultado && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2 mt-2">
            <p className="font-semibold text-[#2D4A6B] text-sm mb-3">Materiales necesarios</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-gray-500 text-xs">Superficie neta</p>
                <p className="font-bold text-[#2D4A6B]">{resultado.superficie.toFixed(2)} m²</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-gray-500 text-xs">Superficie c/desperdicio</p>
                <p className="font-bold text-[#2D4A6B]">{resultado.superficieFinal.toFixed(2)} m²</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-gray-500 text-xs">Cemento</p>
                <p className="font-bold text-[#2D4A6B]">{resultado.cemento.toFixed(1)} kg</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-gray-500 text-xs">Cal hidratada</p>
                <p className="font-bold text-[#2D4A6B]">{resultado.cal.toFixed(1)} kg</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-gray-500 text-xs">Arena</p>
                <p className="font-bold text-[#2D4A6B]">{resultado.arena.toFixed(3)} m³</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-gray-500 text-xs">Ladrillos</p>
                <p className="font-bold text-[#2D4A6B]">{resultado.ladrillos.toLocaleString()} u.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Panel pMuroDoble ─────────────────────────────────────────────────────────
function PanelMuroDoble({ onClose }: { onClose: () => void }) {
  const [longitud, setLongitud] = useState('')
  const [altura, setAltura] = useState('')
  const [desperdicio, setDesperdicio] = useState('0')
  const [tipo, setTipo] = useState('comun_15')
  const [resultado, setResultado] = useState<null | {
    superficie: number; superficieFinal: number
    cemento: number; cal: number; arena: number; ladrillos: number
  }>(null)

  function calcular() {
    const lon = parseFloat(longitud) || 0
    const alt = parseFloat(altura) || 0
    const des = parseFloat(desperdicio) || 0
    if (!lon || !alt) return
    const sup = lon * alt
    const supFinal = sup * (1 + des / 100)
    const c = LADRILLOS[tipo]
    setResultado({
      superficie: sup,
      superficieFinal: supFinal,
      cemento: supFinal * c.cemento * 2,
      cal: supFinal * c.cal * 2,
      arena: supFinal * c.arena * 2,
      ladrillos: Math.ceil(supFinal * c.ladrillos * 2),
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 mt-3 w-full overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-[#2D4A6B] text-lg">🧱🧱 Muro Doble</h3>
        <button onClick={onClose} className="text-base text-gray-400 hover:text-gray-600 border border-gray-200 rounded px-2 py-1">Cerrar</button>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Longitud (m)</label>
            <input type="number" value={longitud} onChange={e => setLongitud(e.target.value)} placeholder="Ej: 5"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A6B]" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Altura (m)</label>
            <input type="number" value={altura} onChange={e => setAltura(e.target.value)} placeholder="Ej: 3"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A6B]" />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Tipo de ladrillo</label>
          <select value={tipo} onChange={e => setTipo(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A6B]">
            {Object.entries(LADRILLOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Desperdicio (%)</label>
          <input type="number" value={desperdicio} onChange={e => setDesperdicio(e.target.value)} placeholder="0"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A6B]" />
        </div>

        <button onClick={calcular}
          className="w-full bg-[#2D4A6B] text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-[#1e3350] transition">
          Calcular materiales
        </button>

        {resultado && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2 mt-2">
            <p className="font-semibold text-[#2D4A6B] text-sm mb-3">Materiales necesarios</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-gray-500 text-xs">Superficie neta</p>
                <p className="font-bold text-[#2D4A6B]">{resultado.superficie.toFixed(2)} m²</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-gray-500 text-xs">Superficie c/desperdicio</p>
                <p className="font-bold text-[#2D4A6B]">{resultado.superficieFinal.toFixed(2)} m²</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-gray-500 text-xs">Cemento</p>
                <p className="font-bold text-[#2D4A6B]">{resultado.cemento.toFixed(1)} kg</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-gray-500 text-xs">Cal hidratada</p>
                <p className="font-bold text-[#2D4A6B]">{resultado.cal.toFixed(1)} kg</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-gray-500 text-xs">Arena total</p>
                <p className="font-bold text-[#2D4A6B]">{resultado.arena.toFixed(3)} m³</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-gray-500 text-xs">Arena</p>
                <p className="font-bold text-[#2D4A6B]">{resultado.arena.toFixed(3)} m³</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-gray-500 text-xs">Ladrillos</p>
                <p className="font-bold text-[#2D4A6B]">{resultado.ladrillos.toLocaleString()} u.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Tipos de malla para contrapiso ──────────────────────────────────────────
const MALLAS_CONTRAPISO: Record<string, { label: string; detalle: string }> = {
  'r188': { label: 'Malla SIMA R-188', detalle: '15×25 cm Ø6 mm' },
  'q84':  { label: 'Malla SIMA Q-84',  detalle: '15×15 cm Ø4 mm' },
}

// ─── Panel pContrapiso ────────────────────────────────────────────────────────
function PanelContrapiso({ onClose }: { onClose: () => void }) {
  const [largo, setLargo] = useState('')
  const [ancho, setAncho] = useState('')
  const [espesor, setEspesor] = useState('8')
  const [desperdicio, setDesperdicio] = useState('0')
  const [tipoMalla, setTipoMalla] = useState('r188')
  const [resultado, setResultado] = useState<null | {
    superficie: number; superficieFinal: number; volumen: number
    cemento: number; arena: number; piedra: number; malla: number; labelMalla: string
  }>(null)

  function calcular() {
    const l = parseFloat(largo) || 0
    const a = parseFloat(ancho) || 0
    const e = parseFloat(espesor) || 0
    const d = parseFloat(desperdicio) || 0
    if (!l || !a || !e) return
    const sup = l * a
    const supFinal = sup * (1 + d / 100)
    const vol = supFinal * (e / 100)
    setResultado({
      superficie: sup,
      superficieFinal: supFinal,
      volumen: vol,
      cemento: vol * 300,
      arena: vol * 0.65,
      piedra: vol * 0.65,
      malla: supFinal * 1.05,
      labelMalla: MALLAS_CONTRAPISO[tipoMalla].label,
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 mt-3 w-full overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-[#2D4A6B] text-lg">🏗️ Contrapiso</h3>
        <button onClick={onClose} className="text-base text-gray-400 hover:text-gray-600 border border-gray-200 rounded px-2 py-1">Cerrar</button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Tipo de malla</label>
          <select value={tipoMalla} onChange={e => setTipoMalla(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A6B]">
            {Object.entries(MALLAS_CONTRAPISO).map(([k, v]) => (
              <option key={k} value={k}>{v.label} ({v.detalle})</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Largo (m)</label>
            <input type="number" value={largo} onChange={e => setLargo(e.target.value)} placeholder="Ej: 6"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A6B]" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Ancho (m)</label>
            <input type="number" value={ancho} onChange={e => setAncho(e.target.value)} placeholder="Ej: 3"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A6B]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Espesor (cm)</label>
            <input type="number" value={espesor} onChange={e => setEspesor(e.target.value)} placeholder="Ej: 8"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A6B]" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Desperdicio (%)</label>
            <input type="number" value={desperdicio} onChange={e => setDesperdicio(e.target.value)} placeholder="0"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A6B]" />
          </div>
        </div>

        <button onClick={calcular}
          className="w-full bg-[#2D4A6B] text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-[#1e3350] transition">
          Calcular materiales
        </button>

        {resultado && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2 mt-2">
            <p className="font-semibold text-[#2D4A6B] text-sm mb-3">Materiales necesarios</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-gray-500 text-xs">Superficie neta</p>
                <p className="font-bold text-[#2D4A6B]">{resultado.superficie.toFixed(2)} m²</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-gray-500 text-xs">Superficie c/desperdicio</p>
                <p className="font-bold text-[#2D4A6B]">{resultado.superficieFinal.toFixed(2)} m²</p>
              </div>
              <div className="col-span-2 bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-gray-500 text-xs">Volumen de contrapiso</p>
                <p className="font-bold text-[#2D4A6B]">{resultado.volumen.toFixed(3)} m³</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-gray-500 text-xs">Cemento</p>
                <p className="font-bold text-[#2D4A6B]">{resultado.cemento.toFixed(1)} kg</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-gray-500 text-xs">Arena</p>
                <p className="font-bold text-[#2D4A6B]">{resultado.arena.toFixed(3)} m³</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-gray-500 text-xs">Piedra partida</p>
                <p className="font-bold text-[#2D4A6B]">{resultado.piedra.toFixed(3)} m³</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-gray-500 text-xs">{resultado.labelMalla}</p>
                <p className="font-bold text-[#2D4A6B]">{resultado.malla.toFixed(2)} m²</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function IApoyoPage() {
  const [modulo, setModulo] = useState<ModuleId | null>(null)
  const [openPanels, setOpenPanels] = useState<Set<string>>(new Set())
  const [consultaTexto, setConsultaTexto] = useState('')
  const [consultaEnviada, setConsultaEnviada] = useState(false)
  const [consultaLoading, setConsultaLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  function togglePanel(panelId: string) {
    setOpenPanels(prev => {
      const next = new Set(prev)
      if (next.has(panelId)) next.delete(panelId)
      else next.add(panelId)
      return next
    })
  }

  function closePanel(panelId: string) {
    setOpenPanels(prev => { const n = new Set(prev); n.delete(panelId); return n })
  }

  async function enviarConsulta() {
    if (!consultaTexto.trim() || consultaLoading) return
    setConsultaLoading(true)
    try {
      const eco = modulo ? ECOSISTEMAS[modulo] : null
      await fetch('/api/consulta-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modulo: eco?.titulo ?? modulo ?? 'General', consulta: consultaTexto }),
      })
      setConsultaEnviada(true)
      setConsultaTexto('')
    } catch {
      // silencioso, igual mostramos confirmación
      setConsultaEnviada(true)
    } finally {
      setConsultaLoading(false)
    }
  }

  function handleEcoBtn(btn: EcoBtn) {
    if (btn.action === 'chat' && btn.chatMsg) {
      setConsultaTexto(btn.chatMsg)
    } else if (btn.action === 'panel' && btn.panelId) {
      togglePanel(btn.panelId)
    }
  }

  function selectModulo(id: ModuleId) {
    setModulo(id)
    setOpenPanels(new Set())
    setConsultaTexto('')
    setConsultaEnviada(false)
  }

  function goBack() {
    setModulo(null)
    setOpenPanels(new Set())
    setConsultaTexto('')
    setConsultaEnviada(false)
  }

  const eco = modulo ? ECOSISTEMAS[modulo] : null

  return (
    <AuthGuard>
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 overflow-x-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-auto min-w-0">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#2D4A6B] to-[#3d6a9e] px-4 py-3 flex items-center gap-3">
            <Image src="/logo.png" alt="IApoyo" width={44} height={48} className="flex-shrink-0" />
            <div className="flex-1">
              <h1 className="text-white font-bold text-base leading-tight">IApoyo Consultora</h1>
              <p className="text-blue-200 text-xs">Seleccioná un módulo</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col p-3 md:p-6 pb-24 md:pb-6">
            {/* Module Grid */}
            {!modulo && (
              <div className="grid grid-cols-3 md:grid-cols-3 gap-3">
                {MODULOS_GRID.map(m => (
                  <button key={m.id} onClick={() => selectModulo(m.id)}
                    className="bg-white border-2 border-gray-200 rounded-xl p-4 text-left hover:border-[#4CAF50] hover:shadow-sm transition-all flex flex-col items-center text-center gap-1">
                    {m.id === 'marcas' ? (
                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2b/RegisteredTM.svg" alt="®" className="w-8 h-8" />
                    ) : (
                      <span className="text-3xl">{m.emoji}</span>
                    )}
                    <span className="text-base font-semibold text-[#2D4A6B] leading-tight">{m.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Ecosistema */}
            {modulo && eco && (
              <div className="space-y-2 flex-1 flex flex-col">
                {/* Back + title */}
                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-3">
                  <button onClick={goBack} className="text-[#2D4A6B] hover:text-[#1e3350]">
                    <ArrowLeft size={18} />
                  </button>
                  {modulo === 'marcas' ? (
                    <span className="font-semibold text-[#2D4A6B] text-base flex items-center gap-1">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2b/RegisteredTM.svg" alt="®" className="w-4 h-4" /> {eco.titulo}
                    </span>
                  ) : (
                    <span className="font-semibold text-[#2D4A6B] text-base">{MODULOS_GRID.find(m => m.id === modulo)?.emoji} {eco.titulo}</span>
                  )}
                </div>

                {/* Quick question buttons */}
                <div className="flex flex-wrap gap-1.5">
                  {eco.btns.map((btn, i) => (
                    <button key={i} onClick={() => handleEcoBtn(btn)}
                      className={`px-3 py-2.5 rounded-lg text-base font-medium border transition-colors ${
                        btn.action === 'panel' && openPanels.has(btn.panelId!)
                          ? 'border-[#FF7043] bg-orange-50 text-[#FF7043]'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-[#2D4A6B] hover:text-[#2D4A6B]'
                      }`}>
                      {btn.label}
                    </button>
                  ))}
                </div>

                {/* Panels */}
                {openPanels.has('pNombre') && <PanelNombre onClose={() => closePanel('pNombre')} />}
                {openPanels.has('pInden') && <PanelInden onClose={() => closePanel('pInden')} />}
                {openPanels.has('pCosto') && <PanelCosto onClose={() => closePanel('pCosto')} />}
                {openPanels.has('pAlquiler') && <PanelAlquiler onClose={() => closePanel('pAlquiler')} />}
                {openPanels.has('pPatente') && <PanelPatente onClose={() => closePanel('pPatente')} />}
                {openPanels.has('pMkt') && <PanelMkt onClose={() => closePanel('pMkt')} />}
                {openPanels.has('pPlata') && <PanelMiPlata onClose={() => closePanel('pPlata')} />}
                {openPanels.has('pConstruccion') && <PanelConstruccion onClose={() => closePanel('pConstruccion')} />}
                {openPanels.has('pMuroDoble') && <PanelMuroDoble onClose={() => closePanel('pMuroDoble')} />}
                {openPanels.has('pContrapiso') && <PanelContrapiso onClose={() => closePanel('pContrapiso')} />}

                {/* Formulario de consulta */}
                <div className="flex-1 flex flex-col mt-2" ref={endRef}>
                  {consultaEnviada ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                      <p className="text-2xl mb-2">✅</p>
                      <p className="font-semibold text-green-800 text-base">¡Consulta enviada!</p>
                      <p className="text-green-700 text-sm mt-1">El equipo de IApoyo te va a contactar a la brevedad.</p>
                      <button onClick={() => setConsultaEnviada(false)}
                        className="mt-4 text-sm text-green-700 underline">Hacer otra consulta</button>
                    </div>
                  ) : (
                    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                      <p className="text-sm text-gray-500">Escribí tu consulta y te respondemos por email o WhatsApp.</p>
                      <textarea
                        value={consultaTexto}
                        onChange={e => setConsultaTexto(e.target.value)}
                        placeholder="Escribí tu consulta..."
                        rows={4}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#2D4A6B] resize-none"
                      />
                      <button
                        onClick={enviarConsulta}
                        disabled={consultaLoading || !consultaTexto.trim()}
                        className="w-full flex items-center justify-center gap-2 bg-[#2D4A6B] text-white py-3 rounded-xl font-semibold text-base hover:bg-[#1e3350] disabled:opacity-40 transition">
                        {consultaLoading ? 'Enviando...' : <><Send size={14} /> Enviar consulta</>}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

    </AuthGuard>
  )
}
